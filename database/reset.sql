BEGIN
  DBMS_SCHEDULER.DROP_JOB('JOB_MARK_EXPIRED_PASSES', TRUE);
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -27475 THEN
      RAISE;
    END IF;
END;
/

BEGIN
  FOR trigger_name IN (
    SELECT trigger_name
    FROM user_triggers
    WHERE trigger_name IN (
      'TRG_SET_UPDATED_AT_USERS',
      'TRG_SET_UPDATED_AT_ROUTES',
      'TRG_SET_UPDATED_AT_VEHICLES',
      'TRG_SET_UPDATED_AT_COMPLAINTS',
      'TRG_LIVE_TRACKING_DELAY_STATUS',
      'TRG_PASS_EXPIRY_STATUS'
    )
  ) LOOP
    EXECUTE IMMEDIATE 'DROP TRIGGER ' || trigger_name.trigger_name;
  END LOOP;
END;
/

BEGIN
  FOR object_name IN (
    SELECT object_name, object_type
    FROM user_objects
    WHERE (object_type = 'FUNCTION' AND object_name IN ('FN_CALCULATE_FARE', 'FN_ESTIMATE_ETA'))
       OR (object_type = 'PROCEDURE' AND object_name IN ('PR_ASSIGN_DRIVER'))
  ) LOOP
    EXECUTE IMMEDIATE 'DROP ' || object_name.object_type || ' ' || object_name.object_name;
  END LOOP;
END;
/

BEGIN
  FOR table_name IN (
    SELECT table_name
    FROM user_tables
    WHERE table_name IN (
      'TRIP_HISTORY',
      'FAVORITES',
      'ALERTS',
      'COMPLAINTS',
      'PASSES',
      'PASS_TYPES',
      'FARES',
      'LIVE_TRACKING',
      'DRIVER_ASSIGNMENTS',
      'SCHEDULES',
      'DRIVERS',
      'VEHICLES',
      'ROUTE_STOPS',
      'ROUTES',
      'STOPS',
      'CITIES',
      'APP_USERS'
    )
  ) LOOP
    EXECUTE IMMEDIATE 'DROP TABLE ' || table_name.table_name || ' CASCADE CONSTRAINTS PURGE';
  END LOOP;
END;
/
