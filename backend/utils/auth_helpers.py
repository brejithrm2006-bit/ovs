from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from extensions import db
from models import User, Notification

def get_current_user():
    """Returns the authenticated User object from JWT identity."""
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        if user_id:
            # Note: user_id is stored as string in JWT sub
            return User.query.get(int(user_id))
    except Exception:
        return None
    return None

def role_required(*allowed_roles):
    """Decorator to enforce role-based access control."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(int(user_id))
            if not user or not user.is_active:
                return jsonify({"error": "User account inactive or not found"}), 403
            if user.role not in allowed_roles:
                return jsonify({"error": f"Access denied. Requires one of roles: {', '.join(allowed_roles)}"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def admin_required():
    """Decorator to enforce administrator role."""
    return role_required("admin")

def notify_user(user_id, title, message, notif_type="info", link=None):
    """Utility to persist an in-app notification for a user."""
    try:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notif_type,
            link=link
        )
        db.session.add(notif)
        db.session.commit()
        return notif
    except Exception as e:
        db.session.rollback()
        return None
