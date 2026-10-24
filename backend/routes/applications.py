from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import jwt_required
from extensions import db
from models import CandidateApplication, Poll, Candidate, PollCandidate, User
from utils.auth_helpers import get_current_user, admin_required, notify_user
from services.audit_service import log_admin_action

applications_bp = Blueprint("applications", __name__)

def utc_now():
    return datetime.now(timezone.utc)

@applications_bp.route("/candidate/applications", methods=["POST"])
@jwt_required()
def submit_application():
    """Registered user applies to become a candidate in an existing poll."""
    current_user = get_current_user()
    if not current_user or not current_user.is_active:
        return jsonify({"error": "User account is invalid or disabled."}), 403

    data = request.get_json() or {}
    poll_id = data.get("poll_id")
    introduction = str(data.get("introduction", "")).strip()
    reason = str(data.get("reason", "")).strip()
    supporting_info = str(data.get("supporting_info", "")).strip()

    if not poll_id or not introduction or not reason:
        return jsonify({"error": "Poll ID, introduction, and reason are required."}), 400

    poll = Poll.query.get(poll_id)
    if not poll:
        return jsonify({"error": "Poll not found."}), 404

    if poll.status in ["closed", "archived"]:
        return jsonify({"error": "Cannot apply to a closed or archived poll."}), 400

    # Check for existing application
    existing = CandidateApplication.query.filter_by(applicant_id=current_user.id, poll_id=poll.id).first()
    if existing:
        return jsonify({
            "error": f"You already have an application for this poll with status '{existing.status}'."
        }), 409

    try:
        app_record = CandidateApplication(
            applicant_id=current_user.id,
            poll_id=poll.id,
            applicant_username=current_user.username,
            applicant_phone=current_user.phone,
            introduction=introduction,
            reason=reason,
            supporting_info=supporting_info,
            status="pending"
        )
        db.session.add(app_record)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Duplicate application for this poll."}), 409

    notify_user(
        current_user.id,
        "Application Submitted",
        f"Your candidacy application for '{poll.title}' was received and is pending administrator review.",
        notif_type="info",
        link="/candidate"
    )

    return jsonify({
        "message": "Candidate application submitted successfully.",
        "application": app_record.to_dict()
    }), 201


@applications_bp.route("/candidate/applications", methods=["GET"])
@jwt_required()
def get_user_applications():
    """Returns candidate applications submitted by the current user."""
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    apps = CandidateApplication.query.filter_by(applicant_id=current_user.id).order_by(CandidateApplication.created_at.desc()).all()
    return jsonify({
        "applications": [a.to_dict(is_admin=False) for a in apps]
    }), 200


@applications_bp.route("/admin/applications", methods=["GET"])
@admin_required()
def admin_get_applications():
    """Admin view: lists all candidate applications with filtering."""
    status = request.args.get("status")
    query = CandidateApplication.query

    if status and status.lower() != "all":
        query = query.filter_by(status=status)

    apps = query.order_by(CandidateApplication.created_at.desc()).all()
    return jsonify({
        "applications": [a.to_dict(is_admin=True) for a in apps]
    }), 200


@applications_bp.route("/admin/applications/<int:app_id>/approve", methods=["POST"])
@admin_required()
def admin_approve_application(app_id):
    """Admin approves candidate application, linking candidate to the poll."""
    admin = get_current_user()
    app_record = CandidateApplication.query.get_or_404(app_id)
    poll = Poll.query.get(app_record.poll_id)
    applicant = User.query.get(app_record.applicant_id)

    if not poll or not applicant:
        return jsonify({"error": "Related poll or applicant user not found."}), 404

    # Ensure applicant has a Candidate profile
    candidate = Candidate.query.filter_by(user_id=applicant.id).first()
    if not candidate:
        candidate = Candidate(
            user_id=applicant.id,
            full_name=applicant.full_name,
            username=applicant.username,
            phone=applicant.phone,
            profile_image=applicant.profile_image,
            biography=app_record.introduction,
            qualifications=app_record.supporting_info,
            status="approved"
        )
        db.session.add(candidate)
        db.session.flush()
    else:
        candidate.status = "approved"

    # Promote user role to candidate if they were a voter
    if applicant.role == "voter":
        applicant.role = "candidate"

    # Add to PollCandidate if not already added
    poll_candidate = PollCandidate.query.filter_by(poll_id=poll.id, candidate_id=candidate.id).first()
    if not poll_candidate:
        max_order = db.session.query(db.func.max(PollCandidate.display_order)).filter_by(poll_id=poll.id).scalar() or 0
        poll_candidate = PollCandidate(
            poll_id=poll.id,
            candidate_id=candidate.id,
            display_order=max_order + 1,
            statement=app_record.introduction
        )
        db.session.add(poll_candidate)

    data = request.get_json() or {}
    admin_notes = data.get("admin_notes", "Application approved by administrator.")
    app_record.status = "approved"
    app_record.admin_notes = admin_notes
    app_record.updated_at = utc_now()

    db.session.commit()

    log_admin_action(
        admin=admin,
        action="APPROVE_CANDIDATE_APPLICATION",
        target_type="CandidateApplication",
        target_id=app_record.id,
        details=f"Approved @{applicant.username} for poll '{poll.title}'"
    )

    notify_user(
        applicant.id,
        "Candidacy Application Approved!",
        f"Congratulations! Your application to participate as a candidate in '{poll.title}' has been approved.",
        notif_type="success",
        link=f"/polls/{poll.id}"
    )

    return jsonify({
        "message": "Application approved successfully",
        "application": app_record.to_dict(is_admin=True)
    }), 200


@applications_bp.route("/admin/applications/<int:app_id>/reject", methods=["POST"])
@admin_required()
def admin_reject_application(app_id):
    """Admin rejects candidate application."""
    admin = get_current_user()
    app_record = CandidateApplication.query.get_or_404(app_id)
    data = request.get_json() or {}
    admin_notes = data.get("admin_notes", "Application did not meet candidate criteria.")

    app_record.status = "rejected"
    app_record.admin_notes = admin_notes
    app_record.updated_at = utc_now()

    db.session.commit()

    log_admin_action(
        admin=admin,
        action="REJECT_CANDIDATE_APPLICATION",
        target_type="CandidateApplication",
        target_id=app_record.id,
        details=f"Rejected application for poll {app_record.poll_id}. Reason: {admin_notes}"
    )

    notify_user(
        app_record.applicant_id,
        "Candidacy Application Update",
        f"Your application for poll '{app_record.poll.title if app_record.poll else 'the poll'}' was rejected. Note: {admin_notes}",
        notif_type="warning",
        link="/candidate"
    )

    return jsonify({
        "message": "Application rejected",
        "application": app_record.to_dict(is_admin=True)
    }), 200


@applications_bp.route("/admin/applications/<int:app_id>/request-info", methods=["POST"])
@admin_required()
def admin_request_info_application(app_id):
    """Admin requests additional info from applicant."""
    admin = get_current_user()
    app_record = CandidateApplication.query.get_or_404(app_id)
    data = request.get_json() or {}
    admin_notes = data.get("admin_notes", "Please provide additional supporting documentation.")

    app_record.status = "more_info"
    app_record.admin_notes = admin_notes
    app_record.updated_at = utc_now()

    db.session.commit()

    log_admin_action(
        admin=admin,
        action="REQUEST_INFO_CANDIDATE_APPLICATION",
        target_type="CandidateApplication",
        target_id=app_record.id,
        details=f"Requested more info for app #{app_record.id}: {admin_notes}"
    )

    notify_user(
        app_record.applicant_id,
        "Additional Information Needed",
        f"The administrator requested more details for your application: {admin_notes}",
        notif_type="action",
        link="/candidate"
    )

    return jsonify({
        "message": "Requested additional information",
        "application": app_record.to_dict(is_admin=True)
    }), 200
