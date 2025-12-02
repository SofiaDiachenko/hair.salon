# backlog

## user_stories

- **US01_view_services_list**  
  як *client* хочу *бачити список послуг салону*,  
  щоб *обрати потрібну послугу для запису*.

- **US02_view_available_timeslots**  
  як *client* хочу *бачити доступні timeslots для обраної послуги*,  
  щоб *обрати зручний час*.

- **US03_create_booking**  
  як *client* хочу *створити онлайн-бронювання на обрану послугу та час*,  
  щоб *не телефонувати або писати в месенджер*.

- **US04_manage_timeslots_admin**  
  як *admin* хочу *створювати та редагувати timeslots для майстрів*,  
  щоб *керувати розкладом салону*.

- **US05_update_booking_status_admin**  
  як *admin* хочу *змінювати статуси бронювань (pending, confirmed, cancelled)*,  
  щоб *оперативно реагувати на зміни*.

- **US06_view_schedule_master**  
  як *master* хочу *бачити свій список бронювань на день*,  
  щоб *планувати свою роботу*.

## acceptance_criteria

### AC_US03_create_booking

- **Given** існує timeslot з capacity = 3 і менше ніж 3 підтверджених бронювань  
  **When** client заповнює форму (name, contact) і надсилає її  
  **Then** створюється booking зі status = "confirmed"  
  **And** клієнт бачить повідомлення про успішне бронювання.

- **Given** для timeslot уже є 3 бронювання зі status = "confirmed"  
  **When** client намагається створити ще одне бронювання  
  **Then** система не створює новий запис  
  **And** повертає помилку з кодом `BOOKING_FULL`  
  **And** на UI відображається повідомлення, що слот заповнений.

### AC_US02_view_available_timeslots

- **Given** для service існують timeslots у майбутньому  
  **When** client обирає цю послугу  
  **Then** відображається список timeslots, де `confirmed_bookings < capacity`.  

- **Given** для service немає доступних timeslots  
  **When** client обирає цю послугу  
  **Then** UI показує message "Немає доступних слотів".

### AC_US04_manage_timeslots_admin

- **Given** admin має доступ до адмін-панелі  
  **When** він створює новий timeslot із валідними полями  
  **Then** timeslot зберігається у системі  
  **And** з’являється в переліку доступних timeslots для відповідної послуги.
