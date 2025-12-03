/* ================================
   CONFIG — адреса mock API (json-server)
================================ */
const API_ROOT = "http://localhost:3000";

/* ================================
   ELEMENTS — посилання на елементи HTML
================================ */
const serviceSelect = document.getElementById("serviceSelect");
const timeslotsDiv = document.getElementById("timeslots");
const timeslotsState = document.getElementById("timeslots-state");

const bookingSection = document.getElementById("booking-section");
const bookingForm = document.getElementById("bookingForm");
const bookingState = document.getElementById("booking-state");

const bookingsList = document.getElementById("bookingsList");
const viewBookingsBtn = document.getElementById("viewBookings");
const cancelBookingBtn = document.getElementById("cancelBooking");

/* Змінні стану */
let selectedSlot = null;   // обраний таймслот
let servicesCache = null;  // кеш послуг (performance-first)

/* ================================
   HELPERS — допоміжні функції
================================ */

/**
 * Показати стан (loading / error / success / empty) в елементі.
 */
function showState(elem, text = "", cls = "") {
  elem.textContent = text;
  elem.className = `state ${cls}`;
}

/**
 * Перетворення ISO-рядка у читабельний UTC-час.
 * Використовуємо ISO 8601 + UTC згідно NFR.
 */
function formatISOToUTC(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toUTCString();
}

/* ================================
   LOAD SERVICES — завантаження послуг
================================ */
async function loadServices() {
  try {
    showState(timeslotsState, "Завантаження послуг…", "loading");

    const res = await fetch(`${API_ROOT}/services`);
    if (!res.ok) throw new Error("services_fetch_error");

    servicesCache = await res.json();
    serviceSelect.innerHTML = "";

    if (!servicesCache.length) {
      showState(timeslotsState, "Послуги відсутні", "empty");
      return;
    }

    for (const s of servicesCache) {
      const opt = document.createElement("option");
      opt.value = s.service_id;
      opt.textContent = s.name;
      serviceSelect.appendChild(opt);
    }

    showState(timeslotsState, "");
    await loadTimeslots();
  } catch (e) {
    showState(timeslotsState, "Помилка завантаження послуг", "error");
  }
}

/* ================================
   LOAD TIMESLOTS — завантаження таймслотів
================================ */
async function loadTimeslots() {
  const serviceId = serviceSelect.value;

  if (!serviceId) {
    showState(timeslotsState, "Послуга не вибрана", "empty");
    return;
  }

  showState(timeslotsState, "Завантаження таймслотів…", "loading");

  try {
    const res = await fetch(`${API_ROOT}/timeslots?service_id=${serviceId}`);
    if (!res.ok) throw new Error("timeslots_fetch_error");

    const slots = await res.json();
    await renderTimeslots(slots);
  } catch (e) {
    showState(timeslotsState, "Не вдалося завантажити слоти", "error");
  }
}

/* ================================
   RENDER TIMESLOTS — відображення таймслотів
  рахуємо, скільки місць уже заброньовано.
================================ */
async function renderTimeslots(slots) {
  timeslotsDiv.innerHTML = "";

  if (!slots.length) {
    showState(timeslotsState, "Слоти відсутні", "empty");
    return;
  }

  let bookings = [];
  try {
    const res = await fetch(`${API_ROOT}/bookings`);
    if (res.ok) {
      bookings = await res.json();
    }
  } catch (_) {
    // якщо помилка — просто вважаємо, що бронювань немає
  }

  let hasAvailable = false;

  for (const slot of slots) {
    const slotBookings = bookings.filter(
      (b) => b.slot_id === slot.timeslot_id && b.status === "confirmed"
    );

    const booked = slotBookings.length;
    const available = slot.capacity - booked;

    const btn = document.createElement("button");
    btn.className = "slot-btn";
    btn.textContent = `${formatISOToUTC(slot.start)} (${available}/${slot.capacity})`;
    btn.setAttribute("aria-label", `slot_${slot.timeslot_id}`);

    if (available <= 0) {
      // слот повністю заповнений
      btn.disabled = true;
      btn.classList.add("slot-full");
      btn.title = "Слот заповнений";
    } else {
      hasAvailable = true;
      btn.onclick = () => {
        selectedSlot = slot;
        bookingSection.hidden = false;
        showState(
          bookingState,
          `Обраний слот: ${formatISOToUTC(slot.start)}`,
          ""
        );
      };
    }

    timeslotsDiv.appendChild(btn);
  }

  showState(
    timeslotsState,
    hasAvailable ? "" : "Усі слоти зайняті",
    hasAvailable ? "" : "empty"
  );
}

/* ================================
   CREATE BOOKING — створення бронювання
================================ */
bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!selectedSlot) {
    showState(bookingState, "Спочатку виберіть слот", "error");
    return;
  }

  const name = document.getElementById("clientName").value.trim();
  const contact = document.getElementById("contact").value.trim();

  if (!name || !contact) {
    showState(bookingState, "Заповніть всі поля", "error");
    return;
  }

  showState(bookingState, "Перевірка місць…", "loading");

  try {
    // перевіряємо, скільки вже є confirmed бронювань для цього слоту
    const resChk = await fetch(
      `${API_ROOT}/bookings?slot_id=${selectedSlot.timeslot_id}`
    );
    const existing = await resChk.json();

    const confirmedCount = existing.filter(
      (b) => b.status === "confirmed"
    ).length;

    if (confirmedCount >= selectedSlot.capacity) {
      // NFR: стабільний код помилки BOOKING_FULL
      showState(
        bookingState,
        "Цей слот вже заповнений (error_code: BOOKING_FULL)",
        "error"
      );
      return;
    }

    const payload = {
      service_id: selectedSlot.service_id,
      slot_id: selectedSlot.timeslot_id,
      client_name: name,
      contact,
      status: "confirmed",
      created_at: new Date().toISOString(), // ISO 8601
    };

    const res = await fetch(`${API_ROOT}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("booking_create_error");

    showState(bookingState, "Бронювання успішне!", "success");

    bookingForm.reset();
    bookingSection.hidden = true;
    selectedSlot = null;

    // оновлюємо таймслоти, бо capacity змінилася
    await loadTimeslots();
  } catch (err) {
    showState(bookingState, "Помилка створення бронювання", "error");
  }
});

/* ================================
   CANCEL BOOKING FORM — скидання форми
================================ */
cancelBookingBtn.onclick = () => {
  bookingForm.reset();
  bookingSection.hidden = true;
  selectedSlot = null;
  showState(bookingState, "");
};

/* ================================
   SHOW ALL BOOKINGS — демо-перегляд усіх бронювань
   Формат: Ім'я — дата/час — послуга — контакт
================================ */
viewBookingsBtn.onclick = async () => {
  bookingsList.textContent = "Завантаження…";

  try {
    const res = await fetch(`${API_ROOT}/bookings`);
    if (!res.ok) throw new Error("bookings_fetch_error");

    const bookings = await res.json();

    if (!bookings.length) {
      bookingsList.textContent = "Немає бронювань";
      return;
    }

    // гарантуємо, що послуги є в кеші
    if (!servicesCache) {
      const resServices = await fetch(`${API_ROOT}/services`);
      servicesCache = await resServices.json();
    }

    // завантажуємо всі таймслоти разом
    let timeslots = [];
    try {
      const resSlots = await fetch(`${API_ROOT}/timeslots`);
      if (resSlots.ok) {
        timeslots = await resSlots.json();
      }
    } catch (_) {
      timeslots = [];
    }

    const serviceById = new Map(
      servicesCache.map((s) => [s.service_id, s])
    );
    const slotById = new Map(
      timeslots.map((t) => [t.timeslot_id, t])
    );

    bookingsList.innerHTML = "";

    for (const b of bookings) {
      const item = document.createElement("div");
      item.className = "booking-item";

      const slot = slotById.get(b.slot_id);
      const service =
        (slot && serviceById.get(slot.service_id)) ||
        serviceById.get(b.service_id);

      const dateFormatted = slot?.start
        ? formatISOToUTC(slot.start)
        : "невідома дата";

      const serviceName = service?.name || "Невідома послуга";

      item.textContent = `${b.client_name} — ${dateFormatted} — ${serviceName} — ${b.contact}`;
      bookingsList.appendChild(item);
    }
  } catch (_) {
    bookingsList.textContent = "Не вдалося завантажити";
  }
};

/* ================================
   INIT — старт застосунку
================================ */
serviceSelect.addEventListener("change", loadTimeslots);
document.addEventListener("DOMContentLoaded", loadServices);

