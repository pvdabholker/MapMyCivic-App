from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
from app.db.database import SessionLocal
from app.models.user_model import User

load_dotenv()

# 🔐 Load from .env
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
print("VERIFY SECRET:", SECRET_KEY)
print("VERIFY ALGORITHM:", ALGORITHM)

# 🔑 This extracts token from header
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(payload)
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # 🔥 Get full user from DB
        db = SessionLocal()
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user  # return full user object

    except JWTError as e:
        print("JWT ERROR:", e)
    raise HTTPException(status_code=401, detail="Invalid or expired token")