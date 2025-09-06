-- Enable UUIDs and other niceties
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users -------------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name       VARCHAR(150) NOT NULL,
    email           CITEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    avatar_url      TEXT,
    role            VARCHAR(20) NOT NULL DEFAULT 'member', -- owner, leader, member
    status          VARCHAR(20) NOT NULL DEFAULT 'offline',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Teams -------------------------------------------------------------------
CREATE TABLE teams (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(120) NOT NULL,
    description TEXT,
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    settings    JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
    id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_admin  BOOLEAN DEFAULT FALSE,
    UNIQUE(team_id, user_id)
);

-- Projects ---------------------------------------------------------------
CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    progress_percent INT CHECK (progress_percent BETWEEN 0 AND 100) DEFAULT 0,
    risk_level      VARCHAR(20) DEFAULT 'low',
    start_date      DATE,
    due_date        DATE,
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks -------------------------------------------------------------------
CREATE TABLE tasks (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL,
    description  TEXT,
    assignee_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    priority     VARCHAR(20) DEFAULT 'medium',
    status       VARCHAR(20) DEFAULT 'todo',
    start_date   DATE,
    due_date     DATE,
    estimate_hours INT,
    actual_hours   INT,
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);

CREATE TABLE task_comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id         UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    parent_comment_id UUID REFERENCES task_comments(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings & Whiteboard --------------------------------------------------
CREATE TABLE meetings (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id     UUID REFERENCES projects(id) ON DELETE CASCADE,
    title          VARCHAR(150) NOT NULL,
    agenda         TEXT,
    scheduled_start TIMESTAMPTZ,
    scheduled_end   TIMESTAMPTZ,
    created_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    video_room_url TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meeting_notes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id  UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    author_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    content     TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE whiteboard_sessions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id    UUID REFERENCES meetings(id) ON DELETE CASCADE,
    state_json    JSONB,
    last_modified TIMESTAMPTZ DEFAULT NOW()
);

-- Documents ---------------------------------------------------------------
CREATE TABLE documents (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    content     JSONB DEFAULT '{}'::jsonb,
    owner_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    last_edited TIMESTAMPTZ DEFAULT NOW()
);

-- Health & Work Sessions --------------------------------------------------
CREATE TABLE work_sessions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id     UUID REFERENCES tasks(id) ON DELETE CASCADE,
    started_at  TIMESTAMPTZ DEFAULT NOW(),
    ended_at    TIMESTAMPTZ,
    duration_minutes INT
);

CREATE TABLE health_tips (
    id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tip_text TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general'
);

CREATE TABLE user_health_status (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    avg_hours_last7d NUMERIC(5,2),
    breaks_taken     INT DEFAULT 0,
    alert_level      VARCHAR(10) DEFAULT 'green',
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Risk & Audit -------------------------------------------------------------
CREATE TABLE risk_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
    risk_type   VARCHAR(50) NOT NULL,
    severity    INT CHECK (severity BETWEEN 1 AND 5),
    description TEXT,
    detected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_trails (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50),
    entity_id   UUID,
    action      VARCHAR(50),
    diff_json   JSONB,
    timestamp   TIMESTAMPTZ DEFAULT NOW()
);

-- Integrations & Preferences ----------------------------------------------
CREATE TABLE integrations (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id       UUID REFERENCES teams(id) ON DELETE CASCADE,
    provider      VARCHAR(50) NOT NULL,
    access_token  TEXT,
    refresh_token TEXT,
    scopes        TEXT[],
    connected_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_preferences (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme          VARCHAR(20) DEFAULT 'light',
    accent_color   VARCHAR(20) DEFAULT '#3A86FF',
    language       VARCHAR(10) DEFAULT 'en',
    notifications  JSONB DEFAULT '{}'::jsonb,
    wallpaper_url  TEXT
);

-- Helpful Indexes ----------------------------------------------------------
CREATE INDEX idx_projects_team ON projects(team_id);
CREATE INDEX idx_work_sessions_user ON work_sessions(user_id, started_at DESC);
CREATE INDEX idx_risk_logs_project ON risk_logs(project_id, severity DESC);
