from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
)

from app.db.transaction import transactional

from app.models.user import User

from app.services.otp_service import (
    OTPService,
)


class AuthService:

    # ==================================================
    # USER LOOKUPS
    # ==================================================

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
    def get_user_by_google_id(
        db: Session,
        google_id: str,
    ) -> User | None:

        return (
            db.query(User)
            .filter(
                User.google_id == google_id
            )
            .first()
        )

    # ==================================================
    # REGISTRATION
    # ==================================================

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
            google_id=None,
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

    # ==================================================
    # AUTHENTICATION
    # ==================================================

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

        # Google-only accounts do not have
        # a local password.
        if user.hashed_password is None:
            return None

        if not verify_password(
            password,
            user.hashed_password,
        ):
            return None

        return user

    # ==================================================
    # GOOGLE AUTHENTICATION
    # ==================================================

    @staticmethod
    @transactional
    def authenticate_google_user(
        db: Session,
        google_id: str,
        email: str,
        name: str | None = None,
    ) -> User:

        normalized_email = email.lower().strip()

        # ----------------------------------------------
        # 1. Existing Google-linked account
        # ----------------------------------------------

        user = (
            AuthService.get_user_by_google_id(
                db,
                google_id,
            )
        )

        if user is not None:

            if not user.is_active:
                raise ValueError(
                    "This account is inactive."
                )

            return user

        # ----------------------------------------------
        # 2. Existing Dasaiko account with same email
        # ----------------------------------------------

        user = (
            AuthService.get_user_by_email(
                db,
                normalized_email,
            )
        )

        if user is not None:

            if not user.is_active:
                raise ValueError(
                    "This account is inactive."
                )

            # If the account is already linked to
            # another Google account, don't overwrite it.
            if (
                user.google_id is not None
                and user.google_id != google_id
            ):
                raise ValueError(
                    "This email is already linked "
                    "to another Google account."
                )

            # Link the existing Dasaiko account
            # to this Google identity.
            user.google_id = google_id

            # Google has already verified the email.
            user.email_verified = True

            db.flush()
            db.refresh(user)

            return user

        # ----------------------------------------------
        # 3. Brand-new Google account
        # ----------------------------------------------

        username = (
            AuthService.generate_unique_username(
                db=db,
                email=normalized_email,
                name=name,
            )
        )

        user = User(
            username=username,
            email=normalized_email,
            hashed_password=None,
            google_id=google_id,
            is_active=True,
            email_verified=True,
        )

        db.add(user)
        db.flush()
        db.refresh(user)

        return user

    @staticmethod
    def generate_unique_username(
        db: Session,
        email: str,
        name: str | None = None,
    ) -> str:

        # Prefer Google's display name when available.
        # Otherwise use the email prefix.
        base = (
            name.strip()
            if name and name.strip()
            else email.split("@")[0]
        )

        username = "".join(
            character
            for character in base.lower()
            if character.isalnum()
        )

        if not username:
            username = "user"

        username = username[:40]

        candidate = username
        counter = 1

        while (
            AuthService.get_user_by_username(
                db,
                candidate,
            )
            is not None
        ):

            suffix = str(counter)

            candidate = (
                f"{username[:40 - len(suffix)]}"
                f"{suffix}"
            )

            counter += 1

        return candidate

    # ==================================================
    # EMAIL VERIFICATION
    # ==================================================

    @staticmethod
    @transactional
    def verify_email(
        db: Session,
        user_id: int,
        code: str,
    ) -> User:

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
        db.refresh(user)

        return user

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

    # ==================================================
    # PASSWORD RESET
    # ==================================================

    @staticmethod
    @transactional
    def create_password_reset_otp(
        db: Session,
        email: str,
    ) -> str | None:

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

        _, otp_code = (
            OTPService.create_otp(
                db=db,
                user_id=user.id,
                purpose=(
                    OTPService.PASSWORD_RESET
                ),
            )
        )

        return otp_code

    @staticmethod
    @transactional
    def reset_password(
        db: Session,
        email: str,
        code: str,
        new_password: str,
    ) -> User:

        user = (
            AuthService.get_user_by_email(
                db,
                email,
            )
        )

        if user is None:
            raise ValueError(
                "Invalid password reset request."
            )

        if not user.is_active:
            raise ValueError(
                "Invalid password reset request."
            )

        OTPService.verify_otp(
            db=db,
            user_id=user.id,
            purpose=(
                OTPService.PASSWORD_RESET
            ),
            code=code,
        )

        user.hashed_password = (
            hash_password(new_password)
        )

        db.flush()
        db.refresh(user)

        return user