from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
)
from app.models.user import User


class AuthService:

    @staticmethod
    def get_user_by_email(
        db: Session,
        email: str,
    ) -> User | None:
        return (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

    @staticmethod
    def get_user_by_username(
        db: Session,
        username: str,
    ) -> User | None:
        return (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

    @staticmethod
    def register_user(
        db: Session,
        username: str,
        email: str,
        password: str,
    ) -> User:

        if (
            AuthService.get_user_by_username(
                db,
                username,
            )
            is not None
        ):
            raise ValueError(
                "Username already exists."
            )

        if (
            AuthService.get_user_by_email(
                db,
                email,
            )
            is not None
        ):
            raise ValueError(
                "Email already exists."
            )

        user = User(
            username=username,
            email=email,
            hashed_password=hash_password(
                password
            ),
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def authenticate_user(
        db: Session,
        email: str,
        password: str,
    ) -> User | None:

        user = (
            AuthService.get_user_by_email(
                db,
                email,
            )
        )

        if user is None:
            return None

        if not user.is_active:
            return None

        if not verify_password(
            password,
            user.hashed_password,
        ):
            return None

        return user