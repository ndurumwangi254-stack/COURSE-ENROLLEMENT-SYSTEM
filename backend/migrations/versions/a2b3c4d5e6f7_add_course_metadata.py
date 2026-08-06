"""add course metadata

Revision ID: a2b3c4d5e6f7
Revises: 69132079bb40
Create Date: 2026-08-07 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a2b3c4d5e6f7'
down_revision = '69132079bb40'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns for course metadata
    op.add_column('courses', sa.Column('grade_requirements', sa.String(length=120), nullable=True))
    op.add_column('courses', sa.Column('cost', sa.Float(), nullable=True, server_default='0.0'))
    op.add_column('courses', sa.Column('duration', sa.String(length=80), nullable=True))


def downgrade():
    # Remove added columns
    op.drop_column('courses', 'duration')
    op.drop_column('courses', 'cost')
    op.drop_column('courses', 'grade_requirements')
