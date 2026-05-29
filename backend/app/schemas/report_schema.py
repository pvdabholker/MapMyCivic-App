from pydantic import BaseModel
from uuid import UUID
from pydantic import BaseModel
from typing import Literal

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
    department: str   # ✅ ADD THIS
    severity: Literal["low", "medium", "critical"]
    description: str
    latitude: float
    longitude: float
    address: str
    status: Literal["pending", "in_progress", "resolved"]
    is_valid_issue: str

    class Config:
        from_attributes = True