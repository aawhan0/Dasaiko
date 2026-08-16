from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
)
from app.db.transaction import transactional
from app.models.user import User
from app.services.otp_service import OTPService


class AuthService:

    @staticmethod
    def get_user_by_email(
        db: Session,
        email: str,
    ) -> User | None:

        return (
            db.query(User)
            .filter(
                User.email == email
            )
            .first()
        )

    @staticmethod
    def get_user_by_username(
        db: Session,
        username: str,
    ) -> User | None:

        return (
            db.query(User)
            .filter(
                User.username == username
            )
            .first()
        )

    @staticmethod
    @transactional
    def register_user(
        db: Session,
        username: str,
        email: str,
        password: str,
    ) -> tuple[User, str]:

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
            hashed_password=(
                hash_password(password)
            ),
            is_active=True,
            email_verified=False,
        )

        db.add(user)
        db.flush()
        db.refresh(user)

        _, otp_code = (
            OTPService.create_otp(
                db=db,
                user_id=user.id,
                purpose=(
                    OTPService.EMAIL_VERIFICATION
                ),
            )
        )

        return user, otp_code

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

        if not user.email_verified:
            raise ValueError(
                "Please verify your email "
                "address before signing in."
            )

        if not verify_password(
            password,
            user.hashed_password,
        ):
            return None

        return user

    @staticmethod
    def verify_email(
        db: Session,
        user_id: int,
        code: str,
    ) -> User:

        try:

            user = (
                db.query(User)
                .filter(
                    User.id == user_id
                )
                .first()
            )

            if user is None:
                raise ValueError(
                    "User not found."
                )

            if user.email_verified:
                raise ValueError(
                    "Email is already verified."
                )

            OTPService.verify_otp(
                db=db,
                user_id=user.id,
                purpose=(
                    OTPService.EMAIL_VERIFICATION
                ),
                code=code,
            )

            user.email_verified = True

            db.flush()

            db.commit()

            db.refresh(user)

            return user

        except ValueError:

            # Important:
            # Persist OTP attempt/expiration
            # changes before returning the error.
            db.commit()

            raise

        except Exception:

            db.rollback()

            raise

    @staticmethod
    @transactional
    def create_verification_otp(
        db: Session,
        user_id: int,
    ) -> str:

        _, otp_code = (
            OTPService.create_otp(
                db=db,
                user_id=user_id,
                purpose=(
                    OTPService.EMAIL_VERIFICATION
                ),
            )
        )

        return otp_code

    @staticmethod
    def get_user_for_verification(
        db: Session,
        email: str,
    ) -> User | None:

        return (
            AuthService.get_user_by_email(
                db,
                email,
            )
        )