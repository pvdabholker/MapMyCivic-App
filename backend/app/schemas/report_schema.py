from pydantic import BaseModel
from uuid import UUID
from pydantic import BaseModel
from typing import Literal
from datetime import datetime

class ReportCreate(BaseModel):
    issue_type: str
    severity: Literal["low", "medium", "critical"]
    description: str
    latitude: float
    longitude: float
    address: str


class ReportResponse(BaseModel):
    id: UUID
    image_url: str
    issue_type: str
    department: str
    severity: Literal["low", "medium", "critical"]
    description: str
    latitude: float
    longitude: float
    address: str
    status: Literal["pending", "in_progress", "resolved"]
    is_valid_issue: str

    created_at: datetime   # ✅ ADD THIS

    class Config:
        from_attributes = True