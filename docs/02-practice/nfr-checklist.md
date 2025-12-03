# nfr_checklist_practice_02

## час_та_формат

1. **iso_8601_utc**  
   - timeslots.start і bookings.created_at у `db.json` зберігаються в форматі ISO 8601 + UTC, напр. `2025-03-04T10:00:00Z`.
   - у UI час відображається через функцію форматування дати `formatISOToUTC()`.

## продуктивність (performance_first)

2. **frontend_caching_services**  
   - список послуг завантажується один раз при старті (`loadServices`) і кешується у змінній `servicesCache`.  
   - повторні виклики не роблять зайвих запитів до `/services`.

3. **lightweight_endpoints**  
   - `GET /services` повертає тільки `service_id`, `name`, `duration_min`, `description`;  
   - `GET /timeslots` — тільки `timeslot_id`, `service_id`, `start`, `capacity`;  
   - `GET /bookings` — тільки ключові поля для перевірки capacity (slot_id, status, created_at).

4. **capacity_check_on_frontend**  
   - перед `POST /bookings` фронтенд виконує `GET /bookings?slot_id=` і не надсилає POST, якщо слот заповнений.  
   - це економить запити і симулює поведінку продакшн API.

5. **ready_for_pagination**  
   - структура відповіді `db.json` сумісна з `?_page=&_limit=` json-server, що дозволяє додати пагінацію без зміни контракту.

## доступність (a11y, навіть при perf-акценті)

6. **aria_live_regions**  
   - `#timeslots-state` та `#booking-state` мають `aria-live`, тому screen reader оголошує зміни стану (loading, error, success).

7. **keyboard_navigation_focus**  
   - усі інтерактивні елементи — `select`, `input`, `button` — доступні з клавіатури;  
   - для них визначено стилі `:focus-visible` із чітким контуром.

8. **visually_hidden_labels**  
   - для select використано клас `visually-hidden`, тож label доступний читачам з екрана, але не заважає візуально.

## стабільні_коди_помилок

9. **error_codes_definitions**  
   - у документації визначені коди:
     - `BOOKING_FULL`
     - `TIMESLOT_NOT_FOUND`
     - `VALIDATION_ERROR`
   - UI для повного слоту відображає текстове повідомлення, яке відповідає коду `BOOKING_FULL`.

## privacy

10. **minimal_pii**  
   - система зберігає лише `client_name` та `contact` (телефон або email) без додаткових персональних даних;  
   - контакт зберігається у вільному форматі, без обов’язкових паспортних/адресних даних.

