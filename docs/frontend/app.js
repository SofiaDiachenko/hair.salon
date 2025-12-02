/* ================================
   CONFIG
================================ */
const API_ROOT = "http://localhost:3000";

/* ================================
   ELEMENTS
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

let selectedSlot = null;
let servicesCache = null;

/* ================================
   HELPERS
================================ */
function showState(elem, text = "", cls = "") {
  elem.textContent = text;
  elem.className = `state ${cls}`;
}

function formatISOToUTC(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toUTCString();
}

/* ================================
   LOAD SERVICES
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
    loadTimeslots();

  } catch (e) {
    showState(timeslotsState, "Помилка завантаження послуг", "error");
  }
}

/* ================================
   LOAD TIMESLOTS
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
    renderTimeslots(slots);

  } catch (e) {
    showState(timeslotsState, "Не вдалося завантажити слоти", "error");
  }
}

/* ================================
   RENDER TIMESLOTS
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
    bookings = await res.json();
  } catch (_) {}

  let hasAvailable = false;

  for (const slot of slots) {
    const slotBookings = bookings.filter(
      b => b.slot_id === slot.timeslot_id && b.status === "confirmed"
    );

    const booked = slotBookings.length;
    const available = slot.capacity - booked;

    const btn = document.createElement("button");
    btn.className = "slot-btn";
    btn.textContent = `${formatISOToUTC(slot.start)} (${available}/${slot.capacity})`;
    btn.setAttribute("aria-label", `slot_${slot.timeslot_id}`);

    if (available <= 0) {
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

  showState(timeslotsState, hasAvailable ? "" : "Усі слоти зайняті", hasAvailable ? "" : "empty");
}

/* ================================
   CREATE BOOKING
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
    const resChk = await fetch(`${API_ROOT}/bookings?slot_id=${selectedSlot.timeslot_id}`);
    const existing = await resChk.json();

    const confirmedCount = existing.filter(b => b.status === "confirmed").length;
    if (confirmedCount >= selectedSlot.capacity) {
      showState(bookingState, "Цей слот вже заповнений", "error");
      return;
    }

    const payload = {
      service_id: selectedSlot.service_id,
      slot_id: selectedSlot.timeslot_id,
      client_name: name,
      contact,
      status: "confirmed",
      created_at: new Date().toISOString()
    };

    const res = await fetch(`${API_ROOT}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error();

    showState(bookingState, "Бронювання успішне!", "success");

    bookingForm.reset();
    bookingSection.hidden = true;
    selectedSlot = null;

    loadTimeslots();

  } catch (err) {
    showState(bookingState, "Помилка створення бронювання", "error");
  }
});

/* ================================
   CANCEL BOOKING FORM
================================ */
cancelBookingBtn.onclick = () => {
  bookingForm.reset();
  bookingSection.hidden = true;
  selectedSlot = null;
  showState(bookingState, "");
};

/* ================================
   SHOW ALL BOOKINGS
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
   INIT
================================ */
serviceSelect.addEventListener("change", loadTimeslots);
document.addEventListener("DOMContentLoaded", loadServices);
