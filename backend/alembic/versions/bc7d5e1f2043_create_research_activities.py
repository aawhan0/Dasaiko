"""create research activities

Revision ID: bc7d5e1f2043
Revises: a31b7c9e5f21
Create Date: 2026-09-07 00:20:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "bc7d5e1f2043"
down_revision: Union[str, Sequence[str], None] = "a31b7c9e5f21"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "research_activities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("paper_id", sa.String(length=255), nullable=False),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_research_activities_user_id",
        "research_activities",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        "ix_research_activities_paper_id",
        "research_activities",
        ["paper_id"],
        unique=False,
    )
    op.create_index(
        "ix_research_activities_event_type",
        "research_activities",
        ["event_type"],
        unique=False,
    )
    op.create_index(
        "ix_research_activities_created_at",
        "research_activities",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_research_activities_created_at", table_name="research_activities")
    op.drop_index("ix_research_activities_event_type", table_name="research_activities")
    op.drop_index("ix_research_activities_paper_id", table_name="research_activities")
    op.drop_index("ix_research_activities_user_id", table_name="research_activities")
    op.drop_table("research_activities")
