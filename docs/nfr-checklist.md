# NFR Checklist — реалізація у прототипі (Performance-first)

## Формат часу
- Усі дати в mock-api в ISO 8601 (UTC).

## Коди помилок
- Відображення користувацьких помилок: BOOKING_FULL, INVALID_TIMESLOT, NOT_FOUND, UNAUTHORIZED (mock).

## Performance
- Локальні JSON файли та json-server — мінімальні відповіді.
- JS кеш: сервісні дані зберігаються у `servicesCache` / `timeslotsCache` для зменшення повторних запитів.
- Пагінація у списках — для реальної реалізації; в прототипі можна імітувати через query params limit/offset.
- Кешування популярних запитів (можна додати localStorage/sessionStorage TTL).

## Accessibility (a11y)
- aria-label на select та інпутах.
- Видимий фокус (outline) для клавіатурної навігації.
- aria-live при оновленні списку таймслотів.
- Контраст кольорів відповідає WCAG AA.

## Privacy / Security
- У прототипі: всі дані мокові, не лікуються реальні персональні дані.
- Не зберігаємо чутливі дані в LocalStorage.
- Для production: передбачена авторизація (token для admin/master).

