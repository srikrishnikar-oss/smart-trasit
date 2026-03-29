from fastapi import APIRouter

from db import get_connection
from schemas import PassSummary

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
