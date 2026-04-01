PROMPT ===== Busiest Routes =====
SELECT r.route_code,
       r.route_name,
       COUNT(th.trip_history_id) AS search_count,
       COUNT(DISTINCT th.user_id) AS unique_users
FROM routes r
LEFT JOIN trip_history th ON th.chosen_route_id = r.route_id
GROUP BY r.route_code, r.route_name
ORDER BY search_count DESC, unique_users DESC;

PROMPT ===== Most Delayed Routes =====
SELECT route_code,
       route_name,
       current_delay_status,
       max_delay_minutes,
       active_vehicle_count
FROM vw_active_live_routes
ORDER BY max_delay_minutes DESC, active_vehicle_count DESC;

PROMPT ===== Pass Sales By Month =====
SELECT TO_CHAR(paid_at, 'YYYY-MM') AS sale_month,
       COUNT(payment_id) AS payment_count,
       SUM(payment_amount) AS total_revenue
FROM payments
WHERE payment_status = 'SUCCESS'
GROUP BY TO_CHAR(paid_at, 'YYYY-MM')
ORDER BY sale_month;

PROMPT ===== Most Frequent Complaints =====
SELECT complaint_category,
       COUNT(*) AS complaint_count
FROM complaints
GROUP BY complaint_category
ORDER BY complaint_count DESC, complaint_category;

PROMPT ===== Complaint Summary By Route =====
SELECT route_code,
       route_name,
       complaint_count,
       pending_count,
       resolved_count,
       latest_complaint_at
FROM vw_complaint_summary_by_route
ORDER BY complaint_count DESC, latest_complaint_at DESC;
