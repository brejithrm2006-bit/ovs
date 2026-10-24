from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Poll, Candidate, PollCandidate, Vote, User
from utils.auth_helpers import get_current_user, notify_user

polls_bp = Blueprint("polls", __name__)

def utc_now():
    return datetime.now(timezone.utc)

@polls_bp.route("", methods=["GET"])
def get_polls():
    """Lists polls with optional category, status, and search filters."""
    category = request.args.get("category")
    status = request.args.get("status")
    search = request.args.get("search")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 12))

    query = Poll.query

    # Hide draft or archived polls from public users unless explicitly queried by admin
    current_user = get_current_user()
    if not current_user or current_user.role != "admin":
        query = query.filter(Poll.status.in_(["active", "upcoming", "closed"]))

    if category and category.lower() != "all":
        query = query.filter(Poll.category.ilike(category))

    if status and status.lower() != "all":
        query = query.filter(Poll.status == status)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Poll.title.ilike(s)) | (Poll.description.ilike(s)))

    pagination = query.order_by(Poll.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "polls": [p.to_dict() for p in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page
    }), 200


@polls_bp.route("/<int:poll_id>", methods=["GET"])
def get_poll_detail(poll_id):
    """Returns detailed poll information and candidate list."""
    poll = Poll.query.get_or_404(poll_id)
    current_user = get_current_user()

    # Draft polls visible only to admin
    if poll.status == "draft" and (not current_user or current_user.role != "admin"):
        return jsonify({"error": "Poll is not published yet."}), 404

    data = poll.to_dict(include_candidates=True)

    # If user is logged in, attach whether they already voted
    data["has_voted"] = False
    data["user_voted_candidate_id"] = None
    if current_user:
        vote = Vote.query.filter_by(poll_id=poll.id, voter_id=current_user.id).first()
        if vote:
            data["has_voted"] = True
            data["user_voted_candidate_id"] = vote.candidate_id

    return jsonify({"poll": data}), 200


@polls_bp.route("/<int:poll_id>/vote", methods=["POST"])
@jwt_required()
def cast_vote(poll_id):
    """Cast an atomic vote for a candidate in an active poll."""
    current_user = get_current_user()
    if not current_user or not current_user.is_active:
        return jsonify({"error": "User account is invalid or inactive."}), 403

    poll = Poll.query.get_or_404(poll_id)
    now = utc_now()
    dynamic_status = poll.compute_dynamic_status()

    # Strict poll state validation
    if dynamic_status != "active":
        if dynamic_status == "upcoming":
            return jsonify({"error": "Voting has not started yet for this poll."}), 400
        elif dynamic_status in ["closed", "archived"]:
            return jsonify({"error": "This poll is closed. Additional votes are rejected."}), 400
        else:
            return jsonify({"error": f"Poll is in '{dynamic_status}' state and not accepting votes."}), 400

    # Ensure current timestamp is within bounds
    start = poll.start_date
    if start and start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    end = poll.end_date
    if end and end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)

    if start and now < start:
        return jsonify({"error": "Voting period has not commenced."}), 400
    if end and now > end:
        return jsonify({"error": "Voting period has expired."}), 400

    data = request.get_json() or {}
    candidate_id = data.get("candidate_id")

    if not candidate_id:
        return jsonify({"error": "candidate_id is required."}), 400

    # Verify candidate is participating in this poll
    poll_candidate = PollCandidate.query.filter_by(poll_id=poll.id, candidate_id=candidate_id).first()
    if not poll_candidate:
        return jsonify({"error": "Selected candidate is not participating in this poll."}), 400

    candidate = Candidate.query.get(candidate_id)
    if not candidate or candidate.status != "approved":
        return jsonify({"error": "Selected candidate is not in an approved status."}), 400

    # Pre-check for duplicate vote
    existing_vote = Vote.query.filter_by(poll_id=poll.id, voter_id=current_user.id).first()
    if existing_vote:
        return jsonify({"error": "You have already cast your vote in this poll. Duplicate votes are strictly prohibited."}), 409

    # Atomic insert with unique constraint handling
    try:
        new_vote = Vote(
            poll_id=poll.id,
            candidate_id=candidate_id,
            voter_id=current_user.id,
            created_at=now
        )
        db.session.add(new_vote)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "You have already cast your vote in this poll."}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An unexpected error occurred while recording your vote."}), 500

    # Notify voter
    notify_user(
        current_user.id,
        "Vote Recorded Successfully",
        f"Your vote for '{candidate.full_name}' in poll '{poll.title}' was securely recorded.",
        notif_type="success",
        link=f"/polls/{poll.id}"
    )

    return jsonify({
        "message": "Your vote has been cast and recorded successfully.",
        "poll_id": poll.id,
        "candidate_id": candidate_id,
        "voted_at": now.isoformat()
    }), 201


@polls_bp.route("/<int:poll_id>/results", methods=["GET"])
def get_poll_results(poll_id):
    """Calculates and returns live results if visibility rules permit."""
    poll = Poll.query.get_or_404(poll_id)
    current_user = get_current_user()
    is_admin = current_user and current_user.role == "admin"
    dynamic_status = poll.compute_dynamic_status()

    # Enforce result visibility rules
    if poll.results_visibility == "admin_only" and not is_admin:
        return jsonify({"error": "Results for this poll are restricted to administrators."}), 403

    if poll.results_visibility == "hidden_until_close" and dynamic_status != "closed" and not is_admin:
        return jsonify({
            "error": "Results are hidden until this poll concludes.",
            "visibility": poll.results_visibility,
            "status": dynamic_status,
            "closing_date": poll.end_date.isoformat()
        }), 403

    # Calculate live vote counts per candidate from actual Vote records
    total_votes = Vote.query.filter_by(poll_id=poll.id).count()

    candidates_results = []
    for pc in sorted(poll.poll_candidates, key=lambda x: x.display_order):
        c = pc.candidate
        if not c:
            continue
        c_votes = Vote.query.filter_by(poll_id=poll.id, candidate_id=c.id).count()
        percentage = round((c_votes / total_votes * 100), 2) if total_votes > 0 else 0.0

        candidates_results.append({
            "candidate_id": c.id,
            "full_name": c.full_name,
            "username": c.username,
            "profile_image": c.profile_image,
            "votes": c_votes,
            "percentage": percentage
        })

    # Sort candidates by vote count descending
    candidates_results.sort(key=lambda x: x["votes"], reverse=True)

    return jsonify({
        "poll_id": poll.id,
        "title": poll.title,
        "status": dynamic_status,
        "results_visibility": poll.results_visibility,
        "total_valid_votes": total_votes,
        "candidate_results": candidates_results,
        "last_updated": utc_now().isoformat()
    }), 200


@polls_bp.route("/voter/history", methods=["GET"])
@jwt_required()
def get_voter_history():
    """Returns polls where authenticated user participated."""
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    votes = Vote.query.filter_by(voter_id=current_user.id).order_by(Vote.created_at.desc()).all()
    history = []
    for v in votes:
        p = v.poll
        c = v.candidate
        history.append({
            "vote_id": v.id,
            "poll_id": p.id if p else None,
            "poll_title": p.title if p else "Unknown Poll",
            "poll_status": p.compute_dynamic_status() if p else "unknown",
            "candidate_id": c.id if c else None,
            "candidate_name": c.full_name if c else "Unknown Candidate",
            "voted_at": v.created_at.isoformat()
        })

    return jsonify({"history": history}), 200
