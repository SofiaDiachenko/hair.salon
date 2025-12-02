# NFR Checklist

## Формат часу
- Усі дати/часи — ISO 8601, UTC (записи в timeslot.start, booking.created_at)

## Стабільні коди помилок
- BOOKING_FULL — слот заповнений
- INVALID_TIMESLOT — таймслот не знайдено
- NOT_FOUND — ресурс не знайдено
- UNAUTHORIZED — відсутня авторизація

## Performance (акцент)
- Пагінація для GET /timeslots та GET /bookings: support ?limit=&offset=
- Мінімальні відповіді: тільки необхідні поля (no heavy payload)
- Кешування популярних запитів (в прототипі: services кешується в браузері / servicesCache)
- Стиснення відповіді — на production (gzip/br)

## Accessibility (a11y)
- aria-label на інтерактивних елементах
- видимий focus outline
- клавішна навігація (tabindex, логічний порядок)
- aria-live для динамічних оновлень (timeslots)

## Privacy
- У production — маскування контактів, зберігання PII мінімізоване
- У прототипі — тестові/mock дані. Не зберігати реальні PII в репозиторії.

## Availability
- SLA target (production): 99% uptime

