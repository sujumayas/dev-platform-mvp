from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.config import settings
from app.core.security import ALGORITHM
from app.db.session import get_db
# Will be implemented later
# from app.models.user import User
# from app.schemas.token import TokenPayload
# from app.crud.user import get_user_by_id

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
    
    # Placeholder:
    class User:
        id = UUID("a3e4d4a0-eb8d-4182-88d9-b716771b8159")
        email = "test@example.com"
        name = "Test User"
    
    return User()
