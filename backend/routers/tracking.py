from fastapi import APIRouter

from db import get_connection
from schemas import DelayedVehicleSummary, LiveRouteStatusSummary, LiveTrackingResponse

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


@router.get("/active-routes", response_model=list[LiveRouteStatusSummary])
def active_live_routes():
    query = """
        SELECT route_id,
               route_code,
               route_name,
               mode_type,
               active_vehicle_count,
               last_live_report_at,
               current_delay_status,
               max_delay_minutes
        FROM vw_active_live_routes
        ORDER BY route_code
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()

    return [
        LiveRouteStatusSummary(
            route_id=int(row[0]),
            route_code=row[1],
            route_name=row[2],
            mode_type=row[3],
            active_vehicle_count=int(row[4]),
            last_live_report_at=row[5],
            current_delay_status=row[6],
            max_delay_minutes=int(row[7]),
        )
        for row in rows
    ]


@router.get("/delayed", response_model=list[DelayedVehicleSummary])
def delayed_vehicles():
    query = """
        SELECT route_code,
               route_name,
               vehicle_code,
               delay_minutes,
               delay_status,
               seats_available,
               last_reported_at
        FROM vw_delayed_vehicles
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()

    return [
        DelayedVehicleSummary(
            route_code=row[0],
            route_name=row[1],
            vehicle_code=row[2],
            delay_minutes=int(row[3]),
            delay_status=row[4],
            seats_available=int(row[5]),
            last_reported_at=row[6],
        )
        for row in rows
    ]
