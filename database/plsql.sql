CREATE OR REPLACE TRIGGER trg_set_updated_at_users
BEFORE UPDATE ON app_users
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_set_updated_at_routes
BEFORE UPDATE ON routes
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_set_updated_at_vehicles
BEFORE UPDATE ON vehicles
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_set_updated_at_complaints
BEFORE UPDATE ON complaints
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_live_tracking_delay_status
BEFORE INSERT OR UPDATE ON live_tracking
FOR EACH ROW
BEGIN
  IF :NEW.delay_minutes >= 10 THEN
    :NEW.delay_status := 'DELAYED';
  ELSIF :NEW.delay_minutes > 0 THEN
    :NEW.delay_status := 'SLOW';
  ELSE
    :NEW.delay_status := 'ON_TIME';
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_pass_expiry_status
BEFORE INSERT OR UPDATE ON passes
FOR EACH ROW
BEGIN
  IF :NEW.valid_to < TRUNC(SYSDATE) THEN
    :NEW.pass_status := 'EXPIRED';
  ELSIF :NEW.pass_status IS NULL THEN
    :NEW.pass_status := 'ACTIVE';
  END IF;
END;
/

CREATE OR REPLACE FUNCTION fn_calculate_fare (
  p_route_id IN NUMBER,
  p_fare_category IN VARCHAR2,
  p_is_ac IN CHAR,
  p_is_peak_hour IN CHAR
) RETURN NUMBER
IS
  v_base NUMBER(8,2);
  v_ac NUMBER(8,2);
  v_peak NUMBER(5,2);
BEGIN
  SELECT base_fare, ac_surcharge, peak_hour_multiplier
  INTO v_base, v_ac, v_peak
  FROM fares
  WHERE route_id = p_route_id
    AND fare_category = p_fare_category
    AND active_flag = 'Y';

  IF p_is_ac = 'Y' THEN
    v_base := v_base + v_ac;
  END IF;

  IF p_is_peak_hour = 'Y' THEN
    v_base := v_base * v_peak;
  END IF;

  RETURN ROUND(v_base, 2);
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END;
/

CREATE OR REPLACE PROCEDURE pr_assign_driver (
  p_driver_id IN NUMBER,
  p_vehicle_id IN NUMBER,
  p_route_id IN NUMBER,
  p_assignment_date IN DATE
)
IS
BEGIN
  INSERT INTO driver_assignments (
    driver_id,
    vehicle_id,
    route_id,
    assignment_date,
    shift_start,
    assignment_status
  ) VALUES (
    p_driver_id,
    p_vehicle_id,
    p_route_id,
    p_assignment_date,
    CURRENT_TIMESTAMP,
    'ASSIGNED'
  );
END;
/

CREATE OR REPLACE FUNCTION fn_estimate_eta (
  p_route_id IN NUMBER,
  p_current_stop_id IN NUMBER,
  p_target_stop_id IN NUMBER,
  p_delay_minutes IN NUMBER
) RETURN NUMBER
IS
  v_current_seq NUMBER;
  v_target_seq NUMBER;
  v_current_offset NUMBER;
  v_target_offset NUMBER;
BEGIN
  SELECT stop_sequence, planned_offset_min
  INTO v_current_seq, v_current_offset
  FROM route_stops
  WHERE route_id = p_route_id
    AND stop_id = p_current_stop_id;

  SELECT stop_sequence, planned_offset_min
  INTO v_target_seq, v_target_offset
  FROM route_stops
  WHERE route_id = p_route_id
    AND stop_id = p_target_stop_id;

  IF v_target_seq < v_current_seq THEN
    RETURN NULL;
  END IF;

  RETURN (v_target_offset - v_current_offset) + NVL(p_delay_minutes, 0);
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END;
/

BEGIN
  DBMS_SCHEDULER.CREATE_JOB (
    job_name        => 'JOB_MARK_EXPIRED_PASSES',
    job_type        => 'PLSQL_BLOCK',
    job_action      => 'BEGIN UPDATE passes SET pass_status = ''EXPIRED'' WHERE valid_to < TRUNC(SYSDATE) AND pass_status <> ''EXPIRED''; COMMIT; END;',
    start_date      => SYSTIMESTAMP,
    repeat_interval => 'FREQ=DAILY;BYHOUR=0;BYMINUTE=5;BYSECOND=0',
    enabled         => TRUE
  );
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -27477 THEN
      RAISE;
    END IF;
END;
/
