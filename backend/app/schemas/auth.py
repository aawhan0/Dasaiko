from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)


class UserRegister(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=50,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr

    code: str = Field(
        min_length=6,
        max_length=6,
        pattern=r"^\d{6}$",
    )


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirmRequest(BaseModel):
    email: EmailStr

    code: str = Field(
        min_length=6,
        max_length=6,
        pattern=r"^\d{6}$",
    )

    new_password: str = Field(
        min_length=8,
        max_length=128,
    )


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool
    email_verified: bool
    onboarding_completed: bool
    onboarding_role: str | None = None
    onboarding_interests: list[str] | None = None
    onboarding_goals: list[str] | None = None
    research_familiarity: str | None = None

    model_config = {
        "from_attributes": True,
    }


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RegistrationResponse(BaseModel):
    message: str
    email: EmailStr
    email_verified: bool


class VerificationResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class PasswordResetResponse(BaseModel):
    message: str


class PasswordResetConfirmResponse(BaseModel):
    message: str


class ResearchProfileUpdateRequest(BaseModel):
    role: str = Field(min_length=1, max_length=50)
    interests: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)
    research_familiarity: str = Field(min_length=1, max_length=50)
    onboarding_completed: bool = True


class ResearchProfileResponse(BaseModel):
    onboarding_completed: bool
    role: str | None = None
    interests: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)
    research_familiarity: str | None = None

