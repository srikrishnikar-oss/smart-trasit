SET SERVEROUTPUT ON

PROMPT ===== Pass Booking Transaction =====
DECLARE
  v_pass_number VARCHAR2(40);
  v_payment_reference VARCHAR2(50);
BEGIN
  pr_book_pass(
    p_user_id           => 1,
    p_pass_type_id      => 1,
    p_payment_method    => 'UPI',
    p_auto_renew        => 'N',
    p_pass_number       => v_pass_number,
    p_payment_reference => v_payment_reference
  );

  DBMS_OUTPUT.PUT_LINE('Booked pass: ' || v_pass_number || ' payment: ' || v_payment_reference);
END;
/

PROMPT ===== Complaint Logging Transaction =====
DECLARE
  v_complaint_id NUMBER;
BEGIN
  pr_log_complaint(
    p_user_id             => 1,
    p_route_id            => 2,
    p_vehicle_id          => 2,
    p_complaint_category  => 'Crowding',
    p_complaint_text      => 'Train was overcrowded during the evening commute.',
    p_complaint_id        => v_complaint_id
  );

  DBMS_OUTPUT.PUT_LINE('Logged complaint: ' || v_complaint_id);
END;
/

PROMPT ===== Pass Renewal Transaction =====
DECLARE
  v_payment_reference VARCHAR2(50);
BEGIN
  pr_renew_pass(
    p_pass_number       => 'PASS-2026-001',
    p_payment_method    => 'CARD',
    p_payment_reference => v_payment_reference
  );

  DBMS_OUTPUT.PUT_LINE('Renewal payment: ' || v_payment_reference);
END;
/
