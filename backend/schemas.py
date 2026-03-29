from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class HealthResponse(BaseModel):
    status: str
    service: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RouteSummary(BaseModel):
    route_id: int
    route_code: str
    route_name: str
    mode_type: str
    total_distance_km: Optional[float] = None


class LiveTrackingResponse(BaseModel):
    route_code: str
    vehicle_code: str
    latitude: float
    longitude: float
    speed_kmph: float
    delay_minutes: int
    seats_available: int
    delay_status: str
    last_reported_at: datetime


class AlertResponse(BaseModel):
    alert_id: int
    route_code: Optional[str] = None
    alert_type: str
    severity_level: str
    alert_message: str
    created_at: datetime


class PassSummary(BaseModel):
    pass_number: str
    pass_name: str
    valid_from: date
    valid_to: date
    pass_status: str
    price_amount: float
    applicable_mode: str


class ComplaintCreate(BaseModel):
    user_id: int
    route_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    complaint_category: str
    complaint_text: str


class ComplaintResponse(BaseModel):
    complaint_id: int
    complaint_status: str
    created_at: datetime


class ComplaintSummary(BaseModel):
    complaint_id: int
    route_code: Optional[str] = None
    complaint_category: str
    complaint_text: str
    complaint_status: str
    created_at: datetime
