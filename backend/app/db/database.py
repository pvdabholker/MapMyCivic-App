# app/db/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config.settings import settings  # using your .env via settings

# 🔌 DATABASE URL (comes from .env)
DATABASE_URL = settings.DATABASE_URL

# 🔧 Create engine (connects to PostgreSQL)
engine = create_engine(DATABASE_URL)

# 🧾 Session (used for DB operations)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 🧱 Base class (all models will extend this)
Base = declarative_base()


# 📦 Dependency (used in routes)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()