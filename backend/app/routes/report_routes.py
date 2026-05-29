from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Literal
from uuid import UUID

from app.db.database import get_db
from app.dependencies.auth_dependency import get_current_user
from app.models.report_model import Report
from app.schemas.report_schema import ReportResponse

from app.services.report_service import (
    create_report,
    get_all_reports,
    get_user_reports,
    delete_report,
    update_report_status
)

router = APIRouter()


# ================= CREATE REPORT =================
@router.post("/create")
async def create_new_report(
    file: UploadFile = File(...),

    description: str = Form(...),

    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(...),

    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        result = await create_report(   # ✅ FIXED
            db=db,
            user=current_user,
            file=file,
            description=description,
            latitude=latitude,
            longitude=longitude,
            address=address
        )
        return result

    except HTTPException as e:
        print("hello")
        raise e

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=500, detail="Internal Server Error")
    

# ================= GET ALL REPORTS =================
@router.get("/", response_model=List[ReportResponse])
def get_reports(
    severity: str = None,
    issue_type: str = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    return get_all_reports(db, severity, issue_type, skip, limit)


# ================= GET MY REPORTS =================
@router.get("/my", response_model=List[ReportResponse])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return get_user_reports(db, current_user)


# ================= GET SINGLE REPORT =================
@router.get("/{report_id}", response_model=ReportResponse)
def get_single_report(
    report_id: UUID,
    db: Session = Depends(get_db),
):
    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return report


# ================= DELETE REPORT =================
@router.delete("/{report_id}")
def delete_report_api(
    report_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return delete_report(db, report_id, current_user)


# ================= UPDATE STATUS =================
@router.patch("/{report_id}", response_model=ReportResponse)
def update_report(
    report_id: UUID,
    status: Literal["pending", "in_progress", "resolved"],
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return update_report_status(db, report_id, current_user, status)