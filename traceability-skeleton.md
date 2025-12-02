# Traceability Skeleton - Оновлений

| User Story | DFD | ERD | API endpoint | Mock-API | UX-Flow | Test case |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| US01 (Перегляд слотів) | DFD-1 | ERD-timeslot | GET /timeslots | **timeslots.json** | Успішне Бронювання (Крок 3) | test_list_timeslots |
| US02 (Створення бронювання) | DFD-2 | ERD-booking | POST /bookings | (Імітація в app.js) | Успішне Бронювання (Крок 8) | test_create_booking |
| US03 (Скасування бронювання) | DFD-2 | ERD-booking | DELETE /bookings/{id} | (Нереалізовано в MVP) | (Нереалізовано) | test_cancel_booking |
| US04 (Список бронювань) | DFD-3 | ERD-booking | GET /bookings | **bookings.json** | Перегляд Існуючих (Крок 3) | test_list_master_bookings |
| US05 (Додати послуги) | DFD-4 | ERD-service | POST /services | (Нереалізовано в MVP) | (Admin Flow) | test_add_service |
| US06 (Додати таймслоти) | DFD-4 | ERD-timeslot | POST /timeslots | (Нереалізовано в MVP) | (Admin Flow) | test_add_timeslot |
