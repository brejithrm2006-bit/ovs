from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from extensions import db
from models import User, Poll, Candidate, Vote, PollNews, PollCandidate

public_bp = Blueprint("public", __name__)

def utc_now():
    return datetime.now(timezone.utc)

@public_bp.route("/stats", methods=["GET"])
def get_public_stats():
    """Live platform statistics calculated directly from the database."""
    total_voters = User.query.filter(User.role.in_(["voter", "candidate"])).count()
    active_polls = Poll.query.filter_by(status="active").count()
    registered_candidates = Candidate.query.filter_by(status="approved").count()
    total_votes = Vote.query.count()

    return jsonify({
        "total_voters": total_voters,
        "active_polls": active_polls,
        "registered_candidates": registered_candidates,
        "total_votes_cast": total_votes,
        "updated_at": utc_now().isoformat()
    }), 200


@public_bp.route("/polls/trending", methods=["GET"])
def get_trending_polls():
    """Returns top active polls sorted by vote count."""
    category = request.args.get("category")
    query = Poll.query.filter(Poll.status.in_(["active", "upcoming"]))
    
    if category and category.lower() != "all":
        query = query.filter(Poll.category.ilike(category))

    polls = query.all()
    # Sort by total votes descending
    sorted_polls = sorted(polls, key=lambda p: p.votes.count(), reverse=True)
    limit = int(request.args.get("limit", 6))
    
    return jsonify({
        "polls": [p.to_dict() for p in sorted_polls[:limit]]
    }), 200


@public_bp.route("/polls/active", methods=["GET"])
def get_active_polls():
    """Returns currently active or upcoming polls with category and search filter."""
    category = request.args.get("category")
    search = request.args.get("search")
    query = Poll.query.filter(Poll.status.in_(["active", "upcoming"]))

    if category and category.lower() != "all":
        query = query.filter(Poll.category.ilike(category))

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter((Poll.title.ilike(search_fmt)) | (Poll.description.ilike(search_fmt)))

    polls = query.order_by(Poll.start_date.desc()).all()
    return jsonify({
        "polls": [p.to_dict() for p in polls]
    }), 200


@public_bp.route("/news", methods=["GET"])
def get_public_news():
    """Returns published news stories with pagination."""
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 6))

    query = PollNews.query.filter_by(is_published=True).order_by(PollNews.published_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "news": [item.to_dict() for item in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page
    }), 200


@public_bp.route("/news/<slug>", methods=["GET"])
def get_news_by_slug(slug):
    """Returns details for a specific published news article."""
    article = PollNews.query.filter_by(slug=slug, is_published=True).first()
    if not article:
        return jsonify({"error": "Article not found"}), 404

    return jsonify({"article": article.to_dict()}), 200


@public_bp.route("/activity", methods=["GET"])
def get_recent_activity():
    """Recent public updates on the platform without exposing private data."""
    recent_polls = Poll.query.filter(Poll.status.in_(["active", "upcoming"])).order_by(Poll.created_at.desc()).limit(4).all()
    recent_news = PollNews.query.filter_by(is_published=True).order_by(PollNews.published_at.desc()).limit(3).all()

    activities = []
    for p in recent_polls:
        activities.append({
            "id": f"poll-{p.id}",
            "type": "poll",
            "title": f"Poll Open: {p.title}",
            "category": p.category,
            "timestamp": p.created_at.isoformat(),
            "link": f"/polls/{p.id}"
        })

    for n in recent_news:
        activities.append({
            "id": f"news-{n.id}",
            "type": "news",
            "title": f"News: {n.headline}",
            "category": "Announcement",
            "timestamp": n.published_at.isoformat(),
            "link": f"/news/{n.slug}"
        })

    # Sort combined activities by timestamp desc
    activities.sort(key=lambda x: x["timestamp"], reverse=True)

    return jsonify({"activities": activities[:6]}), 200
