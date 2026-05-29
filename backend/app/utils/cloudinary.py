import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# 🔧 Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET")
)


def upload_media(file):
    try:
        # ✅ Get content type safely
        if isinstance(file,str):
            ext = os.path.splitext(file)[1].lower()
            if ext in[".mp4", ".mov", ".avi"]:
                resource_type = "video"
            else:
                resource_type = "image"

        else:
            content_type = getattr(file, "content_type", " ")
            resource_type = "video" if content_type.startswith("video") else "image"
            # ⚠️ IMPORTANT: pass file.file (actual stream)
        result = cloudinary.uploader.upload(
            file,
            resource_type=resource_type
        )

        return result["secure_url"]

    except Exception as e:
        print("🔥 Cloudinary Upload Error:", str(e))
        raise Exception("Cloudinary upload failed")