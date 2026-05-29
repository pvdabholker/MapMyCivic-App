from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.db.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 🔗 Link to user
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    # 📸 Image
    image_url = Column(String, nullable=False)

    # 📍 Location
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(String)

    # 🏷 Issue info
    issue_type = Column(String)       # pothole, drainage etc
    department = Column(String)   # ✅ ADD THIS
    severity = Column(String)         # mild, medium, critical
    description = Column(String)

    # 🔄 Status
    status = Column(String, default="pending")

    # 🧠 ML result (placeholder)
    is_valid_issue = Column(String, default="unknown")

    created_at = Column(DateTime, default=datetime.utcnow)