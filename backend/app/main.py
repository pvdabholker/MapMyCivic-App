from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 🔌 DB
from app.db.database import engine, Base

# 🔥 IMPORTANT: load models
from app.db import base  

# 📦 Routes
from app.routes.auth_routes import router as auth_router
from app.routes.user_routes import router as user_router
from app.routes.report_routes import router as report_router
from app.routes.notice_routes import router as notice_router

# 🚀 APP INIT
app = FastAPI()


# ✅ CORS (CRITICAL FIX)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ FIX
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 🔧 Create tables on startup
@app.on_event("startup")
def startup():
    print(Base.metadata.tables.keys())
    Base.metadata.create_all(bind=engine)
    print("✅ Database connected successfully")


# 🔗 Routes
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(report_router, prefix="/report", tags=["Report"])
app.include_router(notice_router, tags=["Notice"])

# 🏠 Test route
@app.get("/")
def home():
    return {"message": "MapMyCivic Backend Running 🚀"}