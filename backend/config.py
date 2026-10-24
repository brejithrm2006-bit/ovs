import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "votepulse-super-secret-key-development-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "votepulse-jwt-secret-key-development-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_EXPIRES_HOURS", 24)))
    
    # Database Configuration: PostgreSQL default, fallback to SQLite for local development
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        # Normalize postgres:// to postgresql:// for SQLAlchemy
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        SQLALCHEMY_DATABASE_URI = database_url
    else:
        db_path = os.path.join(BASE_DIR, "votepulse.db")
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Uploads directory
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB max upload
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

    # Initial Admin Seed Credentials
    INITIAL_ADMIN_USERNAME = os.getenv("INITIAL_ADMIN_USERNAME", "brmovs")
    INITIAL_ADMIN_PHONE = os.getenv("INITIAL_ADMIN_PHONE", "7025919468")
    INITIAL_ADMIN_PASSWORD = os.getenv("INITIAL_ADMIN_PASSWORD", "qw1988ab1988")
    INITIAL_ADMIN_NAME = os.getenv("INITIAL_ADMIN_NAME", "System Administrator")

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
