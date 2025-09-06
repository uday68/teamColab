# 🟦 PulseCollab Suite

> One workspace. All the essentials: real‑time chat, tasks, meetings (roadmap), analytics, and team wellness insights—without tool‑switch fatigue.

![Status](https://img.shields.io/badge/status-pre--MVP-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)
![Tech](https://img.shields.io/badge/stack-Node.js%20%7C%20React%20%7C%20Postgres%20%7C%20WebSockets-purple)

---

## ✨ What Is PulseCollab?

PulseCollab is a modern collaboration platform for small and growing teams who need:
- Real‑time sync across tasks and conversations
- Actionable insights (velocity, blockers, burnout signals)
- Lightweight action requests & AI-assisted workflows (roadmap)
- A foundation that can scale into enterprise‑grade extensibility

Instead of stitching together Slack + Trello/Jira + Zoom + Confluence + dashboards, PulseCollab unifies execution and context.

---

## 🧭 Core Philosophy

| Pillar | Meaning | Outcome |
|--------|---------|---------|
| Reduce Friction | Chat ↔ Tasks ↔ Meetings ↔ Insights share a common graph | Less context switching |
| Human-Centric | Wellness + workload signals surfaced ethically | Sustainable velocity |
| Real-Time by Default | WebSockets for presence & updates | Fast feedback loops |
| Extendable | Integrations & (future) plugin layer | Adaptable workspace |
| Augmented by AI | Summaries, intent → action, risk detection | Smarter, not just busier |

---

## ✅ Feature Overview (Current & Roadmap)

| Category | MVP | Near-Term | Later |
|----------|-----|-----------|-------|
| Auth & Workspaces | ✅ Multi-tenant, roles (basic) | Invitations, role matrix | SSO, SCIM |
| Tasks & Projects | ✅ CRUD, Kanban, ordering | Calendar view, dependencies | Gantt / timeline |
| Real-Time Chat | ✅ Channels / threads | File previews, search | Federation / bridging |
| Priority Requests | ✅ Manual actionable tag | Auto-close on trigger | SLA + escalation |
| Meetings / Calls | Placeholder | WebRTC basic | Whiteboard, AI notes |
| AI (taskTalk bot) | Prototype (create task) | Summaries, intent refinement | Predictive risk |
| Analytics | Basic activity model | Task aging, throughput charts | Heatmaps, anomaly detection |
| Wellness Signals | Design phase | Overtime nudges | Team capacity modeling |
| Integrations | GitHub (planned) | Google Drive, Jira import | Marketplace |
| Theming | Light/dark + accent | User backgrounds | Brand packs |
| Notifications | In-app feed | Email digests | Multi-channel rules |

Legend: ✅ = implemented / in progress

---

## 🏗 Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React + TypeScript + Vite | Fast DX, typed components |
| UI | TailwindCSS + Framer Motion | Scalable styles + micro-interactions |
| State | React Query (+ local store) | Server-state precision |
| Backend | Node.js (Express/Fastify candidate) | Familiar + async friendly |
| DB | PostgreSQL (SQL + JSONB) | Reliable, hybrid flexibility |
| Realtime | Socket.IO (WebSockets) | Event-driven UX |
| Caching / Queue (roadmap) | Redis + BullMQ | Presence, job processing |
| Container | Docker (multi-stage) | Reproducible builds |
| Deploy (MVP) | Render / Railway / Vercel | Speed over ops burden |
| CI/CD | GitHub Actions | Automated pipelines |
| Observability | Sentry + Prometheus + Grafana | Trace + metrics + errors |
| AI Layer (roadmap) | External LLM API | Fast iteration before custom |

---

## 🧬 High-Level Architecture

```mermaid
flowchart LR
  subgraph Client[Frontend SPA]
    A[React UI] --> B[State & Query Layer]
    B --> C[WebSocket Client]
  end

  C <--> S[(Socket.IO Layer)]
  B -->|REST/HTTPS| API[Backend Service]

  subgraph Backend
    API --> DB[(PostgreSQL)]
    API --> Cache[(Redis - roadmap)]
    API --> Jobs[(BullMQ Workers - roadmap)]
  end

  Jobs --> DB
  Jobs --> AI[(AI / LLM API - roadmap)]
```

---

## 🗄 Database (Initial Schema Sketch)

```sql
-- Core (illustrative only)
users(id, email, name, avatar_url, timezone, created_at)
workspaces(id, name, plan_tier, created_at)
workspace_members(workspace_id, user_id, role, invite_status, created_at)

projects(id, workspace_id, name, description, status, lead_user_id, created_at)
tasks(id, project_id, workspace_id, title, description, status, priority, assignee_user_id,
      due_date, order_index, metadata jsonb, parent_task_id, created_by, created_at, updated_at)

messages(id, workspace_id, channel_id, user_id, body, rich_payload jsonb, thread_root_id, created_at)
message_requests(id, message_id, requester_user_id, target_user_id, status, auto_close_condition jsonb, created_at)

activity_logs(id, workspace_id, actor_user_id, entity_type, entity_id, action, diff jsonb, created_at)
integrations(id, workspace_id, provider, config jsonb, status, created_at)
notifications(id, user_id, type, payload jsonb, read_at, created_at)
```

Indexing priorities:
- tasks(workspace_id, project_id, status)
- messages(workspace_id, channel_id, created_at)
- activity_logs(workspace_id, created_at DESC)

---

## 🚀 Quick Start (Development)

### 1. Prerequisites
- Node.js >= 18
- Docker (for Postgres & optional Redis)
- pnpm or npm

### 2. Clone
```bash
git clone https://github.com/uday68/pulse-collab-suite.git
cd pulse-collab-suite
```

### 3. Environment
Create `.env` (or `.env.local`) based on below:

```bash
# Server
PORT=4000
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/pulse
JWT_SECRET=replace_me_dev
# (Optional) Redis
REDIS_URL=redis://localhost:6379
```

### 4. Run Services
```bash
docker compose up -d
```

### 5. Install & Start
```bash
pnpm install
pnpm dev
```

### 6. Open App
- Frontend (if separate): http://localhost:5173
- API: http://localhost:4000/health (example)

---

## 🔌 API (Early Outline)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Create account & initial workspace |
| POST | /auth/login | Issue access + refresh |
| GET | /workspaces/:id/projects | List projects |
| POST | /projects | Create project |
| GET | /projects/:id/tasks | Task listing |
| POST | /tasks | Create task |
| PATCH | /tasks/:id | Update task fields |
| GET | /channels/:id/messages | List messages |
| POST | /channels/:id/messages | Send message |
| POST | /messages/:id/request | Mark message as actionable |
| PATCH | /requests/:id | Complete/cancel request |

(Full OpenAPI spec planned.)

---

## 🔁 Realtime Event Model (Planned)

| Direction | Event | Payload |
|-----------|-------|---------|
| Server → Client | task.created / task.updated | Task object |
| Server → Client | message.new | Message object |
| Server → Client | request.created / request.resolved | Request meta |
| Client → Server | task.update | { id, patch } |
| Client → Server | message.send | { channelId, body } |
| Bi-directional | presence.ping | { userId, ts } |

Rooms:
- workspace:<workspaceId>
- project:<projectId>

---

## 🤖 taskTalk (AI Bot – Concept)

Flow:
1. User types natural instruction
2. Intent extraction → structured command (e.g., create_task)
3. Validation (assignee exists? project resolved?)
4. Execution (API call)
5. Response posted as system message

Example Prompt:
> "Create a high priority task to fix onboarding email bug in Growth project assign to Alice due Friday."

Produces (internal):
```json
{
  "intent": "create_task",
  "fields": {
    "title": "Fix onboarding email bug",
    "priority": "high",
    "project": "Growth",
    "assignee": "alice",
    "due_date": "2025-09-12"
  }
}
```

---

## 🔐 Security Baseline

| Area | Status | Notes |
|------|--------|-------|
| Transport | Planned | Enforce HTTPS in hosted env |
| Passwords | Hash (bcrypt/argon2) | Argon2 recommended |
| Auth | JWT access + refresh | Rotation policy roadmap |
| RBAC | Basic roles | Fine-grained perms later |
| Secrets | .env (dev) / manager (prod) | Vault / cloud secrets manager |
| Audit | Activity logs table | Expand for compliance |
| Rate Limiting | Pending | Add per-IP + per-token |

---

## 📊 Analytics & Wellness (Ethical Scope)

Metrics (planned):
- Task throughput & aging
- Unresolved priority requests
- Activity clustering (late hours / weekend)

Principles:
- Opt-in for wellness features
- Aggregate over intrusive individual surveillance
- Transparency: users understand what’s tracked

---

## 🧪 Testing Strategy (Roadmap)

| Layer | Tooling | Targets |
|-------|---------|---------|
| Unit | Vitest / Jest | Helpers, services |
| Integration | Supertest + Testcontainers | API correctness |
| E2E | Playwright | Core flows (auth → task → chat) |
| Load | k6 / Artillery | WebSocket fan-out |
| Security | Zod validation + fuzz | Input robustness |

---

## 🚦 Performance Targets (Initial)

| Metric | Goal |
|--------|------|
| P95 API latency | < 400 ms |
| WS broadcast latency | < 300 ms |
| First dashboard data | < 2.5 s |
| Task board interaction | < 100 ms UI response |
| Error rate | < 1% non-4xx |

---

## 🗺 Roadmap (Phased)

### Phase 1 (MVP)
- Auth + Workspaces
- Projects & Tasks (Kanban)
- Basic Chat
- Action Requests (manual)
- Deployment & CI

### Phase 2
- GitHub integration (link PRs)
- Basic AI summaries (daily digest)
- WebRTC minimal meetings
- Message → Task conversion

### Phase 3
- Advanced analytics (aging, cycle time)
- Calendar & dependencies
- AI risk detection
- Mobile (read-only)

### Phase 4
- Plugin marketplace (internal apps)
- SSO / SCIM / Audit exports
- Wellness insights (opt-in dashboards)
- Capacity heatmaps

---

## 🛠 Contributing

Contributions welcome!

1. Fork & clone
2. Create feature branch: `feat/<short-name>`
3. Run lint/tests before PR
4. Submit PR with concise description

Coding Standards:
- Conventional Commits (e.g., `feat: add task priority`)
- Type-first (no `any` unless justified)
- Keep modules cohesive (auth/, tasks/, chat/)

Planned Files:
```
/backend
  /src
    /modules
    /lib
/frontend
  /src
    /components
    /features
/docker
/docs
```

### Suggested Scripts
```bash
pnpm lint
pnpm test
pnpm format
```

---

## 🐞 Issue Labels (Planned)

| Label | Meaning |
|-------|--------|
| good first issue | New contributor friendly |
| help wanted | Maintainer bandwidth low |
| discussion | Needs architectural input |
| blocked | External dependency |
| priority:high | Time-sensitive |

---

## 📋 Backlog Ideas (Open to Contributions)

- React Command Palette (task / message quick create)
- Custom task field templates
- Attachment previews (images, Markdown)
- Inline slash commands in chat (/task, /assign)
- Multi-select task bulk actions
- Message sentiment classification (privacy aware)

---

## 🧾 License

MIT © 2025 CodeWarriors (and contributors)

See [LICENSE](./LICENSE) when added.

---

## 🙋 FAQ (Seed)

**Why invent another collaboration tool?**  
We focus on unifying execution + insight + wellness with real-time semantics at the core.

**Is AI required to use it?**  
No. AI augments, not blocks workflows.

**Will there be a hosted SaaS?**  
Planned. Self-hosting remains viable under MIT.

---

## 📣 Community & Support (Planned)

- Discussions tab for Q&A
- Templates for bug reports / feature requests
- Changelog & release cadence (semantic versioning once stable)

---

## 🧪 Sample Make Commands (Optional Future)

```make
make dev        # Run backend + frontend concurrently
make test       # Run all tests
make db.migrate # Apply migrations
make lint       # ESLint + Type checks
```

---

## 🔄 Future Extensibility

| Vector | Approach |
|--------|----------|
| Integrations | Webhook + OAuth layer |
| Bots | Scoped API tokens |
| Plugins | Sandbox + manifest (Phase 4) |
| Data Export | JSON/CSV endpoints |

---

## 🧭 Next Steps (Maintainer Checklist)

- [ ] Finalize backend framework choice (Express vs Fastify)
- [ ] Publish initial DB migration
- [ ] Implement task CRUD + WebSocket broadcast
- [ ] Add first GitHub Action (lint + test)
- [ ] Document OpenAPI base spec
- [ ] Introduce minimal taskTalk intent (create_task)

---

> Have feedback or want a section expanded? Open a discussion or issue—your input shapes the roadmap.

Happy building,  
— Team CodeWarriors 🛡