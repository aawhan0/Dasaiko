"""create research profiles

Revision ID: a31b7c9e5f21
Revises: 9f2c1a7b6d40
Create Date: 2026-09-07 00:05:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a31b7c9e5f21"
down_revision: Union[str, Sequence[str], None] = "9f2c1a7b6d40"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "research_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("topic_affinity", sa.JSON(), nullable=True),
        sa.Column("goal_affinity", sa.JSON(), nullable=True),
        sa.Column("difficulty_affinity", sa.JSON(), nullable=True),
        sa.Column("exploration_weight", sa.Float(), nullable=False),
        sa.Column("papers_opened", sa.Integer(), nullable=False),
        sa.Column("papers_completed", sa.Integer(), nullable=False),
        sa.Column("papers_saved", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index(
        "ix_research_profiles_user_id",
        "research_profiles",
        ["user_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_research_profiles_user_id",
        table_name="research_profiles",
    )
    op.drop_table("research_profiles")
