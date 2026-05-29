from sqlalchemy.orm import Session
from app.models.user_model import User
from app.schemas.user_schema import UserCreate
from app.utils.security import hash_password,verify_password, create_access_token

def login_user(db, username: str, password: str):

    # 🔍 Find user in DB
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise Exception("Invalid username or password")

    # 🔐 Verify password
    if not verify_password(password, user.password_hash):
        raise Exception("Invalid username or password")

    # 🎟️ Create JWT token (store user id inside)
    token = create_access_token(
        data={"user_id": str(user.id)}
    )

    return token

def create_user(db: Session, user_data: UserCreate):
    # 🔍 Check if user already exists
    existing_user = db.query(User).filter(
        (User.username == user_data.username) |
        (User.email_or_phone == user_data.email_or_phone)
    ).first()

    if existing_user:
        raise Exception("User already exists")

    # 🔐 Hash password before storing
    hashed_password = hash_password(user_data.password)

    # 🧱 Create new user object
    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        username=user_data.username,
        email_or_phone=user_data.email_or_phone,
        city=user_data.city,
        area=user_data.area,
        pincode=user_data.pincode,
        password_hash=hashed_password
    )

    # 💾 Save to DB
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user