# traceability_skeleton_practice_02

| user_story_id              | ux_flow                    | ui_screens                              | api_endpoints                          | mock_data              | frontend_files           |
|----------------------------|---------------------------|-----------------------------------------|----------------------------------------|------------------------|--------------------------|
| US01_view_services_list    | flow_1_success_booking    | services_section                        | GET /services                          | services (db.json)     | index.html, app.js       |
| US02_view_available_timeslots | flow_1_success_booking, flow_2_empty_state | timeslots_section   | GET /timeslots?service_id=             | timeslots (db.json)    | index.html, app.js       |
| US03_create_booking        | flow_1_success_booking    | booking_section                         | GET /bookings?slot_id=, POST /bookings | bookings (db.json)     | index.html, app.js       |
| US04_manage_timeslots_admin| (поза UI, лише концепт)   | (майбутня admin_page)                   | POST/PATCH /timeslots                  | timeslots (db.json)    | (майбутній admin.js)     |
| US05_update_booking_status_admin | (концепт)          | (admin_page)                            | PATCH /bookings/{id}                   | bookings (db.json)     | (майбутній admin.js)     |
| US06_view_schedule_master  | flow_1_success_booking    | admin demo "Перегляд бронювань"         | GET /bookings                          | bookings (db.json)     | index.html, app.js       |
