# flows — користувацькі сценарії

## flow_1_success_booking (happy_path)

1. client відкриває сайт.
2. frontend викликає `GET /services` і показує список послуг.
3. client обирає послугу у випадаючому списку.
4. frontend викликає `GET /timeslots?service_id={id}`.
5. client бачить список доступних timeslots (із показником `available/capacity`).
6. client обирає вільний timeslot.
7. з’являється форма `booking_form`.
8. client заповнює `client_name` та `contact` і натискає "Підтвердити".
9. frontend викликає `GET /bookings?slot_id={timeslot_id}` і рахує confirmed бронювання.
10. якщо `confirmed_count < capacity` → frontend викликає `POST /bookings`.
11. mock_api (json-server) створює новий запис booking зі `status = "confirmed"`.
12. UI показує success-стан, форма очищується, список слотів оновлюється.

## flow_2_empty_state (немає_доступних_слотів)

1. client обирає послугу.
2. frontend викликає `GET /timeslots?service_id={id}`.
3. сервер повертає або:
   - порожній масив timeslots, або
   - усі timeslots мають `confirmed_count == capacity`.
4. frontend не рендерить активні кнопки timeslot.
5. у блоці стану показується `"Немає доступних слотів"` або `"Усі слоти зайняті"`.
6. client може повернутися до вибору послуги.

## flow_3_error_slot_full (BOOKING_FULL)

1. client обирає timeslot, який ще виглядає вільним.
2. між кроками інший користувач встигає забронювати останнє місце.
3. client заповнює форму й натискає "Підтвердити".
4. frontend викликає `GET /bookings?slot_id={timeslot_id}`.
5. у відповіді `confirmed_count >= capacity`.
6. frontend НЕ викликає POST, а:
   - показує повідомлення про помилку `"Цей слот вже заповнений"`;
   - логічний код помилки: `BOOKING_FULL`.
7. client обирає інший timeslot.
