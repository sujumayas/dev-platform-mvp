from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.user import User, UserCreate, UserUpdate
from app.crud.user import get_user_by_email, create_user, update_user

router = APIRouter()


@router.get("/profile", response_model=User)
async def read_user_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.post("/", response_model=User)
async def create_user_route(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    user = create_user(db, user_in)
    return user


@router.put("/", response_model=User)
async def update_user_route(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = update_user(db, current_user, user_in)
    return user
