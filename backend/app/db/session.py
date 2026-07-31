from sqlalchemy.orm import sessionmaker

from app.db.database import engine

SessionLocal = sessionmaker(
    autoflush = False,
    autocommit = False,
    bind = engine,
)