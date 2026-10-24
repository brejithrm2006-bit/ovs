import unittest
import json
import time
from app import create_app
from extensions import db
from models import User, Poll, Candidate, PollCandidate, Vote, CandidateApplication, PollNews

class VotePulseIntegrationTest(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()

    def test_01_public_stats(self):
        """Test public stats endpoint."""
        res = self.client.get('/api/public/stats')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('total_voters', data)
        self.assertIn('active_polls', data)
        self.assertIn('total_votes_cast', data)
        print("[PASS] Public stats API verified: total voters =", data['total_voters'])

    def test_02_admin_login(self):
        """Test administrator login with specified credentials."""
        res = self.client.post('/api/auth/login', json={
            'identifier': 'brmovs',
            'password': 'qw1988ab1988'
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['user']['role'], 'admin')
        self.assertIn('access_token', data)
        print("[PASS] Administrator authentication verified for @brmovs")

    def test_03_voter_registration_and_login(self):
        """Test voter registration with phone & username (no email)."""
        ts = int(time.time() * 1000)
        username = f"voter_{ts}"
        phone = f"555{ts % 10000000:07d}"

        # Register
        reg_res = self.client.post('/api/auth/register', json={
            'full_name': 'Test Integration Voter',
            'username': username,
            'phone': phone,
            'password': 'StrongPass123',
            'confirm_password': 'StrongPass123',
            'role': 'voter'
        })
        if reg_res.status_code != 201:
            print("Register failed:", reg_res.status_code, reg_res.get_json())
        self.assertEqual(reg_res.status_code, 201)
        reg_data = reg_res.get_json()
        self.assertEqual(reg_data['user']['username'], username)
        token = reg_data['access_token']

        # Login with Phone
        login_res = self.client.post('/api/auth/login', json={
            'identifier': phone,
            'password': 'StrongPass123'
        })
        self.assertEqual(login_res.status_code, 200)
        self.assertEqual(login_res.get_json()['user']['phone'], phone)
        print(f"[PASS] Voter registration and phone-based login verified for @{username}")

    def test_04_voting_and_duplicate_prevention(self):
        """Test casting a vote and verify duplicate vote rejection."""
        ts = int(time.time() * 1000)
        username = f"voter_dup_{ts}"
        phone = f"556{ts % 10000000:07d}"

        # Register new voter
        reg_res = self.client.post('/api/auth/register', json={
            'full_name': 'Duplicate Prevention Voter',
            'username': username,
            'phone': phone,
            'password': 'StrongPass123',
            'confirm_password': 'StrongPass123',
            'role': 'voter'
        })
        if reg_res.status_code != 201:
            print("Voter register in test_04 failed:", reg_res.status_code, reg_res.get_json())
        self.assertEqual(reg_res.status_code, 201)
        voter_token = reg_res.get_json()['access_token']
        headers = {'Authorization': f'Bearer {voter_token}'}

        # Find active poll with candidates
        active_poll = Poll.query.filter_by(status='active').first()
        self.assertIsNotNone(active_poll, "Active poll required for vote test")
        candidate = active_poll.poll_candidates[0].candidate

        # 1. First Vote: Should succeed
        vote_res1 = self.client.post(f'/api/polls/{active_poll.id}/vote', json={
            'candidate_id': candidate.id
        }, headers=headers)
        if vote_res1.status_code != 201:
            print("Vote 1 failed:", vote_res1.status_code, vote_res1.get_json())
        self.assertEqual(vote_res1.status_code, 201)
        print(f"[PASS] Vote cast successfully for candidate '{candidate.full_name}' in poll '{active_poll.title}'")

        # 2. Second Duplicate Vote: Must be rejected with 409
        vote_res2 = self.client.post(f'/api/polls/{active_poll.id}/vote', json={
            'candidate_id': candidate.id
        }, headers=headers)
        self.assertEqual(vote_res2.status_code, 409)
        self.assertIn("already cast your vote", vote_res2.get_json()['error'])
        print("[PASS] Duplicate vote successfully intercepted and rejected with HTTP 409 Conflict!")

    def test_05_candidate_application_flow(self):
        """Test candidate application submission and admin approval flow."""
        ts = int(time.time() * 1000)
        username = f"cand_app_{ts}"
        phone = f"557{ts % 10000000:07d}"

        # Register applicant
        reg_res = self.client.post('/api/auth/register', json={
            'full_name': 'Prospective Candidate',
            'username': username,
            'phone': phone,
            'password': 'StrongPass123',
            'confirm_password': 'StrongPass123',
            'role': 'candidate'
        })
        if reg_res.status_code != 201:
            print("Register in test_05 failed:", reg_res.status_code, reg_res.get_json())
        self.assertEqual(reg_res.status_code, 201)
        applicant_token = reg_res.get_json()['access_token']
        app_headers = {'Authorization': f'Bearer {applicant_token}'}

        active_poll = Poll.query.filter_by(status='active').first()

        # Submit application
        sub_res = self.client.post('/api/candidate/applications', json={
            'poll_id': active_poll.id,
            'introduction': 'Leading sustainable student life initiatives.',
            'reason': 'To represent underrepresented academic departments.',
            'supporting_info': 'Former student council delegate.'
        }, headers=app_headers)
        self.assertEqual(sub_res.status_code, 201)
        app_id = sub_res.get_json()['application']['id']
        print(f"[PASS] Candidate application #{app_id} submitted for poll '{active_poll.title}'")

        # Admin Login
        admin_login = self.client.post('/api/auth/login', json={
            'identifier': 'brmovs',
            'password': 'qw1988ab1988'
        })
        admin_token = admin_login.get_json()['access_token']
        admin_headers = {'Authorization': f'Bearer {admin_token}'}

        # Admin Approves Application
        appr_res = self.client.post(f'/api/admin/applications/{app_id}/approve', json={
            'admin_notes': 'Credentials and eligibility verified.'
        }, headers=admin_headers)
        self.assertEqual(appr_res.status_code, 200)
        self.assertEqual(appr_res.get_json()['application']['status'], 'approved')
        print(f"[PASS] Admin approval verified: applicant now assigned to poll #{active_poll.id}")

if __name__ == '__main__':
    unittest.main()
