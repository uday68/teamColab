# PulseCollab – Next-Gen Team Collaboration Suite

PulseCollab is an experimental, full-stack collaboration platform designed for the Odoo Hackathon.  
It blends **project & task management**, **real-time communication**, **AI assistance**, and **team well-being analytics** into one unified workspace.

---

## 🚀 Vision
> Build a single hub where teams can **plan, discuss, create, and stay healthy** while keeping projects on track—without switching apps.

---

## ✨ Core Features

| Category            | Capabilities |
|----------------------|--------------|
| **Projects & Tasks** | Project boards, tasks, subtasks, progress %, deadlines, attachments |
| **Messaging & Calls**| Channels, threads, reactions, video calls, live presence, screen share |
| **Documents & Whiteboard** | Collaborative editor, versioning, whiteboard sketching, inline comments |
| **Risk & Analytics** | Risk register, mitigation actions, KPI snapshots, project dashboards |
| **Integrations**    | Webhooks, 3rd-party connectors (Drive, Jira, GitHub, etc.) |
| **User Well-Being** | Overtime detection, workload heatmap, wellness tips, break reminders |
| **Customization**   | Themes, greeting messages, custom backgrounds, personal settings |
| **Security**        | RBAC, encryption keys, audit logs, ACL on files/docs |
| **AI Assistance**   | Smart suggestions, task summaries, risk prediction (prototype) |
| **Advanced Ops**    | Multi-tenant (orgs), feature flags, A/B testing, event analytics |

---

## 🏗️ Tech Stack

| Layer        | Choice |
|--------------|--------|
| **Frontend** | React + Vite, Tailwind CSS, Zustand/Redux, WebRTC (calls), Slate.js / TipTap (editor), Konva.js (whiteboard) |
| **Backend**  | FastAPI (Python) or Odoo module backend, REST + WebSocket APIs, Celery for async tasks |
| **Database** | PostgreSQL 15+ (JSONB, tsvector search, partitions) |
| **Auth**     | OAuth2 / JWT, optional SSO |
| **Real-Time**| WebSockets (Starlette/Socket.IO) |
| **AI Layer** | OpenAI/LLM API wrappers, HuggingFace models (where allowed) |
| **Infra**    | Docker Compose, Traefik / Nginx, optional Redis (caching, sessions) |
| **DevOps**   | GitHub Actions, pre-commit hooks, pytest, Alembic migrations |

---

## 📂 Database Overview

PulseCollab schema covers:

- **Core Tables**: `users`, `projects`, `tasks`, `channels`, `messages`, `documents`, `meetings`
- **Modern Extensions**: `user_presence`, `resource_acl`, `ai_suggestions`, `analytics_events`, `kpi_snapshots`, `feature_flags`, `ab_experiments`, `encryption_keys`, `tenants`, `notification_settings`, `user_sessions`
- **Search**: `search_index` with Postgres full-text indexing

See [`schema.sql`](schema.sql) for the complete DDL.

---

## 🔧 Local Setup

```bash
# 1. Clone
git clone https://github.com/your-org/pulsecollab.git
cd pulsecollab

# 2. Start services
docker compose up -d

# 3. Apply migrations
alembic upgrade head

# 4. Run backend
uvicorn app.main:app --reload

# 5. Run frontend
cd frontend && npm install && npm run dev
