from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models import User
from utils.validators import (
    normalize_phone,
    is_valid_phone,
    normalize_username,
    is_valid_username,
    validate_password_strength,
)
from utils.auth_helpers import get_current_user, notify_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    full_name = str(data.get("full_name", "")).strip()
    raw_username = data.get("username", "")
    raw_phone = data.get("phone", "")
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")
    role_requested = data.get("role", "voter")  # 'voter' or 'candidate'
    profile_image = data.get("profile_image", "")

    if not full_name:
        return jsonify({"error": "Full name is required"}), 400

    username = normalize_username(raw_username)
    if not is_valid_username(username):
        return jsonify({
            "error": "Invalid username. Must be 3-30 characters and contain only letters, numbers, and underscores."
        }), 400

    phone = normalize_phone(raw_phone)
    if not is_valid_phone(phone):
        return jsonify({"error": "Invalid phone number. Must be between 7 and 15 digits."}), 400

    if not password:
        return jsonify({"error": "Password is required"}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    is_strong, msg = validate_password_strength(password)
    if not is_strong:
        return jsonify({"error": msg}), 400

    # Check uniqueness
    if User.query.filter_by(username=username).first():
        return jsonify({"error": f"Username '{username}' is already registered."}), 409

    if User.query.filter_by(phone=phone).first():
        return jsonify({"error": "Phone number is already associated with an account."}), 409

    # Assign initial role: only voter or candidate allowed at registration (admin is seeded)
    role = "candidate" if role_requested == "candidate" else "voter"

    user = User(
        full_name=full_name,
        username=username,
        phone=phone,
        role=role,
        profile_image=profile_image or None
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Send welcome in-app notification
    notify_user(
        user.id,
        "Welcome to VotePulse!",
        f"Your account @{username} has been created successfully. Explore live polls and make your voice count.",
        notif_type="success",
        link="/polls"
    )

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Registration successful",
        "access_token": access_token,
        "user": user.to_dict(include_private=True)
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    identifier = str(data.get("identifier", "")).strip()
    password = data.get("password", "")

    if not identifier or not password:
        return jsonify({"error": "Username/Phone and Password are required."}), 400

    norm_user = normalize_username(identifier)
    norm_phone = normalize_phone(identifier)

    # Search by normalized username OR normalized phone
    user = User.query.filter(
        (User.username == norm_user) | (User.phone == norm_phone)
    ).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid username/phone or password."}), 401

    if not user.is_active:
        return jsonify({"error": "Account is disabled. Please contact an administrator."}), 403

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict(include_private=True)
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logged out successfully"}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user_profile():
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    data = user.to_dict(include_private=True)
    data["unread_notifications"] = user.notifications.filter_by(is_read=False).count()
    return jsonify({"user": data}), 200


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    if "full_name" in data and data["full_name"].strip():
        user.full_name = data["full_name"].strip()
    if "profile_image" in data:
        user.profile_image = data["profile_image"]

    # Password change
    new_password = data.get("new_password")
    current_password = data.get("current_password")
    if new_password:
        if not current_password or not user.check_password(current_password):
            return jsonify({"error": "Current password is incorrect"}), 400
        is_strong, msg = validate_password_strength(new_password)
        if not is_strong:
            return jsonify({"error": msg}), 400
        user.set_password(new_password)

    db.session.commit()
    return jsonify({
        "message": "Profile updated successfully",
        "user": user.to_dict(include_private=True)
    }), 200
