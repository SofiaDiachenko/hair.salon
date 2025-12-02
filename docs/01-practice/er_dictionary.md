# ER Dictionary

- service.service_id — унікальний ідентифікатор послуги (integer)
- service.name — назва послуги (string)
- service.duration_min — тривалість у хвилинах (integer)
- timeslot.timeslot_id — унікальний ідентифікатор таймслоту
- timeslot.service_id — зовнішній ключ на service
- timeslot.start — початок слоту у форматі ISO 8601 UTC
- timeslot.capacity — максимальна кількість бронювань (1 або 3)
- booking.booking_id — унікальний ідентифікатор бронювання
- booking.timeslot_id — FK на timeslot
- booking.client_name — ім'я клієнта (string)
- booking.contact — контактні дані (masked в production)
- booking.status — статус бронювання (confirmed / cancelled)
- booking.created_at — дата створення (ISO 8601 UTC)
- master.master_id — ідентифікатор майстра
