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

CREATE OR REPLACE TRIGGER trg_set_updated_at_passes
BEFORE UPDATE ON passes
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_set_updated_at_payments
BEFORE UPDATE ON payments
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

CREATE OR REPLACE TRIGGER trg_live_tracking_route_runtime
AFTER INSERT OR UPDATE ON live_tracking
FOR EACH ROW
BEGIN
  MERGE INTO route_runtime_status target
  USING (
    SELECT r.route_id,
           r.route_code,
           CASE
             WHEN MAX(lt.delay_minutes) >= 10 THEN 'DELAYED'
             WHEN MAX(lt.delay_minutes) > 0 THEN 'SLOW'
             ELSE 'ON_TIME'
           END AS current_delay_status,
           NVL(MAX(lt.delay_minutes), 0) AS max_delay_minutes,
           COUNT(*) AS active_vehicle_count
    FROM routes r
    LEFT JOIN live_tracking lt ON lt.route_id = r.route_id
    WHERE r.route_id = :NEW.route_id
    GROUP BY r.route_id, r.route_code
  ) source
  ON (target.route_id = source.route_id)
  WHEN MATCHED THEN
    UPDATE SET
      target.route_code = source.route_code,
      target.current_delay_status = source.current_delay_status,
      target.max_delay_minutes = source.max_delay_minutes,
      target.active_vehicle_count = source.active_vehicle_count,
      target.last_updated_at = CURRENT_TIMESTAMP
  WHEN NOT MATCHED THEN
    INSERT (
      route_id,
      route_code,
      current_delay_status,
      max_delay_minutes,
      active_vehicle_count,
      last_updated_at
    )
    VALUES (
      source.route_id,
      source.route_code,
      source.current_delay_status,
      source.max_delay_minutes,
      source.active_vehicle_count,
      CURRENT_TIMESTAMP
    );
END;
/

CREATE OR REPLACE TRIGGER trg_complaint_status_audit
AFTER INSERT OR UPDATE OF complaint_status ON complaints
FOR EACH ROW
BEGIN
  INSERT INTO complaint_audit_log (
    complaint_id,
    old_status,
    new_status,
    remarks
  ) VALUES (
    :NEW.complaint_id,
    CASE WHEN INSERTING THEN NULL ELSE :OLD.complaint_status END,
    :NEW.complaint_status,
    CASE
      WHEN INSERTING THEN 'Complaint created'
      ELSE 'Complaint status updated'
    END
  );
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

CREATE OR REPLACE FUNCTION fn_best_fare (
  p_route_id IN NUMBER,
  p_is_ac IN CHAR DEFAULT 'N',
  p_is_peak_hour IN CHAR DEFAULT 'N'
) RETURN NUMBER
IS
  v_best_fare NUMBER(8,2);
BEGIN
  SELECT MIN(fn_calculate_fare(p_route_id, fare_category, p_is_ac, p_is_peak_hour))
  INTO v_best_fare
  FROM fares
  WHERE route_id = p_route_id
    AND active_flag = 'Y';

  RETURN v_best_fare;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
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

CREATE OR REPLACE FUNCTION fn_pass_is_valid (
  p_pass_number IN VARCHAR2,
  p_check_date IN DATE DEFAULT TRUNC(SYSDATE)
) RETURN CHAR
IS
  v_valid_count NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_valid_count
  FROM passes
  WHERE pass_number = p_pass_number
    AND pass_status = 'ACTIVE'
    AND p_check_date BETWEEN valid_from AND valid_to;

  RETURN CASE WHEN v_valid_count > 0 THEN 'Y' ELSE 'N' END;
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

CREATE OR REPLACE PROCEDURE pr_book_pass (
  p_user_id IN NUMBER,
  p_pass_type_id IN NUMBER,
  p_payment_method IN VARCHAR2,
  p_auto_renew IN CHAR DEFAULT 'N',
  p_pass_number OUT VARCHAR2,
  p_payment_reference OUT VARCHAR2
)
IS
  v_duration_days pass_types.duration_days%TYPE;
  v_price_amount pass_types.price_amount%TYPE;
  v_pass_id passes.pass_id%TYPE;
  v_valid_from DATE := TRUNC(SYSDATE);
  v_valid_to DATE;
BEGIN
  SAVEPOINT sp_book_pass;

  SELECT duration_days, price_amount
  INTO v_duration_days, v_price_amount
  FROM pass_types
  WHERE pass_type_id = p_pass_type_id;

  v_valid_to := v_valid_from + v_duration_days - 1;
  p_pass_number := 'PASS-' || TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISSFF3');
  p_payment_reference := 'PAY-' || TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISSFF3');

  INSERT INTO passes (
    user_id,
    pass_type_id,
    pass_number,
    valid_from,
    valid_to,
    auto_renew
  ) VALUES (
    p_user_id,
    p_pass_type_id,
    p_pass_number,
    v_valid_from,
    v_valid_to,
    p_auto_renew
  )
  RETURNING pass_id INTO v_pass_id;

  INSERT INTO payments (
    user_id,
    pass_id,
    pass_type_id,
    payment_reference,
    payment_method,
    payment_amount,
    payment_status
  ) VALUES (
    p_user_id,
    v_pass_id,
    p_pass_type_id,
    p_payment_reference,
    p_payment_method,
    v_price_amount,
    'SUCCESS'
  );

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK TO sp_book_pass;
    RAISE;
END;
/

CREATE OR REPLACE PROCEDURE pr_renew_pass (
  p_pass_number IN VARCHAR2,
  p_payment_method IN VARCHAR2,
  p_payment_reference OUT VARCHAR2
)
IS
  v_pass_id passes.pass_id%TYPE;
  v_user_id passes.user_id%TYPE;
  v_pass_type_id passes.pass_type_id%TYPE;
  v_price_amount pass_types.price_amount%TYPE;
  v_duration_days pass_types.duration_days%TYPE;
  v_current_valid_to passes.valid_to%TYPE;
  v_new_valid_to DATE;
BEGIN
  SAVEPOINT sp_renew_pass;

  SELECT p.pass_id, p.user_id, p.pass_type_id, p.valid_to, pt.price_amount, pt.duration_days
  INTO v_pass_id, v_user_id, v_pass_type_id, v_current_valid_to, v_price_amount, v_duration_days
  FROM passes p
  JOIN pass_types pt ON pt.pass_type_id = p.pass_type_id
  WHERE p.pass_number = p_pass_number;

  v_new_valid_to := GREATEST(v_current_valid_to, TRUNC(SYSDATE)) + v_duration_days;
  p_payment_reference := 'PAY-REN-' || TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISSFF3');

  UPDATE passes
  SET valid_to = v_new_valid_to,
      pass_status = 'ACTIVE'
  WHERE pass_id = v_pass_id;

  INSERT INTO payments (
    user_id,
    pass_id,
    pass_type_id,
    payment_reference,
    payment_method,
    payment_amount,
    payment_status
  ) VALUES (
    v_user_id,
    v_pass_id,
    v_pass_type_id,
    p_payment_reference,
    p_payment_method,
    v_price_amount,
    'SUCCESS'
  );

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK TO sp_renew_pass;
    RAISE;
END;
/

CREATE OR REPLACE PROCEDURE pr_log_complaint (
  p_user_id IN NUMBER,
  p_route_id IN NUMBER,
  p_vehicle_id IN NUMBER,
  p_complaint_category IN VARCHAR2,
  p_complaint_text IN VARCHAR2,
  p_complaint_id OUT NUMBER
)
IS
BEGIN
  SAVEPOINT sp_log_complaint;

  INSERT INTO complaints (
    user_id,
    route_id,
    vehicle_id,
    complaint_category,
    complaint_text
  ) VALUES (
    p_user_id,
    p_route_id,
    p_vehicle_id,
    p_complaint_category,
    p_complaint_text
  )
  RETURNING complaint_id INTO p_complaint_id;

  INSERT INTO complaint_audit_log (
    complaint_id,
    old_status,
    new_status,
    remarks
  ) VALUES (
    p_complaint_id,
    NULL,
    'PENDING',
    'Complaint logged via stored procedure'
  );

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK TO sp_log_complaint;
    RAISE;
END;
/

CREATE OR REPLACE PROCEDURE pr_find_route_interchanges (
  p_route_code_a IN VARCHAR2,
  p_route_code_b IN VARCHAR2,
  p_interchanges OUT SYS_REFCURSOR
)
IS
BEGIN
  OPEN p_interchanges FOR
    SELECT DISTINCT
           a.route_code AS route_code_a,
           b.route_code AS route_code_b,
           sa.stop_name AS interchange_stop,
           ROUND(
             SQRT(
               POWER(sa.latitude - sb.latitude, 2) +
               POWER(sa.longitude - sb.longitude, 2)
             ),
             6
           ) AS approx_geo_gap
    FROM routes a
    JOIN route_stops rsa ON rsa.route_id = a.route_id
    JOIN stops sa ON sa.stop_id = rsa.stop_id
    JOIN routes b ON b.route_code = p_route_code_b
    JOIN route_stops rsb ON rsb.route_id = b.route_id
    JOIN stops sb ON sb.stop_id = rsb.stop_id
    WHERE a.route_code = p_route_code_a
      AND (
        UPPER(sa.stop_name) = UPPER(sb.stop_name)
        OR SQRT(
             POWER(sa.latitude - sb.latitude, 2) +
             POWER(sa.longitude - sb.longitude, 2)
           ) <= 0.02
      )
    ORDER BY interchange_stop;
END;
/

BEGIN
  UPDATE passes
  SET pass_status = 'EXPIRED'
  WHERE valid_to < TRUNC(SYSDATE)
    AND pass_status <> 'EXPIRED';

  MERGE INTO route_runtime_status target
  USING (
    SELECT r.route_id,
           r.route_code,
           CASE
             WHEN MAX(lt.delay_minutes) >= 10 THEN 'DELAYED'
             WHEN MAX(lt.delay_minutes) > 0 THEN 'SLOW'
             ELSE 'ON_TIME'
           END AS current_delay_status,
           NVL(MAX(lt.delay_minutes), 0) AS max_delay_minutes,
           COUNT(lt.tracking_id) AS active_vehicle_count
    FROM routes r
    LEFT JOIN live_tracking lt ON lt.route_id = r.route_id
    GROUP BY r.route_id, r.route_code
  ) source
  ON (target.route_id = source.route_id)
  WHEN MATCHED THEN
    UPDATE SET
      target.route_code = source.route_code,
      target.current_delay_status = source.current_delay_status,
      target.max_delay_minutes = source.max_delay_minutes,
      target.active_vehicle_count = source.active_vehicle_count,
      target.last_updated_at = CURRENT_TIMESTAMP
  WHEN NOT MATCHED THEN
    INSERT (
      route_id,
      route_code,
      current_delay_status,
      max_delay_minutes,
      active_vehicle_count,
      last_updated_at
    )
    VALUES (
      source.route_id,
      source.route_code,
      source.current_delay_status,
      source.max_delay_minutes,
      source.active_vehicle_count,
      CURRENT_TIMESTAMP
    );

  COMMIT;
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
