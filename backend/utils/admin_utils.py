from sqlalchemy.orm import Session
from models.admin_model import Admin

def resolve_admin_id(db: Session, admin_identifier: int):
    """Resolve an admin identifier to the admins.id.

    admin_identifier may be an admins.id or a users.id (when frontend passes session.user_id).
    Returns the admins.id or None if not found.
    """
    if admin_identifier is None:
        return None

    # try direct admin id
    admin = db.query(Admin).filter(Admin.id == admin_identifier).first()
    if admin:
        return admin.id

    # try mapping from user_id -> admin
    admin = db.query(Admin).filter(Admin.user_id == admin_identifier).first()
    if admin:
        return admin.id

    return None
