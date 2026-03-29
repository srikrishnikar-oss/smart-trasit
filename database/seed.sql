INSERT INTO cities (city_name, state_name) VALUES ('Bengaluru', 'Karnataka');

INSERT INTO app_users (full_name, email, phone, password_hash, role_code)
VALUES ('Sri Krishnika R', 'sri@example.com', '+91 9876543210', 'demo_hash_passenger', 'PASSENGER');

INSERT INTO app_users (full_name, email, phone, password_hash, role_code)
VALUES ('Asha Driver', 'asha.driver@example.com', '+91 9000000001', 'demo_hash_driver', 'DRIVER');

INSERT INTO app_users (full_name, email, phone, password_hash, role_code)
VALUES ('Transit Admin', 'admin@smarttransit.local', '+91 9000000002', 'demo_hash_admin', 'ADMIN');

INSERT INTO drivers (user_id, license_no, hire_date)
SELECT user_id, 'KA-DRV-1001', DATE '2024-01-10'
FROM app_users
WHERE email = 'asha.driver@example.com';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'MBS', 'Majestic Bus Stand', 12.9716, 77.5946, 'Central'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'MJM', 'Majestic Metro', 12.9802, 77.5729, 'Central'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'BPM', 'Baiyappanahalli Metro', 12.9975, 77.6753, 'East'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'KRP', 'KR Puram Metro', 13.0067, 77.6957, 'East'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'WFM', 'Whitefield Metro', 12.9954, 77.7570, 'Whitefield'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'CLG', 'Challaghatta', 12.9594, 77.5255, 'West'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'GRP', 'Garudacharpalya', 12.9941, 77.6950, 'East'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'MSR', 'Mysore Road', 12.9467, 77.5301, 'South West'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'PAT', 'Pattanagere Agrahara', 12.9173, 77.5086, 'South West'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'MAD', 'Madavara', 13.0624, 77.5027, 'North'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'SII', 'Silk Institute', 12.8613, 77.4901, 'South'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'NPI', 'Nagasandra/Peenya Industry', 13.0475, 77.5008, 'North'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'YLH', 'Yelachenahalli', 12.8856, 77.5727, 'South'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'RVR', 'R V Road', 12.9222, 77.5848, 'South'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'BMS', 'Bommasandra', 12.8008, 77.7043, 'South East'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'CUP', 'Cubbon Park', 12.9750, 77.6010, 'Central'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'MGR', 'MG Road', 12.9800, 77.6080, 'Central East'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO stops (city_id, stop_code, stop_name, latitude, longitude, zone_name)
SELECT city_id, 'IDC', 'Indiranagar', 12.9900, 77.6250, 'East'
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO routes (city_id, route_code, route_name, mode_type, total_distance_km)
SELECT city_id, '47C', 'Majestic Bus Stand to Indiranagar', 'BUS', 11.20
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO routes (city_id, route_code, route_name, mode_type, total_distance_km)
SELECT city_id, 'L1', 'Purple Line Whitefield to Challaghatta', 'METRO', 43.50
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO routes (city_id, route_code, route_name, mode_type, total_distance_km)
SELECT city_id, 'L2', 'Green Line Madavara to Silk Institute', 'METRO', 31.00
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO routes (city_id, route_code, route_name, mode_type, total_distance_km)
SELECT city_id, 'YL1', 'Yellow Line R V Road to Bommasandra', 'METRO', 19.20
FROM cities WHERE city_name = 'Bengaluru';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 1, 0, 0 FROM routes r CROSS JOIN stops s
WHERE r.route_code = '47C' AND s.stop_code = 'MBS';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 2, 5, 2.4 FROM routes r CROSS JOIN stops s
WHERE r.route_code = '47C' AND s.stop_code = 'CUP';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 3, 10, 5.6 FROM routes r CROSS JOIN stops s
WHERE r.route_code = '47C' AND s.stop_code = 'MGR';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 4, 18, 11.2 FROM routes r CROSS JOIN stops s
WHERE r.route_code = '47C' AND s.stop_code = 'IDC';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 1, 0, 0 FROM routes r CROSS JOIN stops s
WHERE r.route_code = 'L1' AND s.stop_code = 'WFM';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 2, 18, 11.5 FROM routes r CROSS JOIN stops s
WHERE r.route_code = 'L1' AND s.stop_code = 'GRP';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 3, 38, 22.7 FROM routes r CROSS JOIN stops s
WHERE r.route_code = 'L1' AND s.stop_code = 'MJM';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 4, 47, 28.6 FROM routes r CROSS JOIN stops s
WHERE r.route_code = 'L1' AND s.stop_code = 'MSR';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 5, 58, 43.5 FROM routes r CROSS JOIN stops s
WHERE r.route_code = 'L1' AND s.stop_code = 'CLG';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 1, 0, 0 FROM routes r CROSS JOIN stops s
WHERE r.route_code = 'L2' AND s.stop_code = 'MAD';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 2, 12, 7.5 FROM routes r CROSS JOIN stops s
WHERE r.route_code = 'L2' AND s.stop_code = 'NPI';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 3, 28, 18.3 FROM routes r CROSS JOIN stops s
WHERE r.route_code = 'L2' AND s.stop_code = 'MJM';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 4, 42, 24.7 FROM routes r CROSS JOIN stops s
WHERE r.route_code = 'L2' AND s.stop_code = 'YLH';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 5, 52, 31.0 FROM routes r CROSS JOIN stops s
WHERE r.route_code = 'L2' AND s.stop_code = 'SII';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 1, 0, 0 FROM routes r CROSS JOIN stops s
WHERE r.route_code = 'YL1' AND s.stop_code = 'RVR';

INSERT INTO route_stops (route_id, stop_id, stop_sequence, planned_offset_min, distance_from_origin_km)
SELECT r.route_id, s.stop_id, 2, 30, 19.2 FROM routes r CROSS JOIN stops s
WHERE r.route_code = 'YL1' AND s.stop_code = 'BMS';

INSERT INTO vehicles (route_id, vehicle_code, vehicle_type, registration_no, total_seats, is_ac)
SELECT route_id, 'BUS-47C-01', 'BUS', 'KA01AB4701', 30, 'N'
FROM routes WHERE route_code = '47C';

INSERT INTO vehicles (route_id, vehicle_code, vehicle_type, registration_no, total_seats, is_ac)
SELECT route_id, 'METRO-L1-01', 'METRO', 'KA01MT1001', 80, 'Y'
FROM routes WHERE route_code = 'L1';

INSERT INTO vehicles (route_id, vehicle_code, vehicle_type, registration_no, total_seats, is_ac)
SELECT route_id, 'METRO-L2-01', 'METRO', 'KA01MT2001', 80, 'Y'
FROM routes WHERE route_code = 'L2';

INSERT INTO vehicles (route_id, vehicle_code, vehicle_type, registration_no, total_seats, is_ac)
SELECT route_id, 'METRO-YL1-01', 'METRO', 'KA01MT3001', 80, 'Y'
FROM routes WHERE route_code = 'YL1';

INSERT INTO live_tracking (vehicle_id, route_id, current_stop_id, latitude, longitude, speed_kmph, delay_minutes, seats_available, last_reported_at)
SELECT v.vehicle_id, r.route_id, s.stop_id, 12.9800, 77.6080, 28, 8, 12, CURRENT_TIMESTAMP
FROM vehicles v
JOIN routes r ON r.route_id = v.route_id
JOIN stops s ON s.stop_code = 'MGR'
WHERE v.vehicle_code = 'BUS-47C-01';

INSERT INTO live_tracking (vehicle_id, route_id, current_stop_id, latitude, longitude, speed_kmph, delay_minutes, seats_available, last_reported_at)
SELECT v.vehicle_id, r.route_id, s.stop_id, 13.0067, 77.6957, 49, 6, 45, CURRENT_TIMESTAMP
FROM vehicles v
JOIN routes r ON r.route_id = v.route_id
JOIN stops s ON s.stop_code = 'KRP'
WHERE v.vehicle_code = 'METRO-L1-01';

INSERT INTO live_tracking (vehicle_id, route_id, current_stop_id, latitude, longitude, speed_kmph, delay_minutes, seats_available, last_reported_at)
SELECT v.vehicle_id, r.route_id, s.stop_id, 12.8856, 77.5727, 42, 4, 58, CURRENT_TIMESTAMP
FROM vehicles v
JOIN routes r ON r.route_id = v.route_id
JOIN stops s ON s.stop_code = 'YLH'
WHERE v.vehicle_code = 'METRO-L2-01';

INSERT INTO live_tracking (vehicle_id, route_id, current_stop_id, latitude, longitude, speed_kmph, delay_minutes, seats_available, last_reported_at)
SELECT v.vehicle_id, r.route_id, s.stop_id, 12.8610, 77.6640, 35, 2, 52, CURRENT_TIMESTAMP
FROM vehicles v
JOIN routes r ON r.route_id = v.route_id
JOIN stops s ON s.stop_code = 'RVR'
WHERE v.vehicle_code = 'METRO-YL1-01';

INSERT INTO fares (route_id, fare_category, base_fare, ac_surcharge, peak_hour_multiplier)
SELECT route_id, 'ADULT', 18, 0, 1.20 FROM routes WHERE route_code = '47C';

INSERT INTO fares (route_id, fare_category, base_fare, ac_surcharge, peak_hour_multiplier)
SELECT route_id, 'STUDENT', 10, 0, 1.00 FROM routes WHERE route_code = '47C';

INSERT INTO fares (route_id, fare_category, base_fare, ac_surcharge, peak_hour_multiplier)
SELECT route_id, 'ADULT', 35, 10, 1.10 FROM routes WHERE route_code IN ('L1', 'L2', 'YL1');

INSERT INTO pass_types (pass_name, duration_days, price_amount, applicable_mode, eligible_role)
VALUES ('Daily Pass', 1, 30, 'BUS', 'PASSENGER');

INSERT INTO pass_types (pass_name, duration_days, price_amount, applicable_mode, eligible_role)
VALUES ('Weekly Pass', 7, 150, 'BUS', 'PASSENGER');

INSERT INTO pass_types (pass_name, duration_days, price_amount, applicable_mode, eligible_role)
VALUES ('Monthly Pass', 30, 500, 'BUS', 'PASSENGER');

INSERT INTO pass_types (pass_name, duration_days, price_amount, applicable_mode, eligible_role)
VALUES ('Student Pass', 30, 250, 'BUS', 'PASSENGER');

INSERT INTO passes (user_id, pass_type_id, pass_number, valid_from, valid_to, auto_renew)
SELECT u.user_id, p.pass_type_id, 'PASS-2026-001', DATE '2026-03-12', DATE '2026-03-20', 'Y'
FROM app_users u
JOIN pass_types p ON p.pass_name = 'Monthly Pass'
WHERE u.email = 'sri@example.com';

INSERT INTO complaints (user_id, route_id, vehicle_id, complaint_category, complaint_text)
SELECT u.user_id, r.route_id, v.vehicle_id, 'Delay', 'Train was delayed near KR Puram during the morning commute.'
FROM app_users u
JOIN routes r ON r.route_code = 'L1'
JOIN vehicles v ON v.vehicle_code = 'METRO-L1-01'
WHERE u.email = 'sri@example.com';

INSERT INTO alerts (route_id, vehicle_id, alert_type, severity_level, alert_message, expires_at)
SELECT r.route_id, v.vehicle_id, 'DELAY', 'HIGH', 'Purple Line delayed near KR Puram. Expect 6 extra minutes.',
       CURRENT_TIMESTAMP + INTERVAL '2' HOUR
FROM routes r
JOIN vehicles v ON v.vehicle_code = 'METRO-L1-01'
WHERE r.route_code = 'L1';

INSERT INTO favorites (user_id, route_id)
SELECT u.user_id, r.route_id
FROM app_users u
JOIN routes r ON r.route_code = 'L1'
WHERE u.email = 'sri@example.com';

INSERT INTO trip_history (user_id, origin_stop_id, destination_stop_id, chosen_route_id)
SELECT u.user_id, s1.stop_id, s2.stop_id, r.route_id
FROM app_users u
JOIN stops s1 ON s1.stop_code = 'MJM'
JOIN stops s2 ON s2.stop_code = 'WFM'
JOIN routes r ON r.route_code = 'L1'
WHERE u.email = 'sri@example.com';

INSERT INTO schedules (route_id, vehicle_id, service_day, start_stop_id, end_stop_id, departure_time, arrival_time, frequency_min, is_peak_hour)
SELECT r.route_id, v.vehicle_id, 'MONDAY', s1.stop_id, s2.stop_id,
       TO_TIMESTAMP('2026-03-18 04:15:00', 'YYYY-MM-DD HH24:MI:SS'),
       TO_TIMESTAMP('2026-03-18 04:35:00', 'YYYY-MM-DD HH24:MI:SS'),
       20, 'N'
FROM routes r
JOIN vehicles v ON v.route_id = r.route_id
JOIN stops s1 ON s1.stop_code = 'WFM'
JOIN stops s2 ON s2.stop_code = 'CLG'
WHERE r.route_code = 'L1';

INSERT INTO schedules (route_id, vehicle_id, service_day, start_stop_id, end_stop_id, departure_time, arrival_time, frequency_min, is_peak_hour)
SELECT r.route_id, v.vehicle_id, 'MONDAY', s1.stop_id, s2.stop_id,
       TO_TIMESTAMP('2026-03-18 10:57:00', 'YYYY-MM-DD HH24:MI:SS'),
       TO_TIMESTAMP('2026-03-18 15:21:00', 'YYYY-MM-DD HH24:MI:SS'),
       8, 'Y'
FROM routes r
JOIN vehicles v ON v.route_id = r.route_id
JOIN stops s1 ON s1.stop_code = 'WFM'
JOIN stops s2 ON s2.stop_code = 'CLG'
WHERE r.route_code = 'L1';

INSERT INTO schedules (route_id, vehicle_id, service_day, start_stop_id, end_stop_id, departure_time, arrival_time, frequency_min, is_peak_hour)
SELECT r.route_id, v.vehicle_id, 'MONDAY', s1.stop_id, s2.stop_id,
       TO_TIMESTAMP('2026-03-18 12:20:00', 'YYYY-MM-DD HH24:MI:SS'),
       TO_TIMESTAMP('2026-03-18 16:45:00', 'YYYY-MM-DD HH24:MI:SS'),
       8, 'Y'
FROM routes r
JOIN vehicles v ON v.route_id = r.route_id
JOIN stops s1 ON s1.stop_code = 'CLG'
JOIN stops s2 ON s2.stop_code = 'WFM'
WHERE r.route_code = 'L1';

INSERT INTO schedules (route_id, vehicle_id, service_day, start_stop_id, end_stop_id, departure_time, arrival_time, frequency_min, is_peak_hour)
SELECT r.route_id, v.vehicle_id, 'MONDAY', s1.stop_id, s2.stop_id,
       TO_TIMESTAMP('2026-03-18 06:53:00', 'YYYY-MM-DD HH24:MI:SS'),
       TO_TIMESTAMP('2026-03-18 10:55:00', 'YYYY-MM-DD HH24:MI:SS'),
       5, 'Y'
FROM routes r
JOIN vehicles v ON v.route_id = r.route_id
JOIN stops s1 ON s1.stop_code = 'GRP'
JOIN stops s2 ON s2.stop_code = 'WFM'
WHERE r.route_code = 'L1';

INSERT INTO schedules (route_id, vehicle_id, service_day, start_stop_id, end_stop_id, departure_time, arrival_time, frequency_min, is_peak_hour)
SELECT r.route_id, v.vehicle_id, 'MONDAY', s1.stop_id, s2.stop_id,
       TO_TIMESTAMP('2026-03-18 07:22:00', 'YYYY-MM-DD HH24:MI:SS'),
       TO_TIMESTAMP('2026-03-18 10:20:00', 'YYYY-MM-DD HH24:MI:SS'),
       5, 'Y'
FROM routes r
JOIN vehicles v ON v.route_id = r.route_id
JOIN stops s1 ON s1.stop_code = 'MSR'
JOIN stops s2 ON s2.stop_code = 'GRP'
WHERE r.route_code = 'L1';

INSERT INTO schedules (route_id, vehicle_id, service_day, start_stop_id, end_stop_id, departure_time, arrival_time, frequency_min, is_peak_hour)
SELECT r.route_id, v.vehicle_id, 'MONDAY', s1.stop_id, s2.stop_id,
       TO_TIMESTAMP('2026-03-18 10:39:00', 'YYYY-MM-DD HH24:MI:SS'),
       TO_TIMESTAMP('2026-03-18 15:51:00', 'YYYY-MM-DD HH24:MI:SS'),
       8, 'Y'
FROM routes r
JOIN vehicles v ON v.route_id = r.route_id
JOIN stops s1 ON s1.stop_code = 'MAD'
JOIN stops s2 ON s2.stop_code = 'SII'
WHERE r.route_code = 'L2';

INSERT INTO schedules (route_id, vehicle_id, service_day, start_stop_id, end_stop_id, departure_time, arrival_time, frequency_min, is_peak_hour)
SELECT r.route_id, v.vehicle_id, 'MONDAY', s1.stop_id, s2.stop_id,
       TO_TIMESTAMP('2026-03-18 11:09:00', 'YYYY-MM-DD HH24:MI:SS'),
       TO_TIMESTAMP('2026-03-18 16:48:00', 'YYYY-MM-DD HH24:MI:SS'),
       8, 'Y'
FROM routes r
JOIN vehicles v ON v.route_id = r.route_id
JOIN stops s1 ON s1.stop_code = 'SII'
JOIN stops s2 ON s2.stop_code = 'MAD'
WHERE r.route_code = 'L2';

INSERT INTO schedules (route_id, vehicle_id, service_day, start_stop_id, end_stop_id, departure_time, arrival_time, frequency_min, is_peak_hour)
SELECT r.route_id, v.vehicle_id, 'MONDAY', s1.stop_id, s2.stop_id,
       TO_TIMESTAMP('2026-03-18 06:37:00', 'YYYY-MM-DD HH24:MI:SS'),
       TO_TIMESTAMP('2026-03-18 10:22:00', 'YYYY-MM-DD HH24:MI:SS'),
       5, 'Y'
FROM routes r
JOIN vehicles v ON v.route_id = r.route_id
JOIN stops s1 ON s1.stop_code = 'NPI'
JOIN stops s2 ON s2.stop_code = 'SII'
WHERE r.route_code = 'L2';

INSERT INTO schedules (route_id, vehicle_id, service_day, start_stop_id, end_stop_id, departure_time, arrival_time, frequency_min, is_peak_hour)
SELECT r.route_id, v.vehicle_id, 'MONDAY', s1.stop_id, s2.stop_id,
       TO_TIMESTAMP('2026-03-18 07:20:00', 'YYYY-MM-DD HH24:MI:SS'),
       TO_TIMESTAMP('2026-03-18 10:50:00', 'YYYY-MM-DD HH24:MI:SS'),
       5, 'Y'
FROM routes r
JOIN vehicles v ON v.route_id = r.route_id
JOIN stops s1 ON s1.stop_code = 'YLH'
JOIN stops s2 ON s2.stop_code = 'MAD'
WHERE r.route_code = 'L2';

INSERT INTO schedules (route_id, vehicle_id, service_day, start_stop_id, end_stop_id, departure_time, arrival_time, frequency_min, is_peak_hour)
SELECT r.route_id, v.vehicle_id, 'TUESDAY_TO_FRIDAY', s1.stop_id, s2.stop_id,
       TO_TIMESTAMP('2026-03-19 10:39:00', 'YYYY-MM-DD HH24:MI:SS'),
       TO_TIMESTAMP('2026-03-19 15:51:00', 'YYYY-MM-DD HH24:MI:SS'),
       8, 'Y'
FROM routes r
JOIN vehicles v ON v.route_id = r.route_id
JOIN stops s1 ON s1.stop_code = 'MAD'
JOIN stops s2 ON s2.stop_code = 'SII'
WHERE r.route_code = 'L2';

INSERT INTO schedules (route_id, vehicle_id, service_day, start_stop_id, end_stop_id, departure_time, arrival_time, frequency_min, is_peak_hour)
SELECT r.route_id, v.vehicle_id, 'TUESDAY_TO_FRIDAY', s1.stop_id, s2.stop_id,
       TO_TIMESTAMP('2026-03-19 11:09:00', 'YYYY-MM-DD HH24:MI:SS'),
       TO_TIMESTAMP('2026-03-19 16:48:00', 'YYYY-MM-DD HH24:MI:SS'),
       8, 'Y'
FROM routes r
JOIN vehicles v ON v.route_id = r.route_id
JOIN stops s1 ON s1.stop_code = 'SII'
JOIN stops s2 ON s2.stop_code = 'MAD'
WHERE r.route_code = 'L2';

INSERT INTO schedules (route_id, vehicle_id, service_day, start_stop_id, end_stop_id, departure_time, arrival_time, frequency_min, is_peak_hour)
SELECT r.route_id, v.vehicle_id, 'MONDAY', s1.stop_id, s2.stop_id,
       TO_TIMESTAMP('2026-03-18 05:05:00', 'YYYY-MM-DD HH24:MI:SS'),
       TO_TIMESTAMP('2026-03-18 05:35:00', 'YYYY-MM-DD HH24:MI:SS'),
       30, 'N'
FROM routes r
JOIN vehicles v ON v.route_id = r.route_id
JOIN stops s1 ON s1.stop_code = 'RVR'
JOIN stops s2 ON s2.stop_code = 'BMS'
WHERE r.route_code = 'YL1';

INSERT INTO schedules (route_id, vehicle_id, service_day, start_stop_id, end_stop_id, departure_time, arrival_time, frequency_min, is_peak_hour)
SELECT r.route_id, v.vehicle_id, 'MONDAY', s1.stop_id, s2.stop_id,
       TO_TIMESTAMP('2026-03-18 10:30:00', 'YYYY-MM-DD HH24:MI:SS'),
       TO_TIMESTAMP('2026-03-18 16:06:00', 'YYYY-MM-DD HH24:MI:SS'),
       14, 'N'
FROM routes r
JOIN vehicles v ON v.route_id = r.route_id
JOIN stops s1 ON s1.stop_code = 'BMS'
JOIN stops s2 ON s2.stop_code = 'RVR'
WHERE r.route_code = 'YL1';

COMMIT;
