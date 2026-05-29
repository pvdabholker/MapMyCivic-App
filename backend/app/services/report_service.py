from sqlalchemy.orm import Session
from uuid import uuid4
import os
import traceback
import cv2

from fastapi import HTTPException, UploadFile
from app.models.report_model import Report
from app.utils.cloudinary import upload_media
from app.utils.ai_validator import (
    validate_image,
    detect_issue_and_severity,
    detect_video_issues_and_severity
)
from sqlalchemy import func

# ================= DEPARTMENT MAP =================
DEPARTMENT_MAP = {
    "potholes": "Public Works Department",
    "garbage": "Waste Management",
    "water logging": "Water Department",
    "damaged sign board": "Municipal Corporation"
}

# ================= CREATE REPORT =================

# ================= CREATE REPORT =================

async def create_report(
    db: Session,
    user,
    file: UploadFile,
    description: str,
    latitude: float,
    longitude: float,
    address: str
):

    print("📥 CREATE REPORT CALLED")

    os.makedirs("temp", exist_ok=True)

    is_video = file.content_type.startswith("video")

    ext = ".mp4" if is_video else ".jpg"

    temp_filename = f"temp_{uuid4()}{ext}"

    temp_path = os.path.join("temp", temp_filename)

    upload_path = temp_path

    best_frame_path = None

    try:

        contents = await file.read()

        if not contents:
            raise Exception("File is empty")

        with open(temp_path, "wb") as buffer:
            buffer.write(contents)

        print("📂 FILE SAVED:", temp_path)

    except Exception:

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="File processing failed"
        )

    file.file.seek(0)

    try:

        # =====================================================
        # VIDEO LENGTH CHECK
        # =====================================================

        if is_video:

            cap = cv2.VideoCapture(temp_path)

            fps = cap.get(cv2.CAP_PROP_FPS)

            if fps == 0:
                fps = 1

            frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)

            duration = frame_count / fps

            cap.release()

            print(f"⏱️ Video duration: {duration:.2f} seconds")

            if duration > 10:

                raise HTTPException(
                    status_code=400,
                    detail="Video must be <= 10 seconds"
                )

        print("🚀 Running AI validation...")

        # =====================================================
        # VIDEO
        # =====================================================

        if is_video:

            print("🎥 Processing video...")

            cap = cv2.VideoCapture(temp_path)

            fps = int(cap.get(cv2.CAP_PROP_FPS))

            if fps == 0:
                fps = 1

            frames = []

            frame_count = 0

            while True:

                ret, frame = cap.read()

                if not ret:
                    break

                # =============================================
                # TAKE 1 FRAME PER SECOND
                # =============================================

                if frame_count % fps == 0:

                    frame = cv2.resize(
                        frame,
                        (640, 640)
                    )

                    frames.append(frame)

                frame_count += 1

            cap.release()

            if len(frames) == 0:

                raise Exception("No frames extracted")

            frames = frames[:10]

            print(f"🎯 Frames extracted: {len(frames)}")

            # =============================================
            # VALIDATE VIDEO
            # =============================================

            is_valid = validate_image(frames)

            if not is_valid:

                raise HTTPException(
                    status_code=400,
                    detail="Invalid report (no civic issue detected)"
                )

            # =============================================
            # DETECT VIDEO ISSUES
            # =============================================

            video_results = (
                detect_video_issues_and_severity(frames)
            )

            predictions = (
                video_results["predictions"]
            )

            best_frame = (
                video_results["best_frame"]
            )

            # =============================================
            # SAVE BEST FRAME
            # =============================================

            if best_frame is not None:

                best_frame_filename = (
                    f"best_frame_{uuid4()}.jpg"
                )

                best_frame_path = os.path.join(
                    "temp",
                    best_frame_filename
                )

                cv2.imwrite(

                    best_frame_path,

                    best_frame
                )

                upload_path = best_frame_path

                print(
                    f"🖼️ BEST FRAME SAVED: "
                    f"{best_frame_path}"
                )

        # =====================================================
        # IMAGE
        # =====================================================

        else:

            print("🖼️ Processing image...")

            is_valid = validate_image(temp_path)

            if not is_valid:

                raise HTTPException(
                    status_code=400,
                    detail="Invalid report (no civic issue detected)"
                )

            prediction = detect_issue_and_severity(
                temp_path
            )

            predictions = [prediction]

        print("✅ AI VALIDATION PASSED")

        # =====================================================
        # UPLOAD IMAGE / BEST FRAME
        # =====================================================

        image_url = upload_media(upload_path)

        created_reports = []

        processed_issues = set()

        # =====================================================
        # CREATE REPORTS
        # =====================================================

        for item in predictions:

            issue_type = item["issue_type"]

            severity = item["severity"]

            # =============================================
            # PREVENT DUPLICATE ISSUE INSIDE SAME VIDEO
            # =============================================

            if issue_type in processed_issues:

                continue

            processed_issues.add(issue_type)

            duplicate = db.query(Report).filter(

                func.lower(
                    Report.issue_type
                ) == issue_type.lower(),

                Report.latitude.between(
                    latitude - 0.001,
                    latitude + 0.001
                ),

                Report.longitude.between(
                    longitude - 0.001,
                    longitude + 0.001
                )

            ).first()

            # =============================================
            # SKIP ALREADY REPORTED NEARBY
            # =============================================

            if duplicate:

                print(
                    f"⚠️ Duplicate skipped: "
                    f"{issue_type}"
                )

                continue

            normalized_issue = (
                issue_type.lower().strip()
            )

            department = DEPARTMENT_MAP.get(

                normalized_issue,

                "Unknown Department"
            )

            report = Report(

                user_id=user.id,

                image_url=image_url,

                issue_type=issue_type,

                department=department,

                severity=severity,

                description=description,

                latitude=latitude,

                longitude=longitude,

                address=address,

                status="pending",

                is_valid_issue="valid"
            )

            db.add(report)

            created_reports.append(report)

        db.commit()

        for report in created_reports:

            db.refresh(report)

        if len(created_reports) == 0:

            raise HTTPException(
                status_code=400,
                detail=(
                    "All detected issues "
                    "already reported nearby"
                )
            )

        print("✅ REPORTS CREATED SUCCESSFULLY")

        return {

            "message": (
                "Reports created successfully"
            ),

            "total_reports": len(created_reports),

            "reports": created_reports
        }

    except HTTPException as e:

        raise e

    except Exception as e:

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {str(e)}"
        )

    finally:

        # =============================================
        # DELETE TEMP VIDEO
        # =============================================

        if os.path.exists(temp_path):

            os.remove(temp_path)

        # =============================================
        # DELETE TEMP BEST FRAME
        # =============================================

        if (

            best_frame_path is not None

            and

            os.path.exists(best_frame_path)

        ):

            os.remove(best_frame_path)

            
# ================= GET ALL REPORTS =================

def get_all_reports(db: Session, severity=None, issue_type=None, skip=0, limit=10):

    query = db.query(Report)

    if severity:
        query = query.filter(Report.severity == severity)

    if issue_type:
        query = query.filter(Report.issue_type == issue_type)

    return query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()


# ================= GET USER REPORTS =================

def get_user_reports(db: Session, user):

    return (
        db.query(Report)
        .filter(Report.user_id == user.id)
        .order_by(Report.created_at.desc())
        .all()
    )


# ================= DELETE REPORT =================

def delete_report(db: Session, report_id, user):

    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.user_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db.delete(report)
    db.commit()

    return {"message": "Report deleted successfully"}


# ================= UPDATE STATUS =================

def update_report_status(db: Session, report_id, user, status):

    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.user_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    report.status = status
    db.commit()
    db.refresh(report)

    return report