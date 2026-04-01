from fastapi import APIRouter

from db import get_connection
from schemas import ComplaintRouteSummary

router = APIRouter()


@router.get("/complaints-by-route", response_model=list[ComplaintRouteSummary])
def complaints_by_route():
    query = """
        SELECT route_code,
               route_name,
               complaint_count,
               pending_count,
               resolved_count,
               latest_complaint_at
        FROM vw_complaint_summary_by_route
        ORDER BY complaint_count DESC, latest_complaint_at DESC
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()

    return [
        ComplaintRouteSummary(
            route_code=row[0],
            route_name=row[1],
            complaint_count=int(row[2]),
            pending_count=int(row[3]),
            resolved_count=int(row[4]),
            latest_complaint_at=row[5],
        )
        for row in rows
    ]
