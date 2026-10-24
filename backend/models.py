from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db

def utc_now():
    return datetime.now(timezone.utc)

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    profile_image = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(20), nullable=False, default="voter")  # 'voter', 'candidate', 'admin'
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    votes = db.relationship("Vote", backref="voter", lazy="dynamic", cascade="all, delete-orphan")
    candidate_profile = db.relationship("Candidate", backref="user", uselist=False, cascade="all, delete-orphan")
    applications = db.relationship("CandidateApplication", backref="applicant", lazy="dynamic", cascade="all, delete-orphan")
    poll_requests = db.relationship("PollRequest", backref="requester", lazy="dynamic", cascade="all, delete-orphan")
    notifications = db.relationship("Notification", backref="user", lazy="dynamic", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_private=False):
        data = {
            "id": self.id,
            "username": self.username,
            "full_name": self.full_name,
            "role": self.role,
            "profile_image": self.profile_image,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_private:
            data["phone"] = self.phone
        return data


class Poll(db.Model):
    __tablename__ = "polls"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(220), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    banner_image = db.Column(db.String(255), nullable=True)
    start_date = db.Column(db.DateTime(timezone=True), nullable=False)
    end_date = db.Column(db.DateTime(timezone=True), nullable=False)
    status = db.Column(db.String(20), default="draft", nullable=False)  # 'draft', 'upcoming', 'active', 'closed', 'archived'
    results_visibility = db.Column(db.String(30), default="public", nullable=False)  # 'public', 'hidden_until_close', 'admin_only'
    max_candidates = db.Column(db.Integer, default=20, nullable=False)
    eligibility_rules = db.Column(db.Text, nullable=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    poll_candidates = db.relationship("PollCandidate", backref="poll", cascade="all, delete-orphan", lazy="joined")
    votes = db.relationship("Vote", backref="poll", lazy="dynamic", cascade="all, delete-orphan")
    applications = db.relationship("CandidateApplication", backref="poll", lazy="dynamic", cascade="all, delete-orphan")
    news_articles = db.relationship("PollNews", backref="related_poll", lazy="dynamic")

    def compute_dynamic_status(self):
        now = utc_now()
        if self.status in ["archived", "draft"]:
            return self.status
        if self.status == "closed":
            return "closed"
        
        start = self.start_date
        if start and start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        end = self.end_date
        if end and end.tzinfo is None:
            end = end.replace(tzinfo=timezone.utc)

        if start and now < start:
            return "upcoming"
        if start and end and start <= now <= end:
            return "active"
        if end and now > end:
            return "closed"
        return self.status

    def to_dict(self, include_candidates=True, viewer_role=None):
        computed_status = self.compute_dynamic_status()
        data = {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "description": self.description,
            "category": self.category,
            "banner_image": self.banner_image,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "status": computed_status,
            "db_status": self.status,
            "results_visibility": self.results_visibility,
            "max_candidates": self.max_candidates,
            "eligibility_rules": self.eligibility_rules,
            "candidate_count": len(self.poll_candidates),
            "total_votes": self.votes.count(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_candidates:
            data["candidates"] = [pc.to_dict() for pc in sorted(self.poll_candidates, key=lambda x: x.display_order)]
        return data


class Candidate(db.Model):
    __tablename__ = "candidates"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, unique=True)
    full_name = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(64), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    profile_image = db.Column(db.String(255), nullable=True)
    biography = db.Column(db.Text, nullable=False)
    qualifications = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default="approved", nullable=False)  # 'pending', 'approved', 'rejected', 'suspended'
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    participations = db.relationship("PollCandidate", backref="candidate", cascade="all, delete-orphan", lazy="dynamic")
    votes = db.relationship("Vote", backref="candidate", lazy="dynamic")

    def to_dict(self, include_private=False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.full_name,
            "username": self.username,
            "profile_image": self.profile_image,
            "biography": self.biography,
            "qualifications": self.qualifications,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_private:
            data["phone"] = self.phone
        return data


class PollCandidate(db.Model):
    __tablename__ = "poll_candidates"

    id = db.Column(db.Integer, primary_key=True)
    poll_id = db.Column(db.Integer, db.ForeignKey("polls.id", ondelete="CASCADE"), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    statement = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        db.UniqueConstraint("poll_id", "candidate_id", name="uq_poll_candidate"),
    )

    def to_dict(self):
        c = self.candidate
        return {
            "id": self.id,
            "poll_id": self.poll_id,
            "candidate_id": self.candidate_id,
            "display_order": self.display_order,
            "statement": self.statement,
            "full_name": c.full_name if c else "Unknown Candidate",
            "username": c.username if c else None,
            "profile_image": c.profile_image if c else None,
            "biography": c.biography if c else None,
            "qualifications": c.qualifications if c else None,
            "status": c.status if c else "unknown",
        }


class Vote(db.Model):
    __tablename__ = "votes"

    id = db.Column(db.Integer, primary_key=True)
    poll_id = db.Column(db.Integer, db.ForeignKey("polls.id", ondelete="CASCADE"), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    voter_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        db.UniqueConstraint("poll_id", "voter_id", name="uq_poll_voter_vote"),
    )


class CandidateApplication(db.Model):
    __tablename__ = "candidate_applications"

    id = db.Column(db.Integer, primary_key=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    poll_id = db.Column(db.Integer, db.ForeignKey("polls.id", ondelete="CASCADE"), nullable=False)
    applicant_username = db.Column(db.String(64), nullable=False)
    applicant_phone = db.Column(db.String(20), nullable=False)
    introduction = db.Column(db.Text, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    supporting_info = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default="pending", nullable=False)  # 'pending', 'approved', 'rejected', 'more_info'
    admin_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    __table_args__ = (
        db.UniqueConstraint("applicant_id", "poll_id", name="uq_applicant_poll"),
    )

    def to_dict(self, is_admin=False):
        data = {
            "id": self.id,
            "applicant_id": self.applicant_id,
            "poll_id": self.poll_id,
            "poll_title": self.poll.title if self.poll else "Unknown Poll",
            "applicant_username": self.applicant_username,
            "introduction": self.introduction,
            "reason": self.reason,
            "supporting_info": self.supporting_info,
            "status": self.status,
            "admin_notes": self.admin_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if is_admin:
            data["applicant_phone"] = self.applicant_phone
            if self.applicant:
                data["applicant_full_name"] = self.applicant.full_name
        return data


class PollRequest(db.Model):
    __tablename__ = "poll_requests"

    id = db.Column(db.Integer, primary_key=True)
    requester_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    proposed_title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    suggested_start_date = db.Column(db.DateTime(timezone=True), nullable=True)
    suggested_end_date = db.Column(db.DateTime(timezone=True), nullable=True)
    status = db.Column(db.String(20), default="pending", nullable=False)  # 'pending', 'approved', 'rejected', 'more_info'
    admin_notes = db.Column(db.Text, nullable=True)
    created_poll_id = db.Column(db.Integer, db.ForeignKey("polls.id"), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    proposed_candidates = db.relationship("ProposedCandidate", backref="poll_request", cascade="all, delete-orphan", lazy="joined")

    def to_dict(self, is_admin=False):
        data = {
            "id": self.id,
            "requester_id": self.requester_id,
            "requester_username": self.requester.username if self.requester else "Unknown",
            "proposed_title": self.proposed_title,
            "description": self.description,
            "category": self.category,
            "reason": self.reason,
            "suggested_start_date": self.suggested_start_date.isoformat() if self.suggested_start_date else None,
            "suggested_end_date": self.suggested_end_date.isoformat() if self.suggested_end_date else None,
            "status": self.status,
            "admin_notes": self.admin_notes,
            "created_poll_id": self.created_poll_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "proposed_candidates": [pc.to_dict(is_admin=is_admin) for pc in self.proposed_candidates],
        }
        if is_admin and self.requester:
            data["requester_phone"] = self.requester.phone
            data["requester_full_name"] = self.requester.full_name
        return data


class ProposedCandidate(db.Model):
    __tablename__ = "proposed_candidates"

    id = db.Column(db.Integer, primary_key=True)
    poll_request_id = db.Column(db.Integer, db.ForeignKey("poll_requests.id", ondelete="CASCADE"), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(64), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    introduction = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default="proposed", nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)

    def to_dict(self, is_admin=False):
        data = {
            "id": self.id,
            "poll_request_id": self.poll_request_id,
            "full_name": self.full_name,
            "username": self.username,
            "introduction": self.introduction,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if is_admin:
            data["phone"] = self.phone
        return data


class PollNews(db.Model):
    __tablename__ = "poll_news"

    id = db.Column(db.Integer, primary_key=True)
    headline = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(275), unique=True, nullable=False, index=True)
    summary = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=False)
    cover_image = db.Column(db.String(255), nullable=True)
    related_poll_id = db.Column(db.Integer, db.ForeignKey("polls.id", ondelete="SET NULL"), nullable=True)
    is_published = db.Column(db.Boolean, default=True, nullable=False)
    published_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "headline": self.headline,
            "slug": self.slug,
            "summary": self.summary,
            "content": self.content,
            "cover_image": self.cover_image,
            "related_poll_id": self.related_poll_id,
            "related_poll_title": self.related_poll.title if self.related_poll else None,
            "is_published": self.is_published,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), default="info", nullable=False)  # 'info', 'success', 'warning', 'action'
    link = db.Column(db.String(255), nullable=True)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "link": self.link,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ContactMessage(db.Model):
    __tablename__ = "contact_messages"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    admin_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "subject": self.subject,
            "message": self.message,
            "is_read": self.is_read,
            "admin_notes": self.admin_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class AdminAuditLog(db.Model):
    __tablename__ = "admin_audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    admin_username = db.Column(db.String(64), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    target_type = db.Column(db.String(50), nullable=False)
    target_id = db.Column(db.String(50), nullable=True)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "admin_username": self.admin_username,
            "action": self.action,
            "target_type": self.target_type,
            "target_id": self.target_id,
            "details": self.details,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
