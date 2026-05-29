from pydantic import BaseModel, EmailStr
from uuid import UUID

class UserCreate(BaseModel):
    # Input data from frontend (signup form)
    first_name: str
    last_name: str
    username: str
    email_or_phone: str
    city: str
    area: str
    pincode: str
    password: str


class UserResponse(BaseModel):
    # Data we send back (never send password)
    id: UUID
    username: str
    email_or_phone: str

    class Config:
        from_attributes = True  # Needed for SQLAlchemy compatibility