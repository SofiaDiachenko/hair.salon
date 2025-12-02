/* Простий frontend, що працює з json-server на http://localhost:3000 */
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
let timeslotsCache = null;

/* Утиліти */
function showState(elem, text="", cls=""){
  elem.textContent = text;
  elem.className = `state ${cls}`;
}
function formatDateISO(isoString){
  const d = new Date(isoString);
  return d.toUTCString();
}

/* Load services */
async function loadServices(){
  try{
    showState(timeslotsState,"Завантаження послуг...","loading");
    const res = await fetch(`${API_ROOT}/services`);
    servicesCache = await res.json();
    serviceSelect.innerHTML = "";
    servicesCache.forEach(s=>{
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name;
      serviceSelect.appendChild(opt);
    });
    showState(timeslotsState,"",""); // clear
    loadTimeslots();
  } catch(e){
    showState(timeslotsState,"Не вдалося завантажити послуги","error");
  }
}

/* Load timeslots for selected service */
async function loadTimeslots(){
  const serviceId = serviceSelect.value || (servicesCache && servicesCache[0] && servicesCache[0].id);
  if(!serviceId){ showState(timeslotsState,"Немає послуг","empty"); return; }
  showState(timeslotsState,"Завантаження таймслотів...","loading");
  try{
    const res = await fetch(`${API_ROOT}/timeslots?serviceId=${serviceId}`);
    const data = await res.json();
    timeslotsCache = data;
    renderTimeslots(data);
  } catch(e){
    showState(timeslotsState,"Помилка при завантаженні", "error");
  }
}

/* Render timeslots and check capacity (count bookings) */
async function renderTimeslots(slots){
  timeslotsDiv.innerHTML = "";
  if(!slots || slots.length===0){
    showState(timeslotsState,"Немає доступних слотів","empty");
    return;
  }

  // отримуємо всі бронювання один раз для підрахунку
  let bookings = [];
  try{
    const r = await fetch(`${API_ROOT}/bookings`);
    bookings = await r.json();
  } catch(e){
    bookings = [];
  }

  let anyAvailable = false;
  for(const slot of slots){
    const slotBookings = bookings.filter(b => b.slotId === slot.id && b.status === "confirmed");
    const bookedCount = slotBookings.length;
    const availableCount = slot.capacity - bookedCount;

    const btn = document.createElement("button");
    btn.textContent = `${new Date(slot.start).toUTCString()} (${availableCount}/${slot.capacity})`;
    btn.setAttribute("aria-label", `Слот ${slot.id} ${slot.start} місць ${availableCount}`);
    if(availableCount <= 0){
      btn.disabled = true;
      btn.classList.add("slot-full");
    } else {
      anyAvailable = true;
      btn.onclick = () => {
        selectedSlot = slot;
        bookingSection.setAttribute("aria-hidden","false");
        bookingForm.style.display = "block";
        showState(bookingState,"Ви обрали слот: " + new Date(slot.start).toUTCString(),"");
      };
    }
    timeslotsDiv.appendChild(btn);
  }

  if(!anyAvailable) showState(timeslotsState,"Немає вільних місць у доступних слотах","empty");
  else showState(timeslotsState,"",""); // clear
}

/* Submit booking: перевіряємо capacity знову перед POST */
bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if(!selectedSlot){
    showState(bookingState,"Спочатку виберіть слот","error");
    return;
  }
  const name = document.getElementById("name").value.trim();
  const contact = document.getElementById("contact").value.trim();
  if(!name || !contact){
    showState(bookingState,"Заповніть всі поля","error");
    return;
  }

  showState(bookingState,"Перевірка місць...","loading");

  try {
    const resB = await fetch(`${API_ROOT}/bookings?slotId=${selectedSlot.id}`);
    const current = await resB.json();
    if(current.filter(b=>b.status==="confirmed").length >= selectedSlot.capacity){
      showState(bookingState,"Слот повний. Спробуйте інший.","error");
      return;
    }

    // POST booking
    const payload = {
      serviceId: selectedSlot.serviceId,
      slotId: selectedSlot.id,
      clientName: name,
      contact,
      status: "confirmed",
      createdAt: new Date().toISOString()
    };

    const res = await fetch(`${API_ROOT}/bookings`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });

    if(res.ok){
      showState(bookingState,"Бронювання успішне","success");
      // оновити timeslots
      await loadTimeslots();
    } else {
      showState(bookingState,"Помилка при створенні бронювання","error");
    }

  } catch(err){
    showState(bookingState,"Мережна помилка","error");
  }
});

cancelBookingBtn.onclick = () => {
  bookingForm.reset();
  bookingSection.setAttribute("aria-hidden","true");
  selectedSlot = null;
  showState(bookingState,"",""); 
};

/* Демо: показати всі бронювання (для майстра) */
viewBookingsBtn.onclick = async () => {
  bookingsList.innerHTML = "Завантаження...";
  try{
    const res = await fetch(`${API_ROOT}/bookings`);
    const data = await res.json();
    bookingsList.innerHTML = "";
    if(data.length===0) bookingsList.textContent = "Немає бронювань";
    data.forEach(b=>{
      const el = document.createElement("div");
      el.textContent = `${b.clientName} — slot ${b.slotId} — ${b.status} — ${b.createdAt}`;
      bookingsList.appendChild(el);
    });
  } catch(e){
    bookingsList.textContent = "Не вдалося завантажити бронювання";
  }
};

/* ініціалізація */
serviceSelect.addEventListener("change", loadTimeslots);
document.addEventListener("DOMContentLoaded", loadServices);
