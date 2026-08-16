from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from fastapi.responses import RedirectResponse

from sqlalchemy.orm import Session

from app.core.config import (
    settings,
)

from app.core.dependencies import (
    get_current_user,
)

from app.core.security import (
    create_access_token,
)

from app.db.dependencies import (
    get_db,
)

from app.schemas.auth import (
    PasswordResetConfirmRequest,
    PasswordResetConfirmResponse,
    PasswordResetRequest,
    PasswordResetResponse,
    RegistrationResponse,
    ResendVerificationRequest,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
    VerificationResponse,
    VerifyEmailRequest,
)

from app.services.auth_service import (
    AuthService,
)

from app.services.email_service import (
    EmailService,
)

from app.services.google_auth_service import (
    GoogleAuthService,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ==================================================
# REGISTER
# ==================================================


@router.post(
    "/register",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: UserRegister,
    db: Session = Depends(get_db),
):

    try:

        user, otp_code = (
            AuthService.register_user(
                db=db,
                username=request.username,
                email=request.email,
                password=request.password,
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=str(error),
        )

    try:

        EmailService.send_verification_otp(
            recipient=user.email,
            otp=otp_code,
        )

    except Exception:

        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=(
                "Your account was created, "
                "but we could not send the "
                "verification email. "
                "Please try resending the "
                "verification code."
            ),
        )

    return RegistrationResponse(
        message=(
            "Account created. "
            "Please check your email "
            "for the verification code."
        ),
        email=user.email,
        email_verified=user.email_verified,
    )


# ==================================================
# VERIFY EMAIL
# ==================================================


@router.post(
    "/verify-email",
    response_model=VerificationResponse,
)
def verify_email(
    request: VerifyEmailRequest,
    db: Session = Depends(get_db),
):

    user = (
        AuthService.get_user_for_verification(
            db=db,
            email=request.email,
        )
    )

    if user is None:

        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "Invalid verification request."
            ),
        )

    try:

        verified_user = (
            AuthService.verify_email(
                db=db,
                user_id=user.id,
                code=request.code,
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=str(error),
        )

    token = create_access_token(
        user_id=verified_user.id,
    )

    return VerificationResponse(
        message=(
            "Email verified successfully."
        ),
        access_token=token,
        token_type="bearer",
        user=verified_user,
    )


# ==================================================
# RESEND EMAIL VERIFICATION
# ==================================================


@router.post(
    "/resend-verification",
    response_model=RegistrationResponse,
)
def resend_verification(
    request: ResendVerificationRequest,
    db: Session = Depends(get_db),
):

    user = (
        AuthService.get_user_for_verification(
            db=db,
            email=request.email,
        )
    )

    if user is None:

        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "Invalid verification request."
            ),
        )

    if user.email_verified:

        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "Email is already verified."
            ),
        )

    try:

        otp_code = (
            AuthService.create_verification_otp(
                db=db,
                user_id=user.id,
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=(
                status.HTTP_429_TOO_MANY_REQUESTS
            ),
            detail=str(error),
        )

    try:

        EmailService.send_verification_otp(
            recipient=user.email,
            otp=otp_code,
        )

    except Exception:

        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=(
                "Could not send the "
                "verification email. "
                "Please try again later."
            ),
        )

    return RegistrationResponse(
        message=(
            "A new verification code "
            "has been sent."
        ),
        email=user.email,
        email_verified=user.email_verified,
    )


# ==================================================
# FORGOT PASSWORD
# ==================================================


@router.post(
    "/forgot-password",
    response_model=PasswordResetResponse,
)
def forgot_password(
    request: PasswordResetRequest,
    db: Session = Depends(get_db),
):

    try:

        otp_code = (
            AuthService.create_password_reset_otp(
                db=db,
                email=request.email,
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=(
                status.HTTP_429_TOO_MANY_REQUESTS
            ),
            detail=str(error),
        )

    # ------------------------------------------------
    # Deliberately do not reveal whether the account
    # exists.
    # ------------------------------------------------

    if otp_code is not None:

        try:

            EmailService.send_password_reset_otp(
                recipient=request.email,
                otp=otp_code,
            )

        except Exception:

            raise HTTPException(
                status_code=(
                    status.HTTP_503_SERVICE_UNAVAILABLE
                ),
                detail=(
                    "Could not send the "
                    "password reset email. "
                    "Please try again later."
                ),
            )

    return PasswordResetResponse(
        message=(
            "If an account exists for this "
            "email address, a password reset "
            "code has been sent."
        )
    )


# ==================================================
# RESET PASSWORD
# ==================================================


@router.post(
    "/reset-password",
    response_model=PasswordResetConfirmResponse,
)
def reset_password(
    request: PasswordResetConfirmRequest,
    db: Session = Depends(get_db),
):

    try:

        AuthService.reset_password(
            db=db,
            email=request.email,
            code=request.code,
            new_password=request.new_password,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=str(error),
        )

    return PasswordResetConfirmResponse(
        message=(
            "Password reset successfully. "
            "You can now sign in."
        )
    )


# ==================================================
# LOGIN
# ==================================================


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    request: UserLogin,
    db: Session = Depends(get_db),
):

    try:

        user = (
            AuthService.authenticate_user(
                db=db,
                email=request.email,
                password=request.password,
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail=str(error),
        )

    if user is None:

        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Invalid email or password."
            ),
        )

    token = create_access_token(
        user_id=user.id,
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user,
    )


# ==================================================
# GOOGLE AUTHENTICATION
# ==================================================


@router.get(
    "/google",
)
def google_login():

    authorization_url = (
        GoogleAuthService.get_authorization_url()
    )

    return RedirectResponse(
        url=authorization_url
    )


@router.get(
    "/google/callback",
)
def google_callback(
    code: str,
    db: Session = Depends(get_db),
):

    try:

        google_user = (
            GoogleAuthService.authenticate(
                code
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=str(error),
        )

    try:

        user = (
            AuthService.authenticate_google_user(
                db=db,
                google_id=(
                    google_user["google_id"]
                ),
                email=google_user["email"],
                name=google_user.get("name"),
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=str(error),
        )

    token = create_access_token(
        user_id=user.id,
    )

    redirect_url = (
        f"{settings.frontend_base_url}"
        f"/auth/google/callback"
        f"?token={token}"
    )

    return RedirectResponse(
        url=redirect_url
    )


# ==================================================
# CURRENT USER
# ==================================================


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user=Depends(
        get_current_user
    ),
):

    return current_user