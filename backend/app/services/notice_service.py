from sqlalchemy.orm import Session
from app.models.notice_model import Notice
from datetime import datetime



# GET ALL NOTICES
def get_all_notices(db: Session):
    return db.query(Notice).order_by(Notice.created_at.desc()).all()

