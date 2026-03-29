from fastapi import APIRouter, HTTPException

from db import get_connection
from schemas import LoginRequest

router = APIRouter()


@router.post("/login")
def login(payload: LoginRequest):
    query = """
        SELECT user_id, full_name, role_code
        FROM app_users
        WHERE email = :email
          AND is_active = 'Y'
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, {"email": payload.email})
            row = cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "user_id": row[0],
        "full_name": row[1],
        "role": row[2],
        "message": "Password verification is still a placeholder. Add hash checking next.",
    }
