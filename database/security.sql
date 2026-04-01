PROMPT Run this script as SYS, SYSTEM, or another DBA-enabled account.

BEGIN
  EXECUTE IMMEDIATE 'CREATE ROLE smart_transit_admin_role';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1921 THEN
      RAISE;
    END IF;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'CREATE ROLE smart_transit_app_role';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1921 THEN
      RAISE;
    END IF;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'CREATE ROLE smart_transit_reporting_role';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1921 THEN
      RAISE;
    END IF;
END;
/

GRANT SELECT, INSERT, UPDATE, DELETE ON app_users TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON cities TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON stops TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON routes TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON route_stops TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON vehicles TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON schedules TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON live_tracking TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON fares TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON pass_types TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON passes TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON complaints TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON complaint_audit_log TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON alerts TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON favorites TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON trip_history TO smart_transit_admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON route_runtime_status TO smart_transit_admin_role;

GRANT SELECT, INSERT, UPDATE ON app_users TO smart_transit_app_role;
GRANT SELECT ON cities TO smart_transit_app_role;
GRANT SELECT ON stops TO smart_transit_app_role;
GRANT SELECT ON routes TO smart_transit_app_role;
GRANT SELECT ON route_stops TO smart_transit_app_role;
GRANT SELECT ON vehicles TO smart_transit_app_role;
GRANT SELECT ON schedules TO smart_transit_app_role;
GRANT SELECT, INSERT, UPDATE ON live_tracking TO smart_transit_app_role;
GRANT SELECT ON fares TO smart_transit_app_role;
GRANT SELECT ON pass_types TO smart_transit_app_role;
GRANT SELECT, INSERT, UPDATE ON passes TO smart_transit_app_role;
GRANT SELECT, INSERT ON payments TO smart_transit_app_role;
GRANT SELECT, INSERT, UPDATE ON complaints TO smart_transit_app_role;
GRANT SELECT ON alerts TO smart_transit_app_role;
GRANT SELECT, INSERT, DELETE ON favorites TO smart_transit_app_role;
GRANT SELECT, INSERT ON trip_history TO smart_transit_app_role;
GRANT SELECT ON route_runtime_status TO smart_transit_app_role;

GRANT SELECT ON vw_active_live_routes TO smart_transit_reporting_role;
GRANT SELECT ON vw_delayed_vehicles TO smart_transit_reporting_role;
GRANT SELECT ON vw_expiring_passes TO smart_transit_reporting_role;
GRANT SELECT ON vw_complaint_summary_by_route TO smart_transit_reporting_role;
GRANT SELECT ON payments TO smart_transit_reporting_role;
GRANT SELECT ON complaints TO smart_transit_reporting_role;
GRANT SELECT ON trip_history TO smart_transit_reporting_role;

GRANT EXECUTE ON fn_calculate_fare TO smart_transit_app_role;
GRANT EXECUTE ON fn_best_fare TO smart_transit_app_role;
GRANT EXECUTE ON fn_estimate_eta TO smart_transit_app_role;
GRANT EXECUTE ON fn_pass_is_valid TO smart_transit_app_role;
GRANT EXECUTE ON pr_book_pass TO smart_transit_app_role;
GRANT EXECUTE ON pr_renew_pass TO smart_transit_app_role;
GRANT EXECUTE ON pr_log_complaint TO smart_transit_app_role;
GRANT EXECUTE ON pr_find_route_interchanges TO smart_transit_app_role;

GRANT smart_transit_admin_role TO smart_transit;
GRANT smart_transit_app_role TO smart_transit;
