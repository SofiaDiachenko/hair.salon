# Traceability Skeleton — зв'язність вимог

| user_story_id | short_description             | ux_screen         | api_mock                     | frontend_function   |
|---------------|-------------------------------|-------------------|------------------------------|---------------------|
| US01_view_timeslots | Перегляд timeslots        | timeslots-section | GET /timeslots?service_id=   | loadTimeslots()     |
| US02_create_booking | Створення booking         | booking-section   | POST /bookings               | submitBooking()     |
| US03_cancel_booking | Скасування booking        | bookings_list     | DELETE /bookings/{id}        | deleteBooking()     |
| US04_master_view_bookings | Перегляд бронювань майстром | bookings_list | GET /bookings?master_id=     | viewBookings()      |
| US07_view_service_description | Опис послуги    | services-section  | GET /services/{id}           | showServiceDetail() |
