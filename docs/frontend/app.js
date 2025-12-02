/* app.js — працює з json-server на http://localhost:3000 */
const API_ROOT = "http://localhost:3000";

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

/* Утиліти */
function showState(elem, text="", cls=""){
  elem.textContent = text;
  elem.className = `state ${cls}`;
}
function formatISOToUTC(iso){
  return new Date(iso).toUTCString();
}

/* Завантажити сервіси */
async function loadServices(){
  try{
    showState(timeslotsState,"Завантаження послуг...","loading");
    const res = await fetch(`${API_ROOT}/services`);
    if(!res.ok) throw new Error("services_fetch_error");
    servicesCache = await res.json();
    serviceSelect.innerHTML = "";
    servicesCache.forEach(s=>{
      const opt = document.createElement("option");
      opt.value = s.service_id;
      opt.textContent = s.name;
      serviceSelect.appendChild(opt);
    });
    showState(timeslotsState,"",""); // clear
    loadTimeslots();
  } catch(e){
    showState(timeslotsState,"Не вдалося завантажити послуги","error");
  }
}

/* Завантажити таймслоти для обраної послуги */
async function loadTimeslots(){
  const serviceId = serviceSelect.value || (servicesCache && servicesCache[0] && servicesCache[0].service_id);
  if(!serviceId){ showState(timeslotsState,"Немає послуг","empty"); return; }
  showState(timeslotsState,"Завантаження таймслотів...","loading");
  try{
    const res = await fetch(`${API_ROOT}/timeslots?service_id=${serviceId}`);
    if(!res.ok) throw new Error("timeslots_fetch_error");
    const slots = await res.json();
    renderTimeslots(slots);
  } catch(e){
    showState(timeslotsState,"Помилка при завантаженні таймслотів","error");
  }
}

/* Відобразити таймслоти з урахуванням booking count */
async function renderTimeslots(slots){
  timeslotsDiv.innerHTML = "";
  if(!slots || slots.length === 0){
    showState(timeslotsState,"Немає доступних слотів","empty");
    return;
  }

  let bookings = [];
  try{
    const r = await fetch(`${API_ROOT}/bookings`);
    bookings = await r.json();
  } catch(e){
    bookings = [];
  }

  let anyAvailable = false;
  for(const slot of slots){
    const slotBookings = bookings.filter(b => b.slot_id === slot.timeslot_id && b.status === "confirmed");
    const bookedCount = slotBookings.length;
    const availableCount = slot.capacity - bookedCount;

    const btn = document.createElement("button");
    btn.textContent = `${formatISOToUTC(slot.start)} (${availableCount}/${slot.capacity})`;
    btn.setAttribute("aria-label", `slot_${slot.timeslot_id}`);
    if(availableCount <= 0){
      btn.disabled = true;
      btn.classList.add("slot-full");
      btn.title = "Слот заповнений";
    } else {
      anyAvailable = true;
      btn.onclick = () => {
        selectedSlot = slot;
        bookingSection.setAttribute("aria-hidden", "false");
        bookingForm.style.display = "block";
        showState(bookingState, "Ви обрали слот: " + formatISOToUTC(slot.start), "");
      };
    }
    timeslotsDiv.appendChild(btn);
  }

  if(!anyAvailable) showState(timeslotsState,"Немає вільних місць у доступних слотах","empty");
  else showState(timeslotsState,"",""); // clear
}

/* Відправка бронювання */
bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if(!selectedSlot){
    showState(bookingState,"Спочатку виберіть слот","error");
    return;
  }
  const name = document.getElementById("clientName").value.trim();
  const contact = document.getElementById("contact").value.trim();
  if(!name || !contact){
    showState(bookingState,"Заповніть усі поля","error");
    return;
  }

  showState(bookingState,"Перевірка місць...","loading");

  try{
    const resE = await fetch(`${API_ROOT}/bookings?slot_id=${selectedSlot.timeslot_id}`);
    const current = await resE.json();
    if(current.filter(b => b.status === "confirmed").length >= selectedSlot.capacity){
      showState(bookingState,"Слот заповнений. Спробуйте інший.","error");
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
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });

    if(res.ok){
      showState(bookingState,"Бронювання успішне","success");
      // оновити список слотів
      await loadTimeslots();
      bookingForm.reset();
      bookingSection.setAttribute("aria-hidden","true");
      selectedSlot = null;
    } else {
      const err = await res.json();
      showState(bookingState, err.message || "Помилка при створенні бронювання", "error");
    }
  } catch(err){
    showState(bookingState,"Мережна помилка","error");
  }
});

document.getElementById("cancelBooking").onclick = () => {
  bookingForm.reset();
  bookingSection.setAttribute("aria-hidden","true");
  selectedSlot = null;
  showState(bookingState,"",""); 
};

/* Демо: показати всі бронювання */
viewBookingsBtn.onclick = async () => {
  bookingsList.innerHTML = "Завантаження...";
  try{
    const res = await fetch(`${API_ROOT}/bookings`);
    const data = await res.json();
    bookingsList.innerHTML = "";
    if(data.length === 0) bookingsList.textContent = "Немає бронювань";
    data.forEach(b => {
      const el = document.createElement("div");
      el.textContent = `${b.client_name} — slot ${b.slot_id} — ${b.status} — ${b.created_at}`;
      bookingsList.appendChild(el);
    });
  } catch(e){
    bookingsList.textContent = "Не вдалося завантажити бронювання";
  }
};

serviceSelect.addEventListener("change", loadTimeslots);
document.addEventListener("DOMContentLoaded", loadServices);
