"""add email verification OTPs

Revision ID: 2af634b2ba53
Revises: df495af5f19f
Create Date: 2026-08-16 14:54:31.455323

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2af634b2ba53"

down_revision: Union[str, Sequence[str], None] = "df495af5f19f"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # ----------------------------------------
    # Users
    # ----------------------------------------

    # Existing users need a value when this
    # non-nullable column is introduced.
    op.add_column(
        "users",
        sa.Column(
            "email_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    # The default is only needed while migrating
    # existing rows. Remove the database-level
    # default afterward because the SQLAlchemy
    # model already defines its application-level
    # default.
    op.alter_column(
        "users",
        "email_verified",
        server_default=None,
    )

    # ----------------------------------------
    # Email Verification OTPs
    # ----------------------------------------

    op.create_table(
        "email_verification_otps",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "code_hash",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "purpose",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "expires_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column(
            "attempts",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "used_at",
            sa.DateTime(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_email_verification_otps_user_id"),
        "email_verification_otps",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_email_verification_otps_purpose"),
        "email_verification_otps",
        ["purpose"],
        unique=False,
    )

    op.create_index(
        op.f("ix_email_verification_otps_expires_at"),
        "email_verification_otps",
        ["expires_at"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Drop the dependent OTP table first so its
    # foreign key is removed before users changes.
    op.drop_index(
        op.f("ix_email_verification_otps_expires_at"),
        table_name="email_verification_otps",
    )

    op.drop_index(
        op.f("ix_email_verification_otps_purpose"),
        table_name="email_verification_otps",
    )

    op.drop_index(
        op.f("ix_email_verification_otps_user_id"),
        table_name="email_verification_otps",
    )

    op.drop_table(
        "email_verification_otps",
    )

    op.drop_column(
        "users",
        "email_verified",
    )