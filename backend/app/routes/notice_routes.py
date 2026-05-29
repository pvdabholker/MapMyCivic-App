from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.notice_model import Notice   # ✅ FIX (IMPORT ADDED)

router = APIRouter()


# ✅ ONLY ONE GET ROUTE (DISPLAY ONLY)
@router.get("/notices")
def get_notices(db: Session = Depends(get_db)):
    return db.query(Notice).order_by(Notice.created_at.desc()).all()