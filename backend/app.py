import os
from flask import Flask, jsonify, send_from_directory
from config import Config
from extensions import db, jwt, cors
from models import User
from routes.auth import auth_bp
from routes.public import public_bp
from routes.polls import polls_bp
from routes.candidates import candidates_bp
from routes.applications import applications_bp
from routes.poll_requests import poll_requests_bp
from routes.news import news_bp
from routes.notifications import notifications_bp
from routes.contact import contact_bp
from routes.admin import admin_bp

def create_app(config_class=Config):
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config_class)

    # Ensure upload directory exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True
    )

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(public_bp, url_prefix="/api/public")
    app.register_blueprint(polls_bp, url_prefix="/api/polls")
    app.register_blueprint(candidates_bp, url_prefix="/api/candidates")
    app.register_blueprint(applications_bp, url_prefix="/api")
    app.register_blueprint(poll_requests_bp, url_prefix="/api")
    app.register_blueprint(news_bp, url_prefix="/api")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(contact_bp, url_prefix="/api/contact")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # Static uploads handler
    @app.route("/api/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # Health check endpoints for Kubernetes and Docker probes
    @app.route("/health")
    @app.route("/api/health")
    def health_check():
        try:
            # Ping database connection
            db.session.execute(db.text("SELECT 1"))
            return jsonify({
                "status": "healthy",
                "service": "VotePulse Backend API",
                "database": "connected"
            }), 200
        except Exception as e:
            return jsonify({
                "status": "degraded",
                "database": "unreachable",
                "error": str(e)
            }), 503

    # Error Handlers
    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({"error": "Missing or invalid authorization header"}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(callback):
        return jsonify({"error": "Signature verification failed or token is malformed"}), 401

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return jsonify({"error": "Authentication token has expired. Please log in again."}), 401

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Requested resource was not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500

    # Auto-initialize database tables and seed administrator if missing
    with app.app_context():
        db.create_all()
        ensure_initial_admin(app)

    return app


def ensure_initial_admin(app):
    """Ensures the primary administrator account exists from environment configuration."""
    admin_user = User.query.filter_by(role="admin").first()
    if not admin_user:
        admin_username = app.config["INITIAL_ADMIN_USERNAME"]
        admin_phone = app.config["INITIAL_ADMIN_PHONE"]
        admin_pass = app.config["INITIAL_ADMIN_PASSWORD"]
        admin_name = app.config["INITIAL_ADMIN_NAME"]

        admin = User(
            username=admin_username,
            phone=admin_phone,
            full_name=admin_name,
            role="admin",
            is_active=True
        )
        admin.set_password(admin_pass)
        db.session.add(admin)
        db.session.commit()
        print(f"[VotePulse] Initial Administrator initialized: @{admin_username} (Phone: {admin_phone})")


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
