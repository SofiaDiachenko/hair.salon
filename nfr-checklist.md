# NFR Checklist (Performance-first)

## Формат часу
- Усі дати у форматі **ISO 8601**, часовий пояс **UTC**.

## Коди помилок
- Стабільні коди: `BOOKING_FULL`, `INVALID_TIMESLOT`, `NOT_FOUND`, `UNAUTHORIZED`.

## Performance
- Пагінація всіх списків: limit + offset.
- Відповіді API не більше 2–5 KB.
- Кеш популярних таймслотів (10 хв).
- Стиснення відповідей (gzip/br).

## Security
- HTTPS для всіх запитів.
- Токен-авторизація для admin/master.

## Availability
- 99% uptime для API.
