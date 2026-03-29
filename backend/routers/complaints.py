from fastapi import APIRouter, HTTPException

from db import get_connection
from schemas import ComplaintCreate, ComplaintResponse, ComplaintSummary

router = APIRouter()


@router.get("/user/{user_id}", response_model=list[ComplaintSummary])
def list_complaints(user_id: int):
    query = """
        SELECT c.complaint_id,
               r.route_code,
               c.complaint_category,
               c.complaint_text,
               c.complaint_status,
               c.created_at
        FROM complaints c
        LEFT JOIN routes r ON r.route_id = c.route_id
        WHERE c.user_id = :user_id
        ORDER BY c.created_at DESC
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, {"user_id": user_id})
            rows = cursor.fetchall()

    return [
        ComplaintSummary(
            complaint_id=row[0],
            route_code=row[1],
            complaint_category=row[2],
            complaint_text=row[3],
            complaint_status=row[4],
            created_at=row[5],
        )
        for row in rows
    ]


@router.post("", response_model=ComplaintResponse)
def create_complaint(payload: ComplaintCreate):
    query = """
        INSERT INTO complaints (
            user_id,
            route_id,
            vehicle_id,
            complaint_category,
            complaint_text
        )
        VALUES (
            :user_id,
            :route_id,
            :vehicle_id,
            :complaint_category,
            :complaint_text
        )
        RETURNING complaint_id, complaint_status, created_at
        INTO :complaint_id, :complaint_status, :created_at
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            complaint_id = cursor.var(int)
            complaint_status = cursor.var(str)
            created_at = cursor.var(object)

            try:
                cursor.execute(
                    query,
                    {
                        "user_id": payload.user_id,
                        "route_id": payload.route_id,
                        "vehicle_id": payload.vehicle_id,
                        "complaint_category": payload.complaint_category,
                        "complaint_text": payload.complaint_text,
                        "complaint_id": complaint_id,
                        "complaint_status": complaint_status,
                        "created_at": created_at,
                    },
                )
                connection.commit()
            except Exception as exc:
                connection.rollback()
                raise HTTPException(status_code=400, detail=f"Complaint creation failed: {exc}") from exc

    return ComplaintResponse(
        complaint_id=complaint_id.getvalue()[0],
        complaint_status=complaint_status.getvalue()[0],
        created_at=created_at.getvalue()[0],
    )
