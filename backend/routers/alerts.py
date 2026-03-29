from fastapi import APIRouter

from db import get_connection
from schemas import AlertResponse

router = APIRouter()


@router.get("", response_model=list[AlertResponse])
def list_alerts():
    query = """
        SELECT a.alert_id,
               r.route_code,
               a.alert_type,
               a.severity_level,
               a.alert_message,
               a.created_at
        FROM alerts a
        LEFT JOIN routes r ON r.route_id = a.route_id
        WHERE a.active_flag = 'Y'
        ORDER BY a.created_at DESC
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()

    return [
        AlertResponse(
            alert_id=row[0],
            route_code=row[1],
            alert_type=row[2],
            severity_level=row[3],
            alert_message=row[4],
            created_at=row[5],
        )
        for row in rows
    ]
