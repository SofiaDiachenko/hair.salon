# traceability_skeleton_practice_01

| user_story_id              | dfd_elements                        | erd_elements                         | api_endpoints                          | tests                            |
|----------------------------|-------------------------------------|--------------------------------------|----------------------------------------|----------------------------------|
| US01_view_services_list    | DFD0, DFD1_view_services           | ERD_service                          | GET /services                          | test_get_services_list           |
| US02_view_available_timeslots | DFD0, DFD1_view_timeslots        | ERD_service, ERD_timeslot            | GET /timeslots?service_id=             | test_get_available_timeslots     |
| US03_create_booking        | DFD0, DFD2_create_booking          | ERD_timeslot, ERD_booking, ERD_client| POST /bookings, GET /bookings?slot_id= | test_create_booking_capacity     |
| US04_manage_timeslots_admin| DFD1_manage_timeslots              | ERD_timeslot                         | POST /timeslots, PATCH /timeslots/{id} | test_admin_manage_timeslots      |
| US05_update_booking_status_admin | DFD2_update_booking_status   | ERD_booking                          | PATCH /bookings/{id}                   | test_update_booking_status       |
| US06_view_schedule_master  | DFD1_view_master_schedule          | ERD_booking, ERD_master              | GET /bookings?master_id=               | test_get_master_schedule         |
