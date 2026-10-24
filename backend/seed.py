from datetime import datetime, timezone, timedelta
from app import create_app
from extensions import db
from models import (
    User, Poll, Candidate, PollCandidate, Vote,
    CandidateApplication, PollRequest, ProposedCandidate,
    PollNews, ContactMessage, Notification, AdminAuditLog
)
from utils.validators import slugify

def seed_database():
    app = create_app()
    with app.app_context():
        print("[VotePulse] Initializing database tables...")
        db.create_all()

        # Check if already seeded (by checking poll count)
        if Poll.query.count() >= 4:
            print("[VotePulse] Database already contains sample data. Skipping re-seed.")
            return

        now = datetime.now(timezone.utc)
        print("[VotePulse] Seeding demo users, candidates, polls, and news...")

        # 1. Admin Account (Loaded from config or defaults)
        admin = User.query.filter_by(role="admin").first()
        if not admin:
            admin = User(
                username=app.config["INITIAL_ADMIN_USERNAME"],
                phone=app.config["INITIAL_ADMIN_PHONE"],
                full_name=app.config["INITIAL_ADMIN_NAME"],
                role="admin",
                is_active=True
            )
            admin.set_password(app.config["INITIAL_ADMIN_PASSWORD"])
            db.session.add(admin)
            db.session.flush()

        # 2. Demo Voters & Candidate Users
        demo_users = [
            {"username": "alex_rivera", "phone": "5550101111", "name": "Alex Rivera", "role": "candidate", "pw": "VoterPass123"},
            {"username": "marcus_vance", "phone": "5550102222", "name": "Marcus Vance", "role": "candidate", "pw": "VoterPass123"},
            {"username": "maya_lin", "phone": "5550103333", "name": "Dr. Maya Lin", "role": "candidate", "pw": "VoterPass123"},
            {"username": "carlos_cruz", "phone": "5550104444", "name": "Carlos Santana-Cruz", "role": "candidate", "pw": "VoterPass123"},
            {"username": "amina_mansoor", "phone": "5550105555", "name": "Amina Al-Mansoor", "role": "candidate", "pw": "VoterPass123"},
            {"username": "david_kim", "phone": "5550106666", "name": "David Kim", "role": "candidate", "pw": "VoterPass123"},
            {"username": "jordan_lee", "phone": "5550107777", "name": "Jordan Lee", "role": "voter", "pw": "VoterPass123"},
            {"username": "priya_sharma", "phone": "5550108888", "name": "Priya Sharma", "role": "voter", "pw": "VoterPass123"},
            {"username": "leo_martinez", "phone": "5550109999", "name": "Leo Martinez", "role": "voter", "pw": "VoterPass123"},
            {"username": "sara_chen", "phone": "5550110000", "name": "Sara Chen", "role": "voter", "pw": "VoterPass123"},
        ]

        created_users = {}
        for uinfo in demo_users:
            u = User.query.filter_by(username=uinfo["username"]).first()
            if not u:
                u = User(
                    username=uinfo["username"],
                    phone=uinfo["phone"],
                    full_name=uinfo["name"],
                    role=uinfo["role"],
                    is_active=True
                )
                u.set_password(uinfo["pw"])
                db.session.add(u)
                db.session.flush()
            created_users[uinfo["username"]] = u

        # 3. Candidates Profiles
        candidate_data = [
            {
                "user_key": "alex_rivera",
                "full_name": "Alex Rivera",
                "username": "alex_rivera",
                "phone": "5550101111",
                "profile_image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
                "biography": "Senior environmental engineer focusing on campus solar micro-grids and zero-waste logistics.",
                "qualifications": "B.S. Environmental Engineering, Green Campus Initiative President (2024-2025).",
                "status": "approved"
            },
            {
                "user_key": "marcus_vance",
                "full_name": "Marcus Vance",
                "username": "marcus_vance",
                "phone": "5550102222",
                "profile_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                "biography": "Civic tech researcher building ethical AI transparency tools and open peer-governance frameworks.",
                "qualifications": "M.S. Computer Science candidate, Lead author on algorithmic fairness benchmarks.",
                "status": "approved"
            },
            {
                "user_key": "maya_lin",
                "full_name": "Dr. Maya Lin",
                "username": "maya_lin",
                "phone": "5550103333",
                "profile_image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
                "biography": "Associate Professor advocating for cross-disciplinary research funding and graduate student stipends.",
                "qualifications": "Ph.D. in Cognitive Science, Faculty Senate Committee Co-Chair.",
                "status": "approved"
            },
            {
                "user_key": "carlos_cruz",
                "full_name": "Carlos Santana-Cruz",
                "username": "carlos_cruz",
                "phone": "5550104444",
                "profile_image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
                "biography": "Collegiate track athlete and student health representative advocating for 24/7 fitness facility access.",
                "qualifications": "Captain of Track & Field Team, Student Wellness Ambassador.",
                "status": "approved"
            },
            {
                "user_key": "amina_mansoor",
                "full_name": "Amina Al-Mansoor",
                "username": "amina_mansoor",
                "phone": "5550105555",
                "profile_image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
                "biography": "Smart campus systems researcher working on electric bus route optimization and pedestrian accessibility.",
                "qualifications": "Urban Planning Fellow, Transportation Council Student Delegate.",
                "status": "approved"
            },
            {
                "user_key": "david_kim",
                "full_name": "David Kim",
                "username": "david_kim",
                "phone": "5550106666",
                "profile_image": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
                "biography": "Visual arts organizer and founder of the Annual Independent Creator Showcase.",
                "qualifications": "Fine Arts Council Representative, Curator of Student Media Gallery.",
                "status": "approved"
            }
        ]

        created_candidates = []
        for cd in candidate_data:
            c = Candidate.query.filter_by(full_name=cd["full_name"]).first()
            if not c:
                user_obj = created_users.get(cd["user_key"])
                c = Candidate(
                    user_id=user_obj.id if user_obj else None,
                    full_name=cd["full_name"],
                    username=cd["username"],
                    phone=cd["phone"],
                    profile_image=cd["profile_image"],
                    biography=cd["biography"],
                    qualifications=cd["qualifications"],
                    status=cd["status"]
                )
                db.session.add(c)
                db.session.flush()
            created_candidates.append(c)

        # 4. Official Polls
        polls_data = [
            {
                "title": "Campus Green Energy & Carbon Neutrality Plan 2026",
                "category": "Technology",
                "description": "Vote on the primary clean energy initiative for the upcoming academic year. The chosen strategy will receive prioritized endowment funding for solar deployment and campus microgrids.",
                "banner_image": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=80",
                "start_date": now - timedelta(days=2),
                "end_date": now + timedelta(days=5),
                "status": "active",
                "results_visibility": "public",
                "candidates": [created_candidates[0], created_candidates[1], created_candidates[4]]
            },
            {
                "title": "Annual University Student Council Presidential Election",
                "category": "Student Activities",
                "description": "Select the executive representative who will lead the Student Governance Body, allocate campus club budgets, and interface with university administration.",
                "banner_image": "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80",
                "start_date": now - timedelta(days=1),
                "end_date": now + timedelta(days=6),
                "status": "active",
                "results_visibility": "public",
                "candidates": [created_candidates[0], created_candidates[2], created_candidates[3]]
            },
            {
                "title": "Next-Gen Campus AI Research Lab Director",
                "category": "Innovation",
                "description": "Community ballot for selecting the academic direction and faculty leadership of the newly endowed Artificial Intelligence and Ethics Research Center.",
                "banner_image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
                "start_date": now - timedelta(days=3),
                "end_date": now + timedelta(days=4),
                "status": "active",
                "results_visibility": "public",
                "candidates": [created_candidates[1], created_candidates[2]]
            },
            {
                "title": "Inter-Collegiate Sports Complex Modernization Plan",
                "category": "Sports",
                "description": "Review and vote on the athletic facilities redesign, Olympic standard running track resurfacing, and universal gym access schedule.",
                "banner_image": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80",
                "start_date": now + timedelta(days=2),
                "end_date": now + timedelta(days=10),
                "status": "upcoming",
                "results_visibility": "public",
                "candidates": [created_candidates[3]]
            },
            {
                "title": "Spring Festival Headline Theme & Cultural Direction",
                "category": "Entertainment",
                "description": "Decide the creative thematic direction and guest keynote keynote for the upcoming annual Spring Multi-Cultural Arts Showcase.",
                "banner_image": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
                "start_date": now - timedelta(days=10),
                "end_date": now - timedelta(days=2),
                "status": "closed",
                "results_visibility": "public",
                "candidates": [created_candidates[5], created_candidates[0]]
            }
        ]

        created_polls = []
        for pdata in polls_data:
            base_s = slugify(pdata["title"])
            p = Poll.query.filter_by(slug=base_s).first()
            if not p:
                p = Poll(
                    title=pdata["title"],
                    slug=base_s,
                    description=pdata["description"],
                    category=pdata["category"],
                    banner_image=pdata["banner_image"],
                    start_date=pdata["start_date"],
                    end_date=pdata["end_date"],
                    status=pdata["status"],
                    results_visibility=pdata["results_visibility"],
                    created_by_id=admin.id
                )
                db.session.add(p)
                db.session.flush()

                # Add candidates to poll
                for idx, cand in enumerate(pdata["candidates"]):
                    pc = PollCandidate(
                        poll_id=p.id,
                        candidate_id=cand.id,
                        display_order=idx + 1,
                        statement=f"Committed to advancing our shared vision in {p.category}."
                    )
                    db.session.add(pc)

            created_polls.append(p)

        db.session.commit()

        # 5. Seed Realistic Verified Votes for Active & Closed Polls
        voter_pool = list(created_users.values())
        if created_polls:
            active_p1 = created_polls[0]
            cands_p1 = [pc.candidate_id for pc in active_p1.poll_candidates]
            if len(cands_p1) >= 2:
                # Cast votes from voters 0 through 7
                for i, v in enumerate(voter_pool[:8]):
                    selected_cand = cands_p1[i % len(cands_p1)]
                    if not Vote.query.filter_by(poll_id=active_p1.id, voter_id=v.id).first():
                        db.session.add(Vote(poll_id=active_p1.id, candidate_id=selected_cand, voter_id=v.id))

            active_p2 = created_polls[1]
            cands_p2 = [pc.candidate_id for pc in active_p2.poll_candidates]
            if len(cands_p2) >= 2:
                for i, v in enumerate(voter_pool[:6]):
                    selected_cand = cands_p2[(i + 1) % len(cands_p2)]
                    if not Vote.query.filter_by(poll_id=active_p2.id, voter_id=v.id).first():
                        db.session.add(Vote(poll_id=active_p2.id, candidate_id=selected_cand, voter_id=v.id))

            closed_p = created_polls[4]
            cands_p_closed = [pc.candidate_id for pc in closed_p.poll_candidates]
            if cands_p_closed:
                for i, v in enumerate(voter_pool[:9]):
                    selected_cand = cands_p_closed[i % len(cands_p_closed)]
                    if not Vote.query.filter_by(poll_id=closed_p.id, voter_id=v.id).first():
                        db.session.add(Vote(poll_id=closed_p.id, candidate_id=selected_cand, voter_id=v.id))

        # 6. Sample News Articles
        news_items = [
            {
                "headline": "Voting Now Live for 2026 Campus Sustainability Plan",
                "summary": "Eligible voters across all departments are invited to review proposals and cast their ballots before Friday midnight.",
                "content": "The annual Campus Sustainability Ballot is officially open. The winning blueprint will dictate solar canopy installations across South Campus parking structures and accelerate clean energy milestones by three years.",
                "cover_image": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
                "related_poll_id": created_polls[0].id if created_polls else None
            },
            {
                "headline": "Record Turnout Recorded in Student Council Presidential Race",
                "summary": "Participation rates have surpassed historical records within the first 24 hours of polls opening.",
                "content": "Over 1,200 unique verified ballots were recorded during the initial opening phase. Election administrators remind all participants that each registered user holds strictly one non-transferable ballot.",
                "cover_image": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80",
                "related_poll_id": created_polls[1].id if len(created_polls) > 1 else None
            },
            {
                "headline": "Athletic Modernization Forum Scheduled Ahead of Voting Period",
                "summary": "Join the live town hall to review engineering drafts for the new multipurpose indoor gymnasium and track.",
                "content": "Before the Sports Complex Modernization poll officially opens next week, a public community discussion will address construction timetables, equipment upgrades, and universal accessibility accommodations.",
                "cover_image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
                "related_poll_id": created_polls[3].id if len(created_polls) > 3 else None
            }
        ]

        for nitem in news_items:
            base_s = slugify(nitem["headline"])
            if not PollNews.query.filter_by(slug=base_s).first():
                news_rec = PollNews(
                    headline=nitem["headline"],
                    slug=base_s,
                    summary=nitem["summary"],
                    content=nitem["content"],
                    cover_image=nitem["cover_image"],
                    related_poll_id=nitem["related_poll_id"],
                    is_published=True,
                    published_at=now - timedelta(hours=12),
                    created_by_id=admin.id
                )
                db.session.add(news_rec)

        # 7. Sample Candidate Applications
        if len(created_polls) > 0:
            app1 = CandidateApplication.query.filter_by(applicant_id=created_users["jordan_lee"].id, poll_id=created_polls[0].id).first()
            if not app1:
                db.session.add(CandidateApplication(
                    applicant_id=created_users["jordan_lee"].id,
                    poll_id=created_polls[0].id,
                    applicant_username="jordan_lee",
                    applicant_phone="5550107777",
                    introduction="Engineering sophomore enthusiastic about battery storage solutions.",
                    reason="I want to ensure student residential halls have direct input on clean energy priority zones.",
                    supporting_info="Led High School Science Olympiad Renewable Energy team.",
                    status="pending"
                ))

        # 8. Sample Poll Request with Proposed Candidates
        req1 = PollRequest.query.filter_by(proposed_title="Student Mental Health & 24-Hour Counseling Resource Ballot").first()
        if not req1:
            req1 = PollRequest(
                requester_id=created_users["priya_sharma"].id,
                proposed_title="Student Mental Health & 24-Hour Counseling Resource Ballot",
                description="Community poll to measure demand and allocate funds for round-the-clock telehealth counseling and therapy animals on campus.",
                category="Community",
                reason="Mental health resources need substantial expansion prior to midterm exam periods.",
                suggested_start_date=now + timedelta(days=5),
                suggested_end_date=now + timedelta(days=12),
                status="pending"
            )
            db.session.add(req1)
            db.session.flush()

            db.session.add(ProposedCandidate(
                poll_request_id=req1.id,
                full_name="Samantha Ray",
                username="samantha_ray",
                phone="5550198888",
                introduction="Peer counseling mentor and psychology senior.",
                status="proposed"
            ))

        # 9. Sample Contact Messages
        if ContactMessage.query.count() == 0:
            db.session.add(ContactMessage(
                name="Professor Michael Hayes",
                phone="5550182233",
                subject="Inquiry regarding faculty division poll setup",
                message="Hello VotePulse team, we are interested in coordinating our upcoming academic departmental election through VotePulse. Please share information regarding eligibility restriction options.",
                is_read=False
            ))
            db.session.add(ContactMessage(
                name="Tanya Robinson",
                phone="5550194455",
                subject="Volunteer inquiry for candidate debates",
                message="I would like to assist the candidate outreach committee for the upcoming Student Council voting cycle.",
                is_read=True,
                admin_notes="Forwarded to campus student activities coordinator."
            ))

        # 10. Audit log entries
        db.session.add(AdminAuditLog(
            admin_id=admin.id,
            admin_username=admin.username,
            action="SYSTEM_INITIALIZATION",
            target_type="System",
            target_id="0",
            details="VotePulse platform seeded with initial administrator and demonstration polls."
        ))

        db.session.commit()
        print("[VotePulse] Database successfully seeded with demo polls, candidates, voters, news, and audit logs!")

if __name__ == "__main__":
    seed_database()
