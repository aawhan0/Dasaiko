"""merge migration heads

Revision ID: 0f0ddf81d7a0
Revises: 6e1a7d9c2f10, f1a2b3c4d5e6
Create Date: 2026-08-12 23:56:56.151350

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0f0ddf81d7a0'
down_revision: Union[str, Sequence[str], None] = ('6e1a7d9c2f10', 'f1a2b3c4d5e6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
