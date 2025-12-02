# Flows — Користувацькі сценарії

## Flow 1 — Успішне бронювання (happy path)
1. Client відкриває сайт.
2. Client обирає послугу (GET /services).
3. Client бачить timeslots для цієї послуги (GET /timeslots?service_id=).
4. Client обирає вільний timeslot (capacity > confirmed_bookings).
5. Показується booking form.
6. Client вводить client_name та contact і натискає "Підтвердити".
7. Frontend перевіряє кількість existing bookings для timeslot (GET /bookings?slot_id=).
8. Якщо місця є — POST /bookings створює booking зі status = "confirmed".
9. UI показує success-стан.

## Flow 2 — Empty state (немає слотів)
1. Client обирає послугу.
2. GET /timeslots?service_id= повертає пустий масив або всі слоти мають місць 0.
3. UI відображає повідомлення: "Немає доступних слотів".
4. Client може змінити дату або обрати іншу послугу.

## Flow 3 — Error: слот заповнений (BOOKING_FULL)
1. Client запускає бронювання.
2. Перед POST фронтенд перевіряє кількість confirmed бронювань.
3. Якщо місць нема — mock API/логіка повертає помилку:
   ```json
   { "error_code": "BOOKING_FULL", "message": "Слот заповнений" }
