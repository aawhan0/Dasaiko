from functools import wraps

from sqlalchemy.orm import Session


def transactional(func):
    @wraps(func)
    def wrapper(*args, **kwargs):

        db: Session = kwargs.get("db")

        if db is None:
            db = args[0]

        try:
            result = func(*args, **kwargs)
            db.commit()
            return result

        except Exception:
            db.rollback()
            raise

    return wrapper