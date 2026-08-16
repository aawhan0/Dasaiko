from datetime import datetime, timedelta
import hashlib
import hmac
import secrets

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.email_verification_otp import (
    EmailVerificationOTP,
)


class OTPService:

    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"

    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 5
    RESEND_COOLDOWN_SECONDS = 60

    @staticmethod
    def generate_code() -> str:
        return str(
            secrets.randbelow(1_000_000)
        ).zfill(
            OTPService.OTP_LENGTH
        )

    @staticmethod
    def hash_code(
        code: str,
    ) -> str:

        key = settings.jwt_secret_key.encode(
            "utf-8"
        )

        message = (
            f"dasaiko-otp:{code}"
        ).encode("utf-8")

        return hmac.new(
            key,
            message,
            hashlib.sha256,
        ).hexdigest()

    @staticmethod
    def verify_code(
        code: str,
        code_hash: str,
    ) -> bool:

        expected_hash = (
            OTPService.hash_code(code)
        )

        return hmac.compare_digest(
            expected_hash,
            code_hash,
        )

    @staticmethod
    def get_latest_otp(
        db: Session,
        user_id: int,
        purpose: str,
    ) -> EmailVerificationOTP | None:

        return (
            db.query(
                EmailVerificationOTP
            )
            .filter(
                EmailVerificationOTP.user_id
                == user_id,
                EmailVerificationOTP.purpose
                == purpose,
            )
            .order_by(
                EmailVerificationOTP.created_at.desc()
            )
            .first()
        )

    @staticmethod
    def create_otp(
        db: Session,
        user_id: int,
        purpose: str,
    ) -> tuple[
        EmailVerificationOTP,
        str,
    ]:

        now = datetime.utcnow()

        latest_otp = (
            OTPService.get_latest_otp(
                db=db,
                user_id=user_id,
                purpose=purpose,
            )
        )

        if latest_otp is not None:

            cooldown_until = (
                latest_otp.created_at
                + timedelta(
                    seconds=(
                        OTPService
                        .RESEND_COOLDOWN_SECONDS
                    )
                )
            )

            if now < cooldown_until:

                remaining_seconds = int(
                    (
                        cooldown_until - now
                    ).total_seconds()
                )

                raise ValueError(
                    "Please wait "
                    f"{remaining_seconds} seconds "
                    "before requesting another OTP."
                )

        # Invalidate previous unused OTPs.

        (
            db.query(
                EmailVerificationOTP
            )
            .filter(
                EmailVerificationOTP.user_id
                == user_id,
                EmailVerificationOTP.purpose
                == purpose,
                EmailVerificationOTP.used_at
                .is_(None),
            )
            .update(
                {
                    EmailVerificationOTP.used_at: now,
                },
                synchronize_session=False,
            )
        )

        code = (
            OTPService.generate_code()
        )

        otp = EmailVerificationOTP(
            user_id=user_id,
            code_hash=(
                OTPService.hash_code(code)
            ),
            purpose=purpose,
            expires_at=(
                now
                + timedelta(
                    minutes=(
                        OTPService
                        .OTP_EXPIRY_MINUTES
                    )
                )
            ),
            attempts=0,
            used_at=None,
            created_at=now,
        )

        db.add(otp)
        db.flush()
        db.refresh(otp)

        return otp, code

    @staticmethod
    def verify_otp(
        db: Session,
        user_id: int,
        purpose: str,
        code: str,
    ) -> EmailVerificationOTP:

        otp = (
            db.query(
                EmailVerificationOTP
            )
            .filter(
                EmailVerificationOTP.user_id
                == user_id,
                EmailVerificationOTP.purpose
                == purpose,
                EmailVerificationOTP.used_at
                .is_(None),
            )
            .order_by(
                EmailVerificationOTP.created_at.desc()
            )
            .first()
        )

        if otp is None:
            raise ValueError(
                "No active OTP found."
            )

        now = datetime.utcnow()

        if now >= otp.expires_at:

            otp.used_at = now

            raise ValueError(
                "OTP has expired. "
                "Please request a new one."
            )

        if otp.attempts >= (
            OTPService.MAX_ATTEMPTS
        ):

            otp.used_at = now

            raise ValueError(
                "Too many incorrect attempts. "
                "Please request a new OTP."
            )

        if not OTPService.verify_code(
            code,
            otp.code_hash,
        ):

            otp.attempts += 1

            if otp.attempts >= (
                OTPService.MAX_ATTEMPTS
            ):
                otp.used_at = now

            raise ValueError(
                "Invalid OTP."
            )

        otp.used_at = now

        db.flush()
        db.refresh(otp)

        return otp