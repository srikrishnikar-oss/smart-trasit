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


class RouteStopPoint(BaseModel):
    stop_id: int
    stop_code: str
    stop_name: str
    stop_sequence: int
    latitude: float
    longitude: float


class RouteVehicleSnapshot(BaseModel):
    vehicle_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    seats_available: Optional[int] = None
    delay_minutes: Optional[int] = None
    delay_status: Optional[str] = None


class RouteNetworkItem(BaseModel):
    route_id: int
    route_code: str
    route_name: str
    mode_type: str
    total_distance_km: Optional[float] = None
    stops: list[RouteStopPoint]
    vehicle: Optional[RouteVehicleSnapshot] = None


class JourneyStep(BaseModel):
    kind: str
    route_code: Optional[str] = None
    route_name: Optional[str] = None
    mode_type: Optional[str] = None
    from_stop: str
    to_stop: str
    stop_count: Optional[int] = None


class JourneyPlanResponse(BaseModel):
    from_stop: str
    to_stop: str
    route_codes: list[str]
    steps: list[JourneyStep]


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
