"""add selected document to conversations

Revision ID: 6e1a7d9c2f10
Revises: 41135b71bb05
Create Date: 2026-08-09 15:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6e1a7d9c2f10"
down_revision: Union[
    str,
    Sequence[str],
    None,
] = "41135b71bb05"

branch_labels: Union[
    str,
    Sequence[str],
    None,
] = None

depends_on: Union[
    str,
    Sequence[str],
    None,
] = None


def upgrade() -> None:
    op.add_column(
        "conversations",
        sa.Column(
            "selected_document_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_conversations_selected_document_id_documents",
        "conversations",
        "documents",
        ["selected_document_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_conversations_selected_document_id_documents",
        "conversations",
        type_="foreignkey",
    )

    op.drop_column(
        "conversations",
        "selected_document_id",
    )
