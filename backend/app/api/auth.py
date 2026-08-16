from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

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


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


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