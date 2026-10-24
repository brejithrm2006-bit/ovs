# VotePulse — Complete Online Voting Platform

> **"Your Voice. Your Choice. Your Future."**

VotePulse is a complete, modern, full-stack online voting and ballot governance platform engineered with **React.js**, **Python Flask REST APIs**, **PostgreSQL**, **Docker**, and **Kubernetes**.

The platform is designed for institutional and community elections—such as campus student unions, departmental councils, faculty leadership ballots, and civic initiatives.

---

## 📑 Table of Contents

1. [Key Features by Role](#-key-features-by-role)
2. [Technology Stack](#-technology-stack)
3. [Project Structure](#-project-structure)
4. [Authentication & Initial Credentials](#-authentication--initial-credentials)
5. [Local Development Setup](#-local-development-setup)
6. [Windows One-Click Launcher](#-windows-one-click-launcher)
7. [Docker & Docker Compose Deployment](#-docker--docker-compose-deployment)
8. [Kubernetes & Minikube Deployment](#-kubernetes--minikube-deployment)
9. [REST API Documentation](#-rest-api-documentation)
10. [Cybersecurity & Integrity Model](#-cybersecurity--integrity-model)
11. [Troubleshooting](#-troubleshooting)

---

## 🌟 Key Features by Role

### 1. 🗳️ Voters (`/voter`)
- **Zero-Email Privacy:** Register and log in using verified usernames, phone numbers, and secure passwords.
- **Ballot Exploration:** Search and filter active and upcoming elections by domain category.
- **One-Ballot Atomic Commitment:** Real-time database transaction ensures strictly one vote per voter per poll with duplicate prevention.
- **Personal Audit Trail:** Review chronological receipts of all ballots cast and candidates supported.
- **Live Visual Analytics:** View live Recharts bar charts, pie share distribution, and vote percentages.

### 2. 🏅 Candidates (`/candidate`)
- **Direct Candidacy Application:** Apply to existing active elections with a campaign vision statement and qualifications.
- **Grassroots Poll Proposals:** Propose new community polls with multiple suggested candidate nominees and consent declarations.
- **Status Tracking:** Real-time dashboard showing application states (`pending`, `approved`, `rejected`, `more_info`) with administrator feedback notes.

### 3. 🛡️ Administrators (`/admin`)
- **Single-App Protected Portal:** Seamlessly accessed via `/admin` through the same unified React interface.
- **Executive Intelligence Dashboard:** Real-time charts of participation volume, poll lifecycle distribution, and platform KPIs.
- **Full Poll Lifecycle Management:** Create, stage, publish, close, and archive official ballots.
- **Candidate Oversight:** Approve or reject applications, curate candidates per ballot, and suspend accounts.
- **News Publishing System:** Author, edit, and publish official election announcements and town hall notices.
- **Contact Message Center:** Review incoming inquiries indexed by phone number and record resolution notes.
- **Tamper-Evident Audit Logs:** Permanent record of every administrative decision with IP addresses and timestamps.

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Lucide React icons, Recharts visualization, CSS3 Custom Properties |
| **Backend** | Python 3.11+, Flask REST APIs, Flask-JWT-Extended, Flask-SQLAlchemy ORM, Flask-CORS, Werkzeug |
| **Database** | PostgreSQL 16 (Production & Docker), SQLite (Zero-friction local dev fallback) |
| **DevOps** | Docker, Docker Compose, Nginx (Alpine), Kubernetes, Minikube |

---

## 📂 Project Structure

```
VotePulse/
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── admin/               # Admin dashboard and management screens
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminPolls.jsx
│   │   │   ├── AdminCandidates.jsx
│   │   │   ├── AdminApplications.jsx
│   │   │   ├── AdminPollRequests.jsx
│   │   │   ├── AdminVoters.jsx
│   │   │   ├── AdminResults.jsx
│   │   │   ├── AdminNews.jsx
│   │   │   ├── AdminMessages.jsx
│   │   │   ├── AdminReports.jsx
│   │   │   └── AdminSettings.jsx
│   │   ├── candidate/           # Candidate dashboard & proposal modals
│   │   │   ├── CandidateDashboard.jsx
│   │   │   ├── ApplyPollModal.jsx
│   │   │   └── RequestPollModal.jsx
│   │   ├── voter/               # Voter dashboard & vote history
│   │   │   └── VoterDashboard.jsx
│   │   ├── components/          # Reusable UI (Navbar, Footer, Modal, Toast, Cards)
│   │   ├── layouts/             # MainLayout, DashboardLayout
│   │   ├── pages/               # HomePage, LoginPage, RegisterPage, Polls, News, etc.
│   │   ├── services/            # api.js API client with JWT interception
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── hooks/               # usePolling custom hook
│   │   ├── utils/               # formatters.js
│   │   ├── App.jsx              # React router config
│   │   ├── main.jsx
│   │   └── index.css            # VotePulse design system
│   ├── Dockerfile               # Multi-stage React + Nginx build
│   ├── nginx.conf               # SPA routing & API reverse proxy
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── routes/                  # Modular Blueprint endpoints
│   │   ├── auth.py
│   │   ├── public.py
│   │   ├── polls.py
│   │   ├── candidates.py
│   │   ├── applications.py
│   │   ├── poll_requests.py
│   │   ├── news.py
│   │   ├── notifications.py
│   │   ├── contact.py
│   │   └── admin.py
│   ├── services/
│   │   └── audit_service.py     # Persistent administrative audit logging
│   ├── utils/
│   │   ├── auth_helpers.py      # Role verification & in-app alerts
│   │   └── validators.py        # Username & phone sanitization
│   ├── app.py                   # Flask entry point & health checks
│   ├── config.py                # Environment configuration
│   ├── extensions.py            # SQLAlchemy, JWT, CORS instances
│   ├── models.py                # Normalized relational SQLAlchemy schema
│   ├── seed.py                  # Idempotent demo database seeder
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/
│   └── init.sql                 # PostgreSQL DDL schema for Docker & Kubernetes
│
├── kubernetes/                  # Declarative Minikube & K8s manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── postgres-pvc.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   └── frontend-service.yaml
│
├── docker-compose.yml           # Multi-container local orchestration
├── .env.example                 # Config template
├── .gitignore
├── run.bat                      # Windows one-click launcher
└── README.md
```

---

## 🔑 Authentication & Initial Credentials

VotePulse strictly uses **Username**, **Phone Number**, and **Password**. No email verification or mailto links exist anywhere.

### Seeded Demonstration Accounts

| Role | Username | Phone Number | Password | Target Dashboard |
|---|---|---|---|---|
| **Administrator** | `brmovs` | `7025919468` | `qw1988ab1988` | `/admin` |
| **Candidate** | `alex_rivera` | `5550101111` | `VoterPass123` | `/candidate` |
| **Candidate** | `marcus_vance` | `5550102222` | `VoterPass123` | `/candidate` |
| **Voter** | `jordan_lee` | `5550107777` | `VoterPass123` | `/voter` |
| **Voter** | `priya_sharma` | `5550108888` | `VoterPass123` | `/voter` |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Git

### 2. Backend Setup
```bash
cd VotePulse/backend

# Create and activate Python virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database seeder (initializes SQLite or PostgreSQL and seeds demo data)
python seed.py

# Start Flask backend server (port 5000)
python app.py
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd VotePulse/frontend

# Install npm dependencies
npm install

# Start Vite dev server with proxy to backend
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## ⚡ Windows One-Click Launcher

On Windows systems, simply double-click:
```bat
run.bat
```
This batch script automatically validates Python, prepares the virtual environment, seeds the database, verifies Node modules, launches the backend and frontend concurrently, and opens your browser.

---

## 🐳 Docker & Docker Compose Deployment

Run the entire full-stack platform (PostgreSQL database, Flask backend, and React/Nginx frontend) in isolated Docker containers:

```bash
cd VotePulse

# Build images and start all containers in background
docker compose up --build -d

# Check service status
docker compose ps
```

The application will be accessible at:
- **Frontend & App:** [http://localhost:8080](http://localhost:8080)
- **Backend API Direct:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **PostgreSQL Database:** `localhost:5432`

To shut down:
```bash
docker compose down -v
```

---

## ☸️ Kubernetes & Minikube Deployment Guide

Deploy VotePulse to a local Minikube cluster using declarative YAML manifests.

### Step-by-Step Execution:

#### 1. Start Minikube
```bash
minikube start --driver=docker --cpus=2 --memory=4096
```

#### 2. Point Terminal to Minikube's Docker Daemon
```bash
# On Linux/macOS:
eval $(minikube docker-env)

# On Windows PowerShell:
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

#### 3. Build Docker Images Locally inside Minikube
```bash
cd VotePulse
docker build -t votepulse-backend:latest ./backend
docker build -t votepulse-frontend:latest ./frontend
```

#### 4. Apply Kubernetes Manifests in Order
```bash
# Create Namespace
kubectl apply -f kubernetes/namespace.yaml

# Apply ConfigMaps and Secrets
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secret.yaml

# Deploy Persistent Storage and PostgreSQL
kubectl apply -f kubernetes/postgres-pvc.yaml
kubectl apply -f kubernetes/postgres-deployment.yaml
kubectl apply -f kubernetes/postgres-service.yaml

# Wait for PostgreSQL pod to be Ready
kubectl wait --namespace=votepulse --for=condition=ready pod -l app=postgres --timeout=90s

# Deploy Backend REST API
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml

# Wait for Backend pod to be Ready
kubectl wait --namespace=votepulse --for=condition=ready pod -l app=backend --timeout=90s

# Seed the Kubernetes database
BACKEND_POD=$(kubectl get pod -n votepulse -l app=backend -o jsonpath="{.items[0].metadata.name}")
kubectl exec -n votepulse $BACKEND_POD -- python seed.py

# Deploy Frontend Replicas & Service
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml
```

#### 5. Access the Website
```bash
minikube service frontend -n votepulse --url
```
Open the returned URL in your browser (or access `http://<minikube-ip>:30080`).

#### 6. Inspect Pods, Services, and Deployments
```bash
kubectl get all -n votepulse
```

#### 7. Scale Frontend Replicas Horizontally
```bash
kubectl scale deployment frontend --replicas=4 -n votepulse
kubectl get pods -n votepulse -l app=frontend
```

#### 8. View Logs
```bash
# Backend logs:
kubectl logs -n votepulse -l app=backend -f

# Frontend access logs:
kubectl logs -n votepulse -l app=frontend -f
```

#### 9. Test Pod Self-Healing
Delete a pod and observe Kubernetes immediately spinning up a replacement:
```bash
kubectl delete pod -n votepulse $(kubectl get pod -n votepulse -l app=frontend -o jsonpath="{.items[0].metadata.name}")
kubectl get pods -n votepulse -l app=frontend
```

#### 10. Clean Teardown
```bash
kubectl delete -f kubernetes/
kubectl delete namespace votepulse
```

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create new voter or candidate account.
- `POST /api/auth/login` - Authenticate via username or phone number.
- `POST /api/auth/logout` - Discard session token.
- `GET  /api/auth/me` - Fetch authenticated user profile & unread counts.
- `PUT  /api/auth/profile` - Update display name, profile image, or password.

### Public Endpoints (`/api/public`)
- `GET /api/public/stats` - Live platform stats directly from database.
- `GET /api/public/polls/trending` - Top polls sorted by vote count.
- `GET /api/public/polls/active` - Active polls with category filtering.
- `GET /api/public/news` - Published announcements list.
- `GET /api/public/news/<slug>` - Single article details.
- `GET /api/public/activity` - Live public event updates.

### Polls & Voting (`/api/polls`)
- `GET  /api/polls` - Paginated poll listing with filters.
- `GET  /api/polls/<id>` - Poll details and candidate nominees.
- `POST /api/polls/<id>/vote` - Cast atomic vote (enforces 1 vote per voter).
- `GET  /api/polls/<id>/results` - Tabulated results adhering to visibility rules.
- `GET  /api/polls/voter/history` - User's historical vote receipts.

### Candidate Portals (`/api/candidate`)
- `POST /api/candidate/applications` - Apply to become a candidate in a poll.
- `GET  /api/candidate/applications` - View current user's submitted applications.
- `POST /api/candidate/poll-requests` - Propose a new community poll.
- `GET  /api/candidate/poll-requests` - View user's submitted poll requests.

### Administrator Console (`/api/admin`)
- `GET  /api/admin/overview` - Platform KPIs, charts, and recent audit logs.
- `POST /api/admin/polls` - Create official ballot.
- `PUT  /api/admin/polls/<id>` - Update ballot configuration.
- `POST /api/admin/polls/<id>/publish` - Publish poll to active.
- `POST /api/admin/polls/<id>/close` - Explicitly close voting.
- `POST /api/admin/polls/<id>/archive` - Archive historical poll.
- `POST /api/admin/polls/<id>/candidates` - Assign candidate nominee to poll.
- `GET  /api/admin/applications` - Review prospective candidate applications.
- `POST /api/admin/applications/<id>/approve` - Approve application.
- `POST /api/admin/applications/<id>/reject` - Reject application.
- `GET  /api/admin/poll-requests` - Inspect proposed community ballots.
- `POST /api/admin/poll-requests/<id>/approve` - Approve and stage as draft poll.
- `GET  /api/admin/voters` - Inspect registered accounts and toggle active state.
- `GET  /api/admin/audit-logs` - Inspect system audit logs.

### Contact & Notifications
- `POST /api/contact` - Submit message (Name, Phone, Subject, Message).
- `GET  /api/contact/admin/contact-messages` - Admin view of messages.
- `GET  /api/notifications` - User in-app notifications.
- `POST /api/notifications/<id>/read` - Mark notification as read.

---

## 🔒 Cybersecurity & Integrity Model

1. **Transactional One-Vote Guarantee:**
   A unique composite constraint on `(poll_id, voter_id)` in the `votes` table guarantees that race conditions and replay attacks are rejected at the database engine level.
2. **Zero-Email Privacy:**
   No email addresses are captured, verified, or stored. Accounts are indexed purely by username and normalized phone numbers.
3. **Role-Based Authorization:**
   Every protected administrative endpoint enforces server-side role validation through custom `@admin_required()` decorators. Hiding buttons in the UI is never relied upon for security.
4. **Audit Logging:**
   All administrative actions are logged with actor usernames, timestamps, target entities, and IP addresses in the `admin_audit_logs` table.
5. **Dynamic Server-Side State Validation:**
   Ballots cannot be cast for polls that have expired or are in draft/closed/archived states. Server UTC time is enforced regardless of client system clock manipulation.

---

## 🛠️ Troubleshooting

- **Port Conflict on 5000 or 3000:**
  If port 5000 is used on your machine, set `PORT=5001` in `.env` and update `vite.config.js` proxy.
- **PowerShell Execution Policy Error:**
  If `npm` or script execution fails in PowerShell, run `cmd /c npm run dev` or run PowerShell with `-ExecutionPolicy Bypass`.
- **Database Connection Reset:**
  If using PostgreSQL in Docker, ensure the health check passes before launching the backend (`service_healthy` condition in `docker-compose.yml`).
- **Initial Admin Not Appearing:**
  Run `python backend/seed.py` to ensure initial admin credentials (`brmovs` / `7025919468`) are committed.
