from fastapi import APIRouter

from db import get_connection
from schemas import LiveTrackingResponse

router = APIRouter()


@router.get("/live", response_model=list[LiveTrackingResponse])
def live_tracking():
    query = """
        SELECT r.route_code,
               v.vehicle_code,
               lt.latitude,
               lt.longitude,
               lt.speed_kmph,
               lt.delay_minutes,
               lt.seats_available,
               lt.delay_status,
               lt.last_reported_at
        FROM live_tracking lt
        JOIN routes r ON r.route_id = lt.route_id
        JOIN vehicles v ON v.vehicle_id = lt.vehicle_id
        ORDER BY lt.last_reported_at DESC
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()

    return [
        LiveTrackingResponse(
            route_code=row[0],
            vehicle_code=row[1],
            latitude=float(row[2]),
            longitude=float(row[3]),
            speed_kmph=float(row[4]),
            delay_minutes=int(row[5]),
            seats_available=int(row[6]),
            delay_status=row[7],
            last_reported_at=row[8],
        )
        for row in rows
    ]
