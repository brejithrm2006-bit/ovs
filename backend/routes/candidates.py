from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Candidate, PollCandidate, Poll
from utils.auth_helpers import get_current_user

candidates_bp = Blueprint("candidates", __name__)

@candidates_bp.route("", methods=["GET"])
def get_candidates():
    """Lists candidates. Public sees approved; admin can filter by status."""
    current_user = get_current_user()
    is_admin = current_user and current_user.role == "admin"

    status = request.args.get("status")
    query = Candidate.query

    if is_admin and status:
        if status.lower() != "all":
            query = query.filter_by(status=status)
    else:
        query = query.filter_by(status="approved")

    search = request.args.get("search")
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Candidate.full_name.ilike(s)) | (Candidate.biography.ilike(s)))

    candidates = query.order_by(Candidate.full_name.asc()).all()

    return jsonify({
        "candidates": [c.to_dict(include_private=is_admin) for c in candidates]
    }), 200


@candidates_bp.route("/<int:candidate_id>", methods=["GET"])
def get_candidate_detail(candidate_id):
    """Returns candidate profile and history of participating polls."""
    current_user = get_current_user()
    is_admin = current_user and current_user.role == "admin"

    candidate = Candidate.query.get_or_404(candidate_id)
    if candidate.status != "approved" and not is_admin:
        return jsonify({"error": "Candidate profile is not publicly available."}), 404

    data = candidate.to_dict(include_private=is_admin)

    # Fetch participating polls
    participations = PollCandidate.query.filter_by(candidate_id=candidate.id).all()
    polls_history = []
    for p_cand in participations:
        p = p_cand.poll
        if p and (p.status != "draft" or is_admin):
            polls_history.append({
                "poll_id": p.id,
                "poll_title": p.title,
                "category": p.category,
                "status": p.compute_dynamic_status(),
                "statement": p_cand.statement,
                "start_date": p.start_date.isoformat(),
                "end_date": p.end_date.isoformat()
            })

    data["polls"] = polls_history
    return jsonify({"candidate": data}), 200
