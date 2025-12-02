# nfr_checklist_practice_01

1. **time_format_iso_utc**  
   - Усі дати/часи зберігаються в UTC у форматі ISO 8601.  
   - приклад: `2025-03-04T10:00:00Z`.

2. **stable_error_codes**  
   - Визначені сталі коди помилок:
     - `BOOKING_FULL` — спроба забронювати повний timeslot;
     - `TIMESLOT_NOT_FOUND` — запит на неіснуючий timeslot;
     - `VALIDATION_ERROR` — некоректні дані у формі;
     - `SERVICE_NOT_FOUND` — послуга не знайдена.  

3. **performance_first_lightweight_responses**  
   - Відповіді API повертають тільки потрібні поля (service_id, timeslot_id, start, capacity, status), без зайвих вкладених структур.

4. **performance_first_caching_frontend**  
   - Список послуг кешується на фронтенді після першого завантаження (servicesCache), повторні запити не виконуються без потреби.

5. **performance_first_pagination_ready**  
   - Для timeslots та bookings API проектується з можливістю додати параметри `page`, `limit` без зміни поточної моделі.

6. **minimal_pii_storage**  
   - Зберігаються тільки client_name і contact, без надлишкових персональних даних.

7. **availability_target**  
   - Цільова доступність системи — 99% у робочі години салону (концептуальна вимога для майбутнього продакшена).

8. **logging_and_monitoring_minimum**  
   - Логуються технічні події (створення/оновлення booking, коди помилок), без логування повних контактних даних клієнтів.
