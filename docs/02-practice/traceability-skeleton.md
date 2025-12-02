# Traceability Skeleton

| User Story | UX Screen | Flow | Mock API Endpoint | Frontend Function |
|------------|-----------|------|-------------------|-------------------|
| US01: Перегляд таймслотів | timeslots-section | Flow 1 | GET /timeslots?serviceId= | loadTimeslots() |
| US02: Створення бронювання | booking-section | Flow 1 | POST /bookings | submit booking (form submit) |
| US03: Скасування бронювання | bookingsList (admin) | Flow (delete) | DELETE /bookings/{id} | (можна додати) |
| US04: Перегляд бронювань майстром | bookingsList | Flow admin | GET /bookings?masterId= | viewBookingsBtn.onclick |
| US05: Додавання послуг (admin) | — | — | POST /services | (опціонально) |
| US06: Створення таймслотів (admin) | — | — | POST /timeslots | (опціонально) |
| US07: Опис послуги | services-section | Flow 1 | GET /services | loadServices() / show description |
