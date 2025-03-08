import logging
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.schemas.user import UserCreate
from app.crud.user import get_user_by_email, create_user
from app.core.security import get_password_hash


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db(db: Session) -> None:
    # Create initial user if it doesn't exist
    user = get_user_by_email(db, email="admin@example.com")
    if not user:
        user_in = UserCreate(
            email="admin@example.com",
            password="admin123",  # This is just for the MVP, in production use stronger passwords
            name="Initial Admin",
        )
        user = create_user(db, user_in)
        logger.info(f"Created initial admin user: {user.email}")
    else:
        logger.info(f"Admin user already exists: {user.email}")


def main() -> None:
    logger.info("Creating initial data")
    db = SessionLocal()
    try:
        init_db(db)
        logger.info("Initial data created")
    finally:
        db.close()


if __name__ == "__main__":
    main()
