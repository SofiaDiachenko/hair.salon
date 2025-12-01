# Traceability Skeleton

| User Story | DFD | ERD | API endpoint | Test case |
|-----------|-----|-----|--------------|-----------|
| US01 | DFD-1 | ERD-timeslot | GET /timeslots | test_list_timeslots |
| US02 | DFD-2 | ERD-booking | POST /bookings | test_create_booking |
| US03 | DFD-2 | ERD-booking | DELETE /bookings/{id} | test_cancel_booking |
| US04 | DFD-3 | ERD-booking | GET /bookings | test_list_master_bookings |
| US05 | DFD-4 | ERD-service | POST /services | test_add_service |
| US06 | DFD-4 | ERD-timeslot | POST /timeslots | test_add_timeslot |
