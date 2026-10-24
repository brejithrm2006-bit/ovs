from flask import request
from extensions import db
from models import AdminAuditLog

def log_admin_action(admin, action: str, target_type: str, target_id=None, details: str = None):
    """Persists an administrative audit log record."""
    try:
        ip = request.remote_addr if request else None
        admin_username = admin.username if hasattr(admin, "username") else str(admin)
        admin_id = admin.id if hasattr(admin, "id") else None

        log_entry = AdminAuditLog(
            admin_id=admin_id,
            admin_username=admin_username,
            action=action,
            target_type=target_type,
            target_id=str(target_id) if target_id is not None else None,
            details=details,
            ip_address=ip
        )
        db.session.add(log_entry)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
