"""add user ownership to documents and conversations

Revision ID: df495af5f19f
Revises: 0f0ddf81d7a0
Create Date: 2026-08-12 23:57:27.370074

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.

revision: str = "df495af5f19f"

down_revision: Union[
    str,
    Sequence[str],
    None,
] = "0f0ddf81d7a0"

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
    """Upgrade schema."""

    # ----------------------------------------
    # Documents
    # ----------------------------------------

    op.add_column(
        "documents",
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_documents_user_id",
        "documents",
        ["user_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_documents_user_id_users",
        "documents",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # Existing documents belong to the
    # currently existing user.
    op.execute(
        sa.text(
            """
            UPDATE documents
            SET user_id = 1
            WHERE user_id IS NULL
            """
        )
    )

    op.alter_column(
        "documents",
        "user_id",
        existing_type=sa.Integer(),
        nullable=False,
    )

    # ----------------------------------------
    # Conversations
    # ----------------------------------------

    op.add_column(
        "conversations",
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_conversations_user_id",
        "conversations",
        ["user_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_conversations_user_id_users",
        "conversations",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # Existing conversations belong to the
    # currently existing user.
    op.execute(
        sa.text(
            """
            UPDATE conversations
            SET user_id = 1
            WHERE user_id IS NULL
            """
        )
    )

    op.alter_column(
        "conversations",
        "user_id",
        existing_type=sa.Integer(),
        nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    # ----------------------------------------
    # Conversations
    # ----------------------------------------

    op.drop_constraint(
        "fk_conversations_user_id_users",
        "conversations",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_conversations_user_id",
        table_name="conversations",
    )

    op.drop_column(
        "conversations",
        "user_id",
    )

    # ----------------------------------------
    # Documents
    # ----------------------------------------

    op.drop_constraint(
        "fk_documents_user_id_users",
        "documents",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_documents_user_id",
        table_name="documents",
    )

    op.drop_column(
        "documents",
        "user_id",
    )