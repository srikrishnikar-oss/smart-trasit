from fastapi import APIRouter, HTTPException

from db import get_connection
from schemas import (
    ExpiringPassSummary,
    PassBookingRequest,
    PassBookingResponse,
    PassRenewRequest,
    PassSummary,
)

router = APIRouter()


@router.get("/user/{user_id}", response_model=list[PassSummary])
def list_user_passes(user_id: int):
    query = """
        SELECT p.pass_number,
               pt.pass_name,
               p.valid_from,
               p.valid_to,
               p.pass_status,
               pt.price_amount,
               pt.applicable_mode
        FROM passes p
        JOIN pass_types pt ON pt.pass_type_id = p.pass_type_id
        WHERE p.user_id = :user_id
        ORDER BY p.valid_to DESC
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, {"user_id": user_id})
            rows = cursor.fetchall()

    return [
        PassSummary(
            pass_number=row[0],
            pass_name=row[1],
            valid_from=row[2],
            valid_to=row[3],
            pass_status=row[4],
            price_amount=float(row[5]),
            applicable_mode=row[6],
        )
        for row in rows
    ]


@router.get("/expiring", response_model=list[ExpiringPassSummary])
def list_expiring_passes():
    query = """
        SELECT pass_id,
               pass_number,
               full_name,
               pass_name,
               valid_from,
               valid_to,
               days_left,
               pass_status
        FROM vw_expiring_passes
        ORDER BY valid_to
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()

    return [
        ExpiringPassSummary(
            pass_id=int(row[0]),
            pass_number=row[1],
            full_name=row[2],
            pass_name=row[3],
            valid_from=row[4],
            valid_to=row[5],
            days_left=int(row[6]),
            pass_status=row[7],
        )
        for row in rows
    ]


@router.post("/book", response_model=PassBookingResponse)
def book_pass(payload: PassBookingRequest):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            pass_number = cursor.var(str)
            payment_reference = cursor.var(str)

            try:
                cursor.callproc(
                    "pr_book_pass",
                    [
                        payload.user_id,
                        payload.pass_type_id,
                        payload.payment_method,
                        payload.auto_renew,
                        pass_number,
                        payment_reference,
                    ],
                )
            except Exception as exc:
                raise HTTPException(status_code=400, detail=f"Pass booking failed: {exc}") from exc

    return PassBookingResponse(
        pass_number=pass_number.getvalue(),
        payment_reference=payment_reference.getvalue(),
    )


@router.post("/renew/{pass_number}", response_model=PassBookingResponse)
def renew_pass(pass_number: str, payload: PassRenewRequest):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            payment_reference = cursor.var(str)

            try:
                cursor.callproc(
                    "pr_renew_pass",
                    [
                        pass_number,
                        payload.payment_method,
                        payment_reference,
                    ],
                )
            except Exception as exc:
                raise HTTPException(status_code=400, detail=f"Pass renewal failed: {exc}") from exc

    return PassBookingResponse(
        pass_number=pass_number,
        payment_reference=payment_reference.getvalue(),
    )
