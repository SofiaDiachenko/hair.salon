# nfr_checklist_practice_02

## час_та_формат

1. **iso_8601_utc**  
   - timeslot.start та booking.created_at зберігаються в ISO 8601 + UTC, наприклад `2025-03-04T10:00:00Z`.
   - на фронтенді час відображається через функцію форматування дати.

## продуктивність (performance_first)

2. **frontend_caching_services**  
   - список послуг завантажується один раз і кешується у змінній `servicesCache`, повторних запитів до /services немає без потреби.

3. **lightweight_endpoints**  
   - `GET /timeslots` повертає тільки ключові поля (timeslot_id, service_id, start, capacity);  
   - `GET /bookings` — тільки booking_id, slot_id, status, client_name, created_at.

4. **capacity_check_on_frontend**  
   - перед `POST /bookings` фронтенд перевіряє наявні бронювання через `GET /bookings?slot_id=`, щоб уникнути зайвих POST-запитів у переповненні.

5. **ready_for_pagination**  
   - структура `db.json` і UI побудовані так, щоб можна було додати параметри `?_page=&_limit=` (json-server) без зміни контракту.

## доступність (a11y-аспекти, навіть при perf-акценті)

6. **aria_live_regions**  
   - блоки `timeslots-state` і `booking-state` мають `aria-live="assertive"` / `polite` для оголошення станів (loading, error, success).

7. **keyboard_navigation_focus**  
   - усі кнопки та поля форм доступні з клавіатури; стилі `:focus-visible` підсвічують активний елемент.

8. **visually_hidden_labels**  
   - для select використано `visually-hidden` label, щоб допомогти screen reader, але не захаращувати UI.

## стабільні_коди_помилок

9. **error_codes**  
   - у специфікації системи закріплені коди:
     - `BOOKING_FULL`
     - `TIMESLOT_NOT_FOUND`
     - `VALIDATION_ERROR`
   - відповідні повідомлення відображаються у UI через блоки станів.

