"""add user research profile

Revision ID: 9f2c1a7b6d40
Revises: 4fb3232a5899
Create Date: 2026-09-07 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9f2c1a7b6d40"
down_revision: Union[str, Sequence[str], None] = "4fb3232a5899"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "onboarding_completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "onboarding_role",
            sa.String(length=50),
            nullable=True,
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "onboarding_interests",
            sa.JSON(),
            nullable=True,
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "onboarding_goals",
            sa.JSON(),
            nullable=True,
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "research_familiarity",
            sa.String(length=50),
            nullable=True,
        ),
    )
    op.alter_column(
        "users",
        "onboarding_completed",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column("users", "research_familiarity")
    op.drop_column("users", "onboarding_goals")
    op.drop_column("users", "onboarding_interests")
    op.drop_column("users", "onboarding_role")
    op.drop_column("users", "onboarding_completed")
