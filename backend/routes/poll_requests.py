from flask import Blueprint, request, jsonify
from datetime import datetime, timezone, timedelta
from flask_jwt_extended import jwt_required
from extensions import db
from models import PollRequest, ProposedCandidate, Poll, Candidate, PollCandidate
from utils.auth_helpers import get_current_user, admin_required, notify_user
from utils.validators import slugify, normalize_phone, normalize_username
from services.audit_service import log_admin_action

poll_requests_bp = Blueprint("poll_requests", __name__)

def utc_now():
    return datetime.now(timezone.utc)

@poll_requests_bp.route("/candidate/poll-requests", methods=["POST"])
@jwt_required()
def submit_poll_request():
    """Candidate/user proposes a new poll with optional proposed candidates."""
    current_user = get_current_user()
    if not current_user or not current_user.is_active:
        return jsonify({"error": "User account inactive or invalid."}), 403

    data = request.get_json() or {}
    proposed_title = str(data.get("proposed_title", "")).strip()
    description = str(data.get("description", "")).strip()
    category = str(data.get("category", "")).strip()
    reason = str(data.get("reason", "")).strip()

    if not proposed_title or not description or not category or not reason:
        return jsonify({"error": "Title, description, category, and reason are required."}), 400

    start_date_str = data.get("suggested_start_date")
    end_date_str = data.get("suggested_end_date")
    start_date = None
    end_date = None

    if start_date_str:
        try:
            start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
        except ValueError:
            pass
    if end_date_str:
        try:
            end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
        except ValueError:
            pass

    poll_req = PollRequest(
        requester_id=current_user.id,
        proposed_title=proposed_title,
        description=description,
        category=category,
        reason=reason,
        suggested_start_date=start_date,
        suggested_end_date=end_date,
        status="pending"
    )
    db.session.add(poll_req)
    db.session.flush()

    # Process proposed candidates
    proposed_list = data.get("proposed_candidates", [])
    if isinstance(proposed_list, list):
        for c in proposed_list:
            c_name = str(c.get("full_name", "")).strip()
            if c_name:
                pc = ProposedCandidate(
                    poll_request_id=poll_req.id,
                    full_name=c_name,
                    username=normalize_username(c.get("username", "")),
                    phone=normalize_phone(c.get("phone", "")),
                    introduction=str(c.get("introduction", "")).strip(),
                    status="proposed"
                )
                db.session.add(pc)

    db.session.commit()

    notify_user(
        current_user.id,
        "Poll Request Received",
        f"Your proposed poll '{proposed_title}' has been submitted (Request ID: #{poll_req.id}) and is pending review.",
        notif_type="info",
        link="/candidate"
    )

    return jsonify({
        "message": "Poll request submitted successfully.",
        "poll_request": poll_req.to_dict()
    }), 201


@poll_requests_bp.route("/candidate/poll-requests", methods=["GET"])
@jwt_required()
def get_user_poll_requests():
    """Lists poll requests submitted by current user."""
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    reqs = PollRequest.query.filter_by(requester_id=current_user.id).order_by(PollRequest.created_at.desc()).all()
    return jsonify({
        "poll_requests": [r.to_dict(is_admin=False) for r in reqs]
    }), 200


@poll_requests_bp.route("/admin/poll-requests", methods=["GET"])
@admin_required()
def admin_get_poll_requests():
    """Admin view: lists all poll requests."""
    status = request.args.get("status")
    query = PollRequest.query

    if status and status.lower() != "all":
        query = query.filter_by(status=status)

    reqs = query.order_by(PollRequest.created_at.desc()).all()
    return jsonify({
        "poll_requests": [r.to_dict(is_admin=True) for r in reqs]
    }), 200


@poll_requests_bp.route("/admin/poll-requests/<int:request_id>/approve", methods=["POST"])
@admin_required()
def admin_approve_poll_request(request_id):
    """Admin approves poll request and creates a draft poll from it."""
    admin = get_current_user()
    poll_req = PollRequest.query.get_or_404(request_id)

    data = request.get_json() or {}
    admin_notes = data.get("admin_notes", "Poll request approved.")

    # Create draft poll
    now = utc_now()
    start_time = poll_req.suggested_start_date or (now + timedelta(days=1))
    end_time = poll_req.suggested_end_date or (now + timedelta(days=8))

    base_slug = slugify(poll_req.proposed_title)
    unique_slug = f"{base_slug}-{int(now.timestamp())}"

    new_poll = Poll(
        title=poll_req.proposed_title,
        slug=unique_slug,
        description=poll_req.description,
        category=poll_req.category,
        start_date=start_time,
        end_date=end_time,
        status="draft",  # Created as draft so admin can review candidates and publish when ready
        results_visibility="public",
        created_by_id=admin.id
    )
    db.session.add(new_poll)
    db.session.flush()

    # If applicant is a candidate, automatically attach as candidate to this poll
    requester = poll_req.requester
    cand_profile = Candidate.query.filter_by(user_id=requester.id).first()
    if cand_profile:
        pc = PollCandidate(
            poll_id=new_poll.id,
            candidate_id=cand_profile.id,
            display_order=1,
            statement=f"Initiator of this poll request: {poll_req.proposed_title}"
        )
        db.session.add(pc)

    poll_req.status = "approved"
    poll_req.admin_notes = admin_notes
    poll_req.created_poll_id = new_poll.id
    poll_req.updated_at = now

    db.session.commit()

    log_admin_action(
        admin=admin,
        action="APPROVE_POLL_REQUEST",
        target_type="PollRequest",
        target_id=poll_req.id,
        details=f"Approved poll request #{poll_req.id} -> created draft poll #{new_poll.id}"
    )

    notify_user(
        poll_req.requester_id,
        "Poll Request Approved!",
        f"Your proposed poll '{poll_req.proposed_title}' has been approved and staged as a poll by administrators.",
        notif_type="success",
        link=f"/polls/{new_poll.id}"
    )

    return jsonify({
        "message": "Poll request approved and draft poll created.",
        "poll_request": poll_req.to_dict(is_admin=True),
        "created_poll_id": new_poll.id
    }), 200


@poll_requests_bp.route("/admin/poll-requests/<int:request_id>/reject", methods=["POST"])
@admin_required()
def admin_reject_poll_request(request_id):
    """Admin rejects poll request."""
    admin = get_current_user()
    poll_req = PollRequest.query.get_or_404(request_id)
    data = request.get_json() or {}
    admin_notes = data.get("admin_notes", "Request does not align with community guidelines.")

    poll_req.status = "rejected"
    poll_req.admin_notes = admin_notes
    poll_req.updated_at = utc_now()

    db.session.commit()

    log_admin_action(
        admin=admin,
        action="REJECT_POLL_REQUEST",
        target_type="PollRequest",
        target_id=poll_req.id,
        details=f"Rejected poll request #{poll_req.id}. Reason: {admin_notes}"
    )

    notify_user(
        poll_req.requester_id,
        "Poll Request Update",
        f"Your proposed poll '{poll_req.proposed_title}' was rejected. Note: {admin_notes}",
        notif_type="warning",
        link="/candidate"
    )

    return jsonify({
        "message": "Poll request rejected.",
        "poll_request": poll_req.to_dict(is_admin=True)
    }), 200


@poll_requests_bp.route("/admin/poll-requests/<int:request_id>/request-info", methods=["POST"])
@admin_required()
def admin_request_info_poll_request(request_id):
    """Admin requests additional info on poll request."""
    admin = get_current_user()
    poll_req = PollRequest.query.get_or_404(request_id)
    data = request.get_json() or {}
    admin_notes = data.get("admin_notes", "Please provide more details regarding candidate nominations.")

    poll_req.status = "more_info"
    poll_req.admin_notes = admin_notes
    poll_req.updated_at = utc_now()

    db.session.commit()

    log_admin_action(
        admin=admin,
        action="REQUEST_INFO_POLL_REQUEST",
        target_type="PollRequest",
        target_id=poll_req.id,
        details=f"Requested info for poll request #{poll_req.id}"
    )

    notify_user(
        poll_req.requester_id,
        "Additional Information Needed for Poll Request",
        f"The administrator requested more details for '{poll_req.proposed_title}': {admin_notes}",
        notif_type="action",
        link="/candidate"
    )

    return jsonify({
        "message": "Requested more information.",
        "poll_request": poll_req.to_dict(is_admin=True)
    }), 200
