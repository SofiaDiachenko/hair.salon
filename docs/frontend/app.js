// Зберігаємо обрані дані
let selectedService = null;
let selectedTimeslot = null;

// ФУНКЦІЯ 1: Імітація запиту GET /services
async function fetchServices() {
    const servicesList = document.getElementById('services-list');
    servicesList.innerHTML = `<div class="loading-state">Завантаження послуг...</div>`;
    
    // Імітація затримки мережі (для стану Loading)
    await new Promise(r => setTimeout(r, 500)); 

    try {
        const response = await fetch('../mock-api/services.json');
        const services = await response.json();

        servicesList.innerHTML = ''; // Очищаємо стан Loading

        services.forEach(service => {
            const button = document.createElement('button');
            button.textContent = `${service.name} (${service.duration_min} хв)`;
            button.setAttribute('aria-label', `Обрати послугу ${service.name}`);
            button.addEventListener('click', () => {
                selectedService = service;
                // Перехід до наступного кроку: Завантаження слотів
                document.getElementById('service-selection').style.display = 'none';
                document.getElementById('timeslot-selection').style.display = 'block';
                fetchTimeslots(service.id);
            });
            servicesList.appendChild(button);
        });

    } catch (error) {
        servicesList.innerHTML = `<div class="error-state">Помилка завантаження послуг: ${error.message}</div>`;
    }
}

// ФУНКЦІЯ 2: Імітація запиту GET /timeslots
async function fetchTimeslots(serviceId) {
    const timeslotStatus = document.getElementById('timeslot-status');
    const timeslotsList = document.getElementById('timeslots-list');
    const timeslotsEmpty = document.getElementById('timeslots-empty');
    
    timeslotsStatus.style.display = 'block';
    timeslotsList.innerHTML = '';
    timeslotsEmpty.style.display = 'none';
    
    await new Promise(r => setTimeout(r, 700)); // Імітація затримки (Performance-first: кешування, тому швидше за послуги)

    try {
        const response = await fetch('../mock-api/timeslots.json');
        let data = await response.json();
        
        // **Performance-first:** Імітація пагінації (беремо лише першого майстра для прикладу)
        let masterData = data[0]; 

        timeslotsStatus.style.display = 'none'; // Завантаження завершено
        
        const availableSlots = masterData.slots.filter(slot => slot.is_available);

        if (availableSlots.length === 0) {
            timeslotsEmpty.style.display = 'block';
            return;
        }

        availableSlots.forEach(slot => {
            const timeButton = document.createElement('button');
            // Відображення capacity: (2/3) - демонстрація місткості
            timeButton.textContent = `${slot.time.substring(0, 5)} (${slot.capacity_used}/${slot.capacity_max})`;
            timeButton.setAttribute('aria-label', `Забронювати на час ${slot.time.substring(0, 5)}`);
            timeButton.addEventListener('click', () => {
                selectedTimeslot = { ...slot, master_name: masterData.master_name, service_id: serviceId };
                // Перехід до форми бронювання
                document.getElementById('timeslot-selection').style.display = 'none';
                document.getElementById('booking-form-section').style.display = 'block';
                document.getElementById('selected-service-info').textContent = selectedService.name;
                document.getElementById('selected-timeslot-info').textContent = `${masterData.master_name} на ${slot.time.substring(0, 5)} ${masterData.date}`;
            });
            timeslotsList.appendChild(timeButton);
        });

    } catch (error) {
        timeslotStatus.innerHTML = `<div class="error-state">Помилка завантаження слотів: ${error.message}</div>`;
    }
}

// ФУНКЦІЯ 3: Імітація запиту POST /bookings
document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const resultDiv = document.getElementById('booking-result');
    resultDiv.innerHTML = `<div class="loading-state">Обробка бронювання...</div>`;

    const clientName = document.getElementById('client-name').value;
    const clientPhone = document.getElementById('client-phone').value;

    const bookingData = {
        service_id: selectedService.id,
        timeslot_id: selectedTimeslot.slot_id,
        client_name: clientName,
        client_contact: clientPhone,
        // Імітація даних для POST
        mock_success: Math.random() > 0.1 // 90% успіху, 10% помилки
    };

    await new Promise(r => setTimeout(r, 1000)); // Імітація обробки

    if (bookingData.mock_success) {
        // Стан Success
        const newBookingId = Math.floor(Math.random() * 1000) + 200;
        resultDiv.innerHTML = `<div class="success-state">✅ Успіх! Ваше бронювання #${newBookingId} підтверджено.</div>`;
        document.getElementById('submit-booking').style.display = 'none';
    } else {
        // Стан Error (імітація BOOKING_FULL)
        resultDiv.innerHTML = `<div class="error-state">❌ Помилка бронювання (BOOKING_FULL). На жаль, цей час щойно забронювали. Спробуйте інший слот.</div>`;
    }
});

// Запускаємо завантаження послуг при старті
document.addEventListener('DOMContentLoaded', fetchServices);
