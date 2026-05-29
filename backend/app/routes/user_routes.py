from fastapi import APIRouter, Depends
from app.dependencies.auth_dependency import get_current_user


router = APIRouter()


@router.get("/me")
def get_profile(current_user = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email_or_phone
    }

from fastapi import UploadFile, File
from app.utils.cloudinary import upload_media

@router.post("/test-upload")
def test_upload(file: UploadFile = File(...)):
    url = upload_media(file.file)
    return {"image_url": url}