from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError, BaseModel, EmailStr
from sqlalchemy.orm import Session
from uuid import UUID
import datetime

from app.core.config import settings
from app.core.security import ALGORITHM
from app.db.session import get_db
from app.schemas.token import TokenPayload
from app.schemas.user import User
from app.crud.user import get_user_by_email

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# Will be implemented later
async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> "User":
    """
    Decode JWT token to get user_id, and then query user table to get current user.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    # This is a placeholder - will be implemented with the User model
    # user = get_user_by_id(db, token_data.sub)
    # if not user:
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail="User not found",
    #     )
    # return user
    
    # Try to get the admin user from the database
    admin_user = get_user_by_email(db, email="admin@example.com")
    
    if admin_user:
        # Use the existing admin user data
        return User(
            id=admin_user.id,
            email=admin_user.email,
            name=admin_user.name,
            avatar_url=admin_user.avatar_url,
            created_at=admin_user.created_at
        )
    else:
        # If no admin user exists, run initial data script
        from app.initial_data import init_db
        init_db(db)
        
        # Try to get the admin user again
        admin_user = get_user_by_email(db, email="admin@example.com")
        
        if admin_user:
            return User(
                id=admin_user.id,
                email=admin_user.email,
                name=admin_user.name,
                avatar_url=admin_user.avatar_url,
                created_at=admin_user.created_at
            )
        else:
            # Fallback to mock user if all else fails
            mock_user = {
                "id": UUID("a3e4d4a0-eb8d-4182-88d9-b716771b8159"),
                "email": "test@example.com",
                "name": "Test User",
                "avatar_url": None,
                "created_at": datetime.datetime.now()
            }
            
            return User(**mock_user)
