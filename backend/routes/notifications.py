from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Notification
from utils.auth_helpers import get_current_user

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_user_notifications():
    """Lists notifications for authenticated user."""
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    notifs = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).limit(50).all()
    unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()

    return jsonify({
        "notifications": [n.to_dict() for n in notifs],
        "unread_count": unread_count
    }), 200


@notifications_bp.route("/<int:notification_id>/read", methods=["POST"])
@jwt_required()
def mark_notification_read(notification_id):
    """Marks a single notification as read."""
    current_user = get_current_user()
    notif = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
    if not notif:
        return jsonify({"error": "Notification not found"}), 404

    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Notification marked as read"}), 200


@notifications_bp.route("/read-all", methods=["POST"])
@jwt_required()
def mark_all_notifications_read():
    """Marks all notifications for current user as read."""
    current_user = get_current_user()
    Notification.query.filter_by(user_id=current_user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200
