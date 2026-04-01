CREATE OR REPLACE VIEW vw_active_live_routes AS
SELECT r.route_id,
       r.route_code,
       r.route_name,
       r.mode_type,
       COUNT(lt.tracking_id) AS active_vehicle_count,
       MAX(lt.last_reported_at) AS last_live_report_at,
       rs.current_delay_status,
       rs.max_delay_minutes
FROM routes r
JOIN live_tracking lt ON lt.route_id = r.route_id
LEFT JOIN route_runtime_status rs ON rs.route_id = r.route_id
WHERE r.route_status = 'ACTIVE'
GROUP BY r.route_id,
         r.route_code,
         r.route_name,
         r.mode_type,
         rs.current_delay_status,
         rs.max_delay_minutes;
/

CREATE OR REPLACE VIEW vw_delayed_vehicles AS
SELECT r.route_code,
       r.route_name,
       v.vehicle_code,
       lt.delay_minutes,
       lt.delay_status,
       lt.seats_available,
       lt.last_reported_at
FROM live_tracking lt
JOIN routes r ON r.route_id = lt.route_id
JOIN vehicles v ON v.vehicle_id = lt.vehicle_id
WHERE lt.delay_minutes > 0
ORDER BY lt.delay_minutes DESC, lt.last_reported_at DESC;
/

CREATE OR REPLACE VIEW vw_expiring_passes AS
SELECT p.pass_id,
       p.pass_number,
       u.full_name,
       pt.pass_name,
       p.valid_from,
       p.valid_to,
       (p.valid_to - TRUNC(SYSDATE)) AS days_left,
       p.pass_status
FROM passes p
JOIN app_users u ON u.user_id = p.user_id
JOIN pass_types pt ON pt.pass_type_id = p.pass_type_id
WHERE p.pass_status = 'ACTIVE'
  AND p.valid_to BETWEEN TRUNC(SYSDATE) AND TRUNC(SYSDATE) + 7
ORDER BY p.valid_to;
/

CREATE OR REPLACE VIEW vw_complaint_summary_by_route AS
SELECT NVL(r.route_code, 'UNMAPPED') AS route_code,
       NVL(r.route_name, 'General Complaint') AS route_name,
       COUNT(c.complaint_id) AS complaint_count,
       SUM(CASE WHEN c.complaint_status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count,
       SUM(CASE WHEN c.complaint_status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved_count,
       MAX(c.created_at) AS latest_complaint_at
FROM complaints c
LEFT JOIN routes r ON r.route_id = c.route_id
GROUP BY NVL(r.route_code, 'UNMAPPED'),
         NVL(r.route_name, 'General Complaint');
/
