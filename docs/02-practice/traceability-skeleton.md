# Traceability Skeleton

| User Story (id) | DFD (process)           | ERD (entity)        | API Endpoint                 | Test case                 |
|------------------|-------------------------|---------------------|------------------------------|---------------------------|
| US01 view_timeslots | DFD-1: View Services & Timeslots | timeslot, service | GET /timeslots?service_id=   | test_get_timeslots        |
| US02 create_booking | DFD-2: Create Booking  | booking, timeslot   | POST /bookings               | test_create_booking       |
| US03 cancel_booking | DFD-2: Cancel Booking  | booking             | DELETE /bookings/{id}        | test_cancel_booking       |
| US04 master_view_bookings | DFD-1/DFD-2       | booking, master     | GET /bookings?master_id=     | test_master_view_bookings |
| US05 admin_manage_services | DFD-1: Manage Catalog | service          | POST/PUT/DELETE /services    | test_admin_manage_service |
| US06 admin_manage_timeslots | DFD-1: Manage Catalog | timeslot        | POST/PUT/DELETE /timeslots   | test_admin_manage_timeslot|
| US07 view_service_description | DFD-1 | service             | GET /services/{id}           | test_get_service_detail   |
