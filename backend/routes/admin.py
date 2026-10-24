from flask import Blueprint, request, jsonify
from datetime import datetime, timezone, timedelta
from extensions import db
from models import (
    User, Poll, Candidate, PollCandidate, Vote,
    CandidateApplication, PollRequest, ContactMessage, AdminAuditLog
)
from utils.auth_helpers import admin_required, get_current_user, notify_user
from utils.validators import slugify, normalize_phone, is_valid_phone, normalize_username, is_valid_username
from services.audit_service import log_admin_action

admin_bp = Blueprint("admin", __name__)

def utc_now():
    return datetime.now(timezone.utc)

@admin_bp.route("/overview", methods=["GET"])
@admin_required()
def get_admin_overview():
    """Comprehensive dashboard statistics and chart datasets."""
    total_voters = User.query.filter_by(role="voter").count()
    total_candidates = Candidate.query.count()
    active_polls = Poll.query.filter_by(status="active").count()
    pending_applications = CandidateApplication.query.filter_by(status="pending").count()
    pending_poll_requests = PollRequest.query.filter_by(status="pending").count()
    total_votes = Vote.query.count()
    unread_messages = ContactMessage.query.filter_by(is_read=False).count()

    # Polls status distribution
    status_counts = {}
    for st in ["active", "upcoming", "closed", "draft", "archived"]:
        status_counts[st] = Poll.query.filter_by(status=st).count()

    # Votes by poll (Top 6)
    polls = Poll.query.all()
    votes_by_poll = []
    for p in sorted(polls, key=lambda x: x.votes.count(), reverse=True)[:6]:
        votes_by_poll.append({
            "poll_id": p.id,
            "title": p.title[:22] + "..." if len(p.title) > 22 else p.title,
            "votes": p.votes.count(),
            "category": p.category
        })

    # Top candidates by total votes
    candidates = Candidate.query.filter_by(status="approved").all()
    top_candidates = []
    for c in sorted(candidates, key=lambda x: x.votes.count(), reverse=True)[:6]:
        top_candidates.append({
            "candidate_id": c.id,
            "name": c.full_name,
            "votes": c.votes.count()
        })

    # Recent Audit Logs
    recent_logs = AdminAuditLog.query.order_by(AdminAuditLog.created_at.desc()).limit(8).all()

    return jsonify({
        "stats": {
            "total_voters": total_voters,
            "total_candidates": total_candidates,
            "active_polls": active_polls,
            "pending_applications": pending_applications,
            "pending_poll_requests": pending_poll_requests,
            "total_votes": total_votes,
            "unread_messages": unread_messages
        },
        "charts": {
            "votes_by_poll": votes_by_poll,
            "top_candidates": top_candidates,
            "poll_status_breakdown": [
                {"status": k.capitalize(), "count": v} for k, v in status_counts.items()
            ]
        },
        "recent_logs": [log.to_dict() for log in recent_logs]
    }), 200


@admin_bp.route("/polls", methods=["POST"])
@admin_required()
def create_poll():
    """Admin directly creates an official poll."""
    admin = get_current_user()
    data = request.get_json() or {}

    title = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()
    category = str(data.get("category", "")).strip()
    start_date_str = data.get("start_date")
    end_date_str = data.get("end_date")
    status = data.get("status", "draft")
    results_visibility = data.get("results_visibility", "public")
    banner_image = data.get("banner_image", "")
    max_candidates = int(data.get("max_candidates", 20))
    eligibility_rules = data.get("eligibility_rules", "")

    if not title or not description or not category or not start_date_str or not end_date_str:
        return jsonify({"error": "Title, description, category, start_date, and end_date are required."}), 400

    try:
        start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
        end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
    except ValueError:
        return jsonify({"error": "Invalid date format. Use ISO format."}), 400

    if end_date <= start_date:
        return jsonify({"error": "End date must be strictly after start date."}), 400

    base_slug = slugify(title)
    unique_slug = f"{base_slug}-{int(utc_now().timestamp())}"

    poll = Poll(
        title=title,
        slug=unique_slug,
        description=description,
        category=category,
        banner_image=banner_image or None,
        start_date=start_date,
        end_date=end_date,
        status=status,
        results_visibility=results_visibility,
        max_candidates=max_candidates,
        eligibility_rules=eligibility_rules or None,
        created_by_id=admin.id
    )
    db.session.add(poll)
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="CREATE_POLL",
        target_type="Poll",
        target_id=poll.id,
        details=f"Created poll: {title} (status: {status})"
    )

    return jsonify({
        "message": "Poll created successfully.",
        "poll": poll.to_dict()
    }), 201


@admin_bp.route("/polls/<int:poll_id>", methods=["PUT"])
@admin_required()
def update_poll(poll_id):
    """Admin edits poll parameters."""
    admin = get_current_user()
    poll = Poll.query.get_or_404(poll_id)
    data = request.get_json() or {}

    if "title" in data and data["title"].strip():
        poll.title = data["title"].strip()
    if "description" in data:
        poll.description = data["description"].strip()
    if "category" in data:
        poll.category = data["category"].strip()
    if "banner_image" in data:
        poll.banner_image = data["banner_image"]
    if "status" in data:
        poll.status = data["status"]
    if "results_visibility" in data:
        poll.results_visibility = data["results_visibility"]
    if "max_candidates" in data:
        poll.max_candidates = int(data["max_candidates"])
    if "eligibility_rules" in data:
        poll.eligibility_rules = data["eligibility_rules"]

    if "start_date" in data:
        try:
            poll.start_date = datetime.fromisoformat(data["start_date"].replace("Z", "+00:00"))
        except ValueError:
            pass
    if "end_date" in data:
        try:
            poll.end_date = datetime.fromisoformat(data["end_date"].replace("Z", "+00:00"))
        except ValueError:
            pass

    poll.updated_at = utc_now()
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="UPDATE_POLL",
        target_type="Poll",
        target_id=poll.id,
        details=f"Updated poll #{poll.id}: {poll.title}"
    )

    return jsonify({"message": "Poll updated successfully", "poll": poll.to_dict()}), 200


@admin_bp.route("/polls/<int:poll_id>/publish", methods=["POST"])
@admin_required()
def publish_poll(poll_id):
    """Admin publishes a draft poll to active or upcoming."""
    admin = get_current_user()
    poll = Poll.query.get_or_404(poll_id)

    if len(poll.poll_candidates) < 1:
        return jsonify({"error": "Cannot publish a poll without at least one approved candidate."}), 400

    now = utc_now()
    if poll.start_date <= now <= poll.end_date:
        poll.status = "active"
    elif now < poll.start_date:
        poll.status = "upcoming"
    else:
        poll.status = "closed"

    poll.updated_at = now
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="PUBLISH_POLL",
        target_type="Poll",
        target_id=poll.id,
        details=f"Published poll #{poll.id} ({poll.title}) with status {poll.status}"
    )

    return jsonify({"message": f"Poll published with status '{poll.status}'.", "poll": poll.to_dict()}), 200


@admin_bp.route("/polls/<int:poll_id>/close", methods=["POST"])
@admin_required()
def close_poll(poll_id):
    """Admin explicitly closes a poll."""
    admin = get_current_user()
    poll = Poll.query.get_or_404(poll_id)
    poll.status = "closed"
    poll.updated_at = utc_now()
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="CLOSE_POLL",
        target_type="Poll",
        target_id=poll.id,
        details=f"Closed poll #{poll.id}: {poll.title}"
    )

    return jsonify({"message": "Poll closed successfully.", "poll": poll.to_dict()}), 200


@admin_bp.route("/polls/<int:poll_id>/archive", methods=["POST"])
@admin_required()
def archive_poll(poll_id):
    """Admin archives a poll without deleting historical vote records."""
    admin = get_current_user()
    poll = Poll.query.get_or_404(poll_id)
    poll.status = "archived"
    poll.updated_at = utc_now()
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="ARCHIVE_POLL",
        target_type="Poll",
        target_id=poll.id,
        details=f"Archived poll #{poll.id}: {poll.title}"
    )

    return jsonify({"message": "Poll archived successfully.", "poll": poll.to_dict()}), 200


@admin_bp.route("/polls/<int:poll_id>/candidates", methods=["POST"])
@admin_required()
def add_candidate_to_poll(poll_id):
    """Admin adds an approved candidate to a poll."""
    admin = get_current_user()
    poll = Poll.query.get_or_404(poll_id)
    data = request.get_json() or {}
    candidate_id = data.get("candidate_id")
    statement = data.get("statement", "")

    if not candidate_id:
        return jsonify({"error": "candidate_id is required."}), 400

    candidate = Candidate.query.get_or_404(candidate_id)
    if candidate.status != "approved":
        return jsonify({"error": "Candidate is not in approved status."}), 400

    existing = PollCandidate.query.filter_by(poll_id=poll.id, candidate_id=candidate.id).first()
    if existing:
        return jsonify({"error": "Candidate is already assigned to this poll."}), 409

    max_order = db.session.query(db.func.max(PollCandidate.display_order)).filter_by(poll_id=poll.id).scalar() or 0
    pc = PollCandidate(
        poll_id=poll.id,
        candidate_id=candidate.id,
        display_order=max_order + 1,
        statement=statement or None
    )
    db.session.add(pc)
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="ADD_CANDIDATE_TO_POLL",
        target_type="PollCandidate",
        target_id=pc.id,
        details=f"Added '{candidate.full_name}' to poll #{poll.id} ({poll.title})"
    )

    return jsonify({"message": "Candidate added to poll successfully.", "candidate": pc.to_dict()}), 201


@admin_bp.route("/polls/<int:poll_id>/candidates/<int:candidate_id>", methods=["DELETE"])
@admin_required()
def remove_candidate_from_poll(poll_id, candidate_id):
    """Admin removes a candidate from a poll if no votes have been cast for them yet."""
    admin = get_current_user()
    pc = PollCandidate.query.filter_by(poll_id=poll_id, candidate_id=candidate_id).first_or_404()

    vote_count = Vote.query.filter_by(poll_id=poll_id, candidate_id=candidate_id).count()
    if vote_count > 0:
        return jsonify({"error": "Cannot remove candidate who has already received votes in this poll."}), 400

    db.session.delete(pc)
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="REMOVE_CANDIDATE_FROM_POLL",
        target_type="PollCandidate",
        target_id=candidate_id,
        details=f"Removed candidate #{candidate_id} from poll #{poll_id}"
    )

    return jsonify({"message": "Candidate removed from poll successfully."}), 200


@admin_bp.route("/candidates", methods=["POST"])
@admin_required()
def create_candidate():
    """Admin manually creates an official candidate profile."""
    admin = get_current_user()
    data = request.get_json() or {}

    full_name = str(data.get("full_name", "")).strip()
    raw_username = data.get("username", "")
    raw_phone = data.get("phone", "")
    biography = str(data.get("biography", "")).strip()
    qualifications = str(data.get("qualifications", "")).strip()
    profile_image = data.get("profile_image", "")
    status = data.get("status", "approved")

    if not full_name or not biography:
        return jsonify({"error": "Full name and biography are required."}), 400

    username = normalize_username(raw_username) if raw_username else None
    phone = normalize_phone(raw_phone) if raw_phone else None

    cand = Candidate(
        full_name=full_name,
        username=username,
        phone=phone,
        biography=biography,
        qualifications=qualifications or None,
        profile_image=profile_image or None,
        status=status
    )
    db.session.add(cand)
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="CREATE_CANDIDATE",
        target_type="Candidate",
        target_id=cand.id,
        details=f"Created candidate: {full_name} ({status})"
    )

    return jsonify({"message": "Candidate created successfully.", "candidate": cand.to_dict(include_private=True)}), 201


@admin_bp.route("/candidates/<int:candidate_id>", methods=["PUT"])
@admin_required()
def update_candidate(candidate_id):
    """Admin updates candidate profile details."""
    admin = get_current_user()
    cand = Candidate.query.get_or_404(candidate_id)
    data = request.get_json() or {}

    if "full_name" in data and data["full_name"].strip():
        cand.full_name = data["full_name"].strip()
    if "biography" in data:
        cand.biography = data["biography"].strip()
    if "qualifications" in data:
        cand.qualifications = data["qualifications"].strip()
    if "profile_image" in data:
        cand.profile_image = data["profile_image"]
    if "status" in data:
        cand.status = data["status"]

    cand.updated_at = utc_now()
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="UPDATE_CANDIDATE",
        target_type="Candidate",
        target_id=cand.id,
        details=f"Updated candidate #{cand.id}: {cand.full_name}"
    )

    return jsonify({"message": "Candidate updated successfully.", "candidate": cand.to_dict(include_private=True)}), 200


@admin_bp.route("/voters", methods=["GET"])
@admin_required()
def get_voters_list():
    """Admin lists all registered voters and candidate accounts."""
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    search = request.args.get("search")

    query = User.query

    if search:
        s = f"%{search.strip()}%"
        query = query.filter((User.username.ilike(s)) | (User.full_name.ilike(s)) | (User.phone.ilike(s)))

    pagination = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    users_data = []
    for u in pagination.items:
        udata = u.to_dict(include_private=True)
        udata["votes_count"] = u.votes.count()
        users_data.append(udata)

    return jsonify({
        "voters": users_data,
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page
    }), 200


@admin_bp.route("/voters/<int:user_id>/toggle-status", methods=["POST"])
@admin_required()
def toggle_voter_status(user_id):
    """Admin enables or disables a voter account."""
    admin = get_current_user()
    user = User.query.get_or_404(user_id)

    if user.id == admin.id:
        return jsonify({"error": "Administrators cannot disable their own accounts."}), 400

    user.is_active = not user.is_active
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="TOGGLE_USER_STATUS",
        target_type="User",
        target_id=user.id,
        details=f"Toggled user @{user.username} active status to {user.is_active}"
    )

    return jsonify({
        "message": f"User account {'activated' if user.is_active else 'deactivated'} successfully.",
        "user": user.to_dict(include_private=True)
    }), 200


@admin_bp.route("/audit-logs", methods=["GET"])
@admin_required()
def get_audit_logs():
    """Admin view of all audit logs."""
    logs = AdminAuditLog.query.order_by(AdminAuditLog.created_at.desc()).limit(100).all()
    return jsonify({"audit_logs": [log.to_dict() for log in logs]}), 200


@admin_bp.route("/reports/overview", methods=["GET"])
@admin_required()
def get_reports_overview():
    """Comprehensive analytical report for administrative evaluation."""
    total_polls = Poll.query.count()
    total_votes = Vote.query.count()
    total_users = User.query.count()
    voters_count = User.query.filter_by(role="voter").count()
    candidates_count = Candidate.query.count()

    # Category breakdown
    polls = Poll.query.all()
    cat_distribution = {}
    for p in polls:
        cat_distribution[p.category] = cat_distribution.get(p.category, 0) + 1

    return jsonify({
        "summary": {
            "total_polls": total_polls,
            "total_votes_cast": total_votes,
            "total_users": total_users,
            "voters_count": voters_count,
            "candidates_count": candidates_count,
            "average_votes_per_poll": round(total_votes / total_polls, 1) if total_polls > 0 else 0
        },
        "category_distribution": [
            {"category": k, "count": v} for k, v in cat_distribution.items()
        ]
    }), 200
