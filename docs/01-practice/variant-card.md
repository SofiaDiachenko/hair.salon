# variant_card

## базова_інформація

- домен: hair_salon_booking
- опис_домену: онлайн_бронювання_послуг_перукарні
- місткість_слоту_capacity: 3
- nfr_акцент: performance_first

## пояснення_варіанту

- домен = 1 → перукарня / салон
- передостання_цифра_P → непарна → capacity = 3 бронювання в одному слоті
- сума_цифр % 3 = 2 → performance_first (продуктивність, швидкі відповіді, легкі payload’и)

## приклади_бронювань

### приклад_1

- booking_id: 101
- послуга: women_haircut
- service_id: 1
- timeslot_id: 1
- start_time_utc: 2025-03-04T10:00:00Z
- client_name: anna_s
- contact_masked: +380xx…23
- status: confirmed

### приклад_2

- booking_id: 102
- послуга: coloring
- service_id: 2
- timeslot_id: 3
- start_time_utc: 2025-03-04T14:00:00Z
- client_name: sofia_d
- contact_masked: client@example.com
- status: confirmed

### приклад_3 (граничний_випадок_capacity)

- timeslot_id: 1
- capacity: 3
- вже_є_бронювань_confirmed: 3
- нове_бронювання: відхиляється з кодом_error: BOOKING_FULL

