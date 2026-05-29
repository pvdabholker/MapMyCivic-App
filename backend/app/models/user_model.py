from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    # Unique ID for each user (UUID is better than int for scalability)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Basic user details
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    email_or_phone = Column(String, unique=True, nullable=False)

    # Location info
    city = Column(String, nullable=False)
    area = Column(String, nullable=False)
    pincode = Column(String, nullable=False)

    # Password (hashed, never store plain password)
    password_hash = Column(String, nullable=False)

    # Timestamp
    created_at = Column(TIMESTAMP, default=datetime.utcnow)