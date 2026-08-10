"""add page dimensions to chunks

Revision ID: f1a2b3c4d5e6
Revises: 88b9f4a8d939
Create Date: 2026-08-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, Sequence[str], None] = "88b9f4a8d939"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "chunks",
        sa.Column("page_width", sa.Float(), nullable=True),
    )
    op.add_column(
        "chunks",
        sa.Column("page_height", sa.Float(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("chunks", "page_height")
    op.drop_column("chunks", "page_width")
