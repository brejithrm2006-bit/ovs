from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from extensions import db
from models import PollNews, Poll
from utils.auth_helpers import get_current_user, admin_required
from utils.validators import slugify
from services.audit_service import log_admin_action

news_bp = Blueprint("news", __name__)

def utc_now():
    return datetime.now(timezone.utc)

@news_bp.route("/admin/news", methods=["GET"])
@admin_required()
def admin_get_all_news():
    """Admin view: lists all news stories including un-published drafts."""
    news = PollNews.query.order_by(PollNews.created_at.desc()).all()
    return jsonify({
        "news": [item.to_dict() for item in news]
    }), 200


@news_bp.route("/admin/news", methods=["POST"])
@admin_required()
def admin_create_news():
    """Admin creates a new poll news article."""
    admin = get_current_user()
    data = request.get_json() or {}
    headline = str(data.get("headline", "")).strip()
    summary = str(data.get("summary", "")).strip()
    content = str(data.get("content", "")).strip()
    cover_image = data.get("cover_image", "")
    related_poll_id = data.get("related_poll_id")
    is_published = data.get("is_published", True)

    if not headline or not summary or not content:
        return jsonify({"error": "Headline, summary, and content are required."}), 400

    base_slug = slugify(headline)
    unique_slug = f"{base_slug}-{int(utc_now().timestamp())}"

    article = PollNews(
        headline=headline,
        slug=unique_slug,
        summary=summary,
        content=content,
        cover_image=cover_image or None,
        related_poll_id=related_poll_id if related_poll_id else None,
        is_published=bool(is_published),
        published_at=utc_now(),
        created_by_id=admin.id
    )
    db.session.add(article)
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="CREATE_NEWS",
        target_type="PollNews",
        target_id=article.id,
        details=f"Created news article: {headline}"
    )

    return jsonify({
        "message": "News article created successfully.",
        "article": article.to_dict()
    }), 201


@news_bp.route("/admin/news/<int:news_id>", methods=["PUT"])
@admin_required()
def admin_update_news(news_id):
    """Admin updates an existing news article."""
    admin = get_current_user()
    article = PollNews.query.get_or_404(news_id)
    data = request.get_json() or {}

    if "headline" in data and data["headline"].strip():
        article.headline = data["headline"].strip()
    if "summary" in data:
        article.summary = data["summary"].strip()
    if "content" in data:
        article.content = data["content"].strip()
    if "cover_image" in data:
        article.cover_image = data["cover_image"]
    if "related_poll_id" in data:
        article.related_poll_id = data["related_poll_id"] if data["related_poll_id"] else None
    if "is_published" in data:
        article.is_published = bool(data["is_published"])

    article.updated_at = utc_now()
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="UPDATE_NEWS",
        target_type="PollNews",
        target_id=article.id,
        details=f"Updated article #{article.id}: {article.headline}"
    )

    return jsonify({
        "message": "News article updated successfully.",
        "article": article.to_dict()
    }), 200


@news_bp.route("/admin/news/<int:news_id>", methods=["DELETE"])
@admin_required()
def admin_delete_news(news_id):
    """Admin deletes a news article."""
    admin = get_current_user()
    article = PollNews.query.get_or_404(news_id)
    article_title = article.headline

    db.session.delete(article)
    db.session.commit()

    log_admin_action(
        admin=admin,
        action="DELETE_NEWS",
        target_type="PollNews",
        target_id=news_id,
        details=f"Deleted news article #{news_id}: {article_title}"
    )

    return jsonify({"message": "News article deleted successfully."}), 200
