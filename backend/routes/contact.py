from flask import Blueprint, request, jsonify
from extensions import db
from models import ContactMessage
from utils.auth_helpers import admin_required, get_current_user
from utils.validators import normalize_phone, is_valid_phone
from services.audit_service import log_admin_action

contact_bp = Blueprint("contact", __name__)

@contact_bp.route("", methods=["POST"])
def submit_contact_message():
    """Public contact form submission. Strictly uses Name, Phone, Subject, Message."""
    data = request.get_json() or {}
    name = str(data.get("name", "")).strip()
    raw_phone = data.get("phone", "")
    subject = str(data.get("subject", "")).strip()
    message = str(data.get("message", "")).strip()

    if not name:
        return jsonify({"error": "Full name is required."}), 400

    phone = normalize_phone(raw_phone)
    if not is_valid_phone(phone):
        return jsonify({"error": "Valid phone number (7-15 digits) is required."}), 400

    if not subject:
        return jsonify({"error": "Subject is required."}), 400

    if not message or len(message) < 5:
        return jsonify({"error": "Message must be at least 5 characters long."}), 400

    msg_record = ContactMessage(
        name=name,
        phone=phone,
        subject=subject,
        message=message,
        is_read=False
    )
    db.session.add(msg_record)
    db.session.commit()

    return jsonify({
        "message": "Thank you for reaching out. Your message has been received and our team will review it shortly.",
        "message_id": msg_record.id
    }), 201


@contact_bp.route("/admin/contact-messages", methods=["GET"])
@admin_required()
def admin_get_contact_messages():
    """Admin view: list contact messages."""
    is_read_filter = request.args.get("is_read")
    query = ContactMessage.query

    if is_read_filter is not None and is_read_filter != "":
        if is_read_filter.lower() == "true":
            query = query.filter_by(is_read=True)
        elif is_read_filter.lower() == "false":
            query = query.filter_by(is_read=False)

    messages = query.order_by(ContactMessage.created_at.desc()).all()
    unread_count = ContactMessage.query.filter_by(is_read=False).count()

    return jsonify({
        "messages": [m.to_dict() for m in messages],
        "unread_count": unread_count
    }), 200


@contact_bp.route("/admin/contact-messages/<int:message_id>/read", methods=["POST"])
@admin_required()
def admin_mark_message_read(message_id):
    """Admin marks contact message as read."""
    msg = ContactMessage.query.get_or_404(message_id)
    msg.is_read = True
    db.session.commit()
    return jsonify({"message": "Message marked as read"}), 200


@contact_bp.route("/admin/contact-messages/<int:message_id>/notes", methods=["POST"])
@admin_required()
def admin_update_message_notes(message_id):
    """Admin updates resolution notes on a contact message."""
    admin = get_current_user()
    msg = ContactMessage.query.get_or_404(message_id)
    data = request.get_json() or {}
    notes = data.get("admin_notes", "")

    msg.admin_notes = notes
    msg.is_read = True
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="UPDATE_CONTACT_NOTES",
        target_type="ContactMessage",
        target_id=msg.id,
        details=f"Admin notes recorded for message from {msg.name}"
    )

    return jsonify({"message": "Notes saved successfully", "contact_message": msg.to_dict()}), 200
