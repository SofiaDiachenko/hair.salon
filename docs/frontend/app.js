/* ================================
   CONFIG — налаштування API
   вказуємо адресу нашого mock-сервера json-server.
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

// Вибраний слот для бронювання (записуємо об’єкт timeslot)
let selectedSlot = null;

// Кеш для списку послуг 
let servicesCache = null;

function showState(elem, text = "", cls = "") {
  elem.textContent = text;
  elem.className = `state ${cls}`;
}

/**
 * formatISOToUTC(iso)
 * Перетворює ISO-дату з сервера у зрозумілий час у форматі UTC.
 */
function formatISOToUTC(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toUTCString();
}

/* ================================
   LOAD SERVICES — завантаження послуг
   1) показуємо "завантаження"
   2) робимо GET /services
   3) зберігаємо результат у servicesCache
   4) наповнюємо select
================================ */
async function loadServices() {
  try {
    showState(timeslotsState, "Завантаження послуг…", "loading");

    const res = await fetch(`${API_ROOT}/services`);
    if (!res.ok) throw new Error("services_fetch_error");

    // зберігаємо послуги в кеш (performance-first)
    servicesCache = await res.json();
    serviceSelect.innerHTML = "";

    // якщо послуг немає — показуємо empty-стан
    if (!servicesCache.length) {
      showState(timeslotsState, "Послуги відсутні", "empty");
      return;
    }

    // створюємо <option> для кожної послуги
    for (const s of servicesCache) {
      const opt = document.createElement("option");
      opt.value = s.service_id; // будемо використовувати service_id в запитах
      opt.textContent = s.name;
      serviceSelect.appendChild(opt);
    }

    // очищаємо повідомлення про стан
    showState(timeslotsState, "");

    // одразу завантажуємо таймслоти для першої послуги
    loadTimeslots();
  } catch (e) {
    // помилка завантаження послуг
    showState(timeslotsState, "Помилка завантаження послуг", "error");
  }
}

/* ================================
   LOAD TIMESLOTS — завантаження таймслотів
   1) беремо service_id з select
   2) звертаємось до GET /timeslots?service_id=...
   3) передаємо дані в renderTimeslots()
================================ */
async function loadTimeslots() {
  const serviceId = serviceSelect.value;

  // якщо послуга не вибрана
  if (!serviceId) {
    showState(timeslotsState, "Послуга не вибрана", "empty");
    return;
  }

  showState(timeslotsState, "Завантаження таймслотів…", "loading");

  try {
    const res = await fetch(`${API_ROOT}/timeslots?service_id=${serviceId}`);
    if (!res.ok) throw new Error("timeslots_fetch_error");

    const slots = await res.json();
    renderTimeslots(slots);
  } catch (e) {
    showState(timeslotsState, "Не вдалося завантажити слоти", "error");
  }
}

/* ================================
   RENDER TIMESLOTS — відображення таймслотів
   Тут ми також перевіряємо capacity слота:
   1) завантажуємо всі бронювання (GET /bookings)
   2) рахуємо, скільки confirmed бронювань у цьому слоті
   3) якщо заповнено (capacity = 3) — кнопка блокується
================================ */
async function renderTimeslots(slots) {
  // очищаємо контейнер перед рендером
  timeslotsDiv.innerHTML = "";

  // якщо таймслотів немає взагалі — empty-стан
  if (!slots.length) {
    showState(timeslotsState, "Слоти відсутні", "empty");
    return;
  }

  // завантажуємо всі бронювання, щоб порахувати confirmed для кожного слоту
  let bookings = [];
  try {
    const res = await fetch(`${API_ROOT}/bookings`);
    bookings = await res.json();
  } catch (_) {
    // якщо не вдалося завантажити бронювання — просто працюємо з пустим масивом
  }

  let hasAvailable = false;

  for (const slot of slots) {
    // фільтруємо бронювання по конкретному timeslot_id і статусу confirmed
    const slotBookings = bookings.filter(
      (b) => b.slot_id === slot.timeslot_id && b.status === "confirmed"
    );

    const booked = slotBookings.length;
    const available = slot.capacity - booked; // capacity = 3 за варіантом

    // створюємо кнопку для кожного таймслоту
    const btn = document.createElement("button");
    btn.className = "slot-btn";
    btn.textContent = `${formatISOToUTC(slot.start)} (${available}/${slot.capacity})`;
    btn.setAttribute("aria-label", `slot_${slot.timeslot_id}`);

    if (available <= 0) {
      // якщо слот заповнений — блокуємо кнопку
      btn.disabled = true;
      btn.classList.add("slot-full");
      btn.title = "Слот заповнений";
    } else {
      hasAvailable = true;
      // якщо є місця — при кліку відкриваємо форму бронювання
      btn.onclick = () => {
        selectedSlot = slot; // запам’ятовуємо вибраний слот
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

  // якщо не залишилось доступних слотів → показуємо повідомлення
  showState(
    timeslotsState,
    hasAvailable ? "" : "Усі слоти зайняті",
    hasAvailable ? "" : "empty"
  );
}

/* ================================
   CREATE BOOKING — логіка створення бронювання
   1) перевірка, що слот вибраний і поля заповнені
   2) перевірка capacity (GET /bookings?slot_id=)
   3) якщо є місця → POST /bookings
   4) оновлюємо UI і слоти
================================ */
bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // якщо користувач не вибрав слот
  if (!selectedSlot) {
    showState(bookingState, "Спочатку виберіть слот", "error");
    return;
  }

  const name = document.getElementById("clientName").value.trim();
  const contact = document.getElementById("contact").value.trim();

  // проста валідація — обидва поля обов’язкові
  if (!name || !contact) {
    showState(bookingState, "Заповніть всі поля", "error");
    return;
  }

  showState(bookingState, "Перевірка місць…", "loading");

  try {
    // перед створенням бронювання перевіряємо, скільки вже є confirmed у цьому слоті
    const resChk = await fetch(
      `${API_ROOT}/bookings?slot_id=${selectedSlot.timeslot_id}`
    );
    const existing = await resChk.json();

    const confirmedCount = existing.filter(
      (b) => b.status === "confirmed"
    ).length;

    // якщо слот вже заповнений (capacity = 3)
    if (confirmedCount >= selectedSlot.capacity) {
      // логічний код помилки для NFR: BOOKING_FULL
      showState(
        bookingState,
        "Цей слот вже заповнений (error_code: BOOKING_FULL)",
        "error"
      );
      return;
    }

    // формуємо payload для POST /bookings
    const payload = {
      service_id: selectedSlot.service_id,
      slot_id: selectedSlot.timeslot_id,
      client_name: name,
      contact,
      status: "confirmed", // одразу ставимо confirmed (для спрощеного MVP)
      created_at: new Date().toISOString(), // ISO 8601 (NFR)
    };

    const res = await fetch(`${API_ROOT}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("booking_create_error");

    // якщо все добре — показуємо success-стан
    showState(bookingState, "Бронювання успішне!", "success");

    // очищаємо форму і ховаємо секцію
    bookingForm.reset();
    bookingSection.hidden = true;
    selectedSlot = null;

    // оновлюємо список таймслотів 
    loadTimeslots();
  } catch (err) {
    // загальна помилка при створенні бронювання
    showState(bookingState, "Помилка створення бронювання", "error");
  }
});

/* ================================
   CANCEL BOOKING FORM — кнопка "Скасувати"
   очищає форму та ховає секцію бронювання.
================================ */
cancelBookingBtn.onclick = () => {
  bookingForm.reset();
  bookingSection.hidden = true;
  selectedSlot = null;
  showState(bookingState, "");
};

/* ================================
   SHOW ALL BOOKINGS — демо-блок для перегляду всіх бронювань
================================ */
viewBookingsBtn.onclick = async () => {
  bookingsList.textContent = "Завантаження…";

  try {
    const res = await fetch(`${API_ROOT}/bookings`);
    const data = await res.json();

    if (!data.length) {
      bookingsList.textContent = "Немає бронювань";
      return;
    }

    bookingsList.innerHTML = "";

    // виводимо список бронювань у текстовому вигляді
    for (const b of data) {
      const d = document.createElement("div");
      d.textContent = `${b.client_name} — slot ${b.slot_id} — ${b.status}`;
      bookingsList.appendChild(d);
    }
  } catch (_) {
    bookingsList.textContent = "Не вдалося завантажити";
  }
};

/* ================================
   INIT — ініціалізація застосунку
   1) при зміні послуги перезавантажуємо timeslots
   2) при завантаженні сторінки тягнемо послуги
================================ */
serviceSelect.addEventListener("change", loadTimeslots);
document.addEventListener("DOMContentLoaded", loadServices);
