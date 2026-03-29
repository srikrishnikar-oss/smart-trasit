from fastapi import APIRouter

from db import get_connection
from schemas import RouteSummary

router = APIRouter()


@router.get("", response_model=list[RouteSummary])
def list_routes():
    query = """
        SELECT route_id, route_code, route_name, mode_type, total_distance_km
        FROM routes
        WHERE route_status = 'ACTIVE'
        ORDER BY route_code
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()

    return [
        RouteSummary(
            route_id=row[0],
            route_code=row[1],
            route_name=row[2],
            mode_type=row[3],
            total_distance_km=float(row[4]) if row[4] is not None else None,
        )
        for row in rows
    ]
