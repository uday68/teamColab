import { db } from './database.js';
import { v4 as uuidv4 } from 'uuid';

export class AnalyticsService {
  // Get dashboard analytics for a user
  async getDashboardAnalytics(userId) {
    try {
      // Get user's teams
      const teams = await db.query(`
        SELECT team_id FROM team_members WHERE user_id = $1
      `, [userId]);

      const teamIds = teams.rows.map(t => t.team_id);
      
      if (teamIds.length === 0) {
        return this.getEmptyAnalytics();
      }

      // Get comprehensive analytics
      const [
        projectStats,
        taskStats,
        teamStats,
        riskStats,
        recentActivity
      ] = await Promise.all([
        this.getProjectStats(teamIds),
        this.getTaskStats(teamIds, userId),
        this.getTeamStats(teamIds),
        this.getRiskStats(teamIds),
        this.getRecentActivity(teamIds, userId)
      ]);

      return {
        projects: projectStats,
        tasks: taskStats,
        teams: teamStats,
        risks: riskStats,
        recent_activity: recentActivity,
        generated_at: new Date()
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  }

  // Get project statistics
  async getProjectStats(teamIds) {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold_projects,
        AVG(progress_percent) as avg_progress,
        COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_projects,
        COUNT(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 END) as overdue_projects
      FROM projects 
      WHERE team_id = ANY($1)
    `, [teamIds]);

    return result.rows[0];
  }

  // Get task statistics
  async getTaskStats(teamIds, userId) {
    const [allTasks, userTasks] = await Promise.all([
      db.query(`
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
          COUNT(CASE WHEN t.status = 'todo' THEN 1 END) as todo_tasks,
          COUNT(CASE WHEN t.priority = 'high' THEN 1 END) as high_priority_tasks,
          COUNT(CASE WHEN t.due_date < NOW() AND t.status != 'completed' THEN 1 END) as overdue_tasks,
          AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600) as avg_completion_hours
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE p.team_id = ANY($1)
      `, [teamIds]),
      
      db.query(`
        SELECT 
          COUNT(*) as assigned_to_me,
          COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as my_completed_tasks,
          COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as my_in_progress_tasks
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE p.team_id = ANY($1) AND t.assignee_id = $2
      `, [teamIds, userId])
    ]);

    return {
      ...allTasks.rows[0],
      ...userTasks.rows[0]
    };
  }

  // Get team statistics
  async getTeamStats(teamIds) {
    const result = await db.query(`
      SELECT 
        COUNT(DISTINCT tm.team_id) as total_teams,
        COUNT(DISTINCT tm.user_id) as total_members,
        AVG(member_counts.member_count) as avg_team_size
      FROM team_members tm
      JOIN (
        SELECT team_id, COUNT(*) as member_count
        FROM team_members
        WHERE team_id = ANY($1)
        GROUP BY team_id
      ) member_counts ON tm.team_id = member_counts.team_id
      WHERE tm.team_id = ANY($1)
    `, [teamIds]);

    return result.rows[0];
  }

  // Get risk statistics
  async getRiskStats(teamIds) {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_risks,
        COUNT(CASE WHEN severity >= 4 THEN 1 END) as critical_risks,
        COUNT(CASE WHEN severity = 3 THEN 1 END) as high_risks,
        COUNT(CASE WHEN severity <= 2 THEN 1 END) as low_risks,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as risks_last_week
      FROM risk_logs rl
      JOIN projects p ON rl.project_id = p.id
      WHERE p.team_id = ANY($1)
    `, [teamIds]);

    return result.rows[0];
  }

  // Get recent activity
  async getRecentActivity(teamIds, userId, limit = 10) {
    const result = await db.query(`
      SELECT 
        at.action,
        at.entity_type,
        at.entity_id,
        at.timestamp,
        at.diff_json,
        u.full_name as user_name,
        u.avatar_url as user_avatar
      FROM audit_trails at
      JOIN users u ON at.user_id = u.id
      WHERE (
        (at.entity_type = 'project' AND at.entity_id IN (
          SELECT id FROM projects WHERE team_id = ANY($1)
        )) OR
        (at.entity_type = 'task' AND at.entity_id IN (
          SELECT t.id FROM tasks t 
          JOIN projects p ON t.project_id = p.id 
          WHERE p.team_id = ANY($1)
        )) OR
        (at.entity_type = 'team' AND at.entity_id = ANY($1))
      )
      ORDER BY at.timestamp DESC
      LIMIT $2
    `, [teamIds, limit]);

    return result.rows;
  }

  // Get project progress over time
  async getProjectProgressChart(projectId, days = 30) {
    try {
      const result = await db.query(`
        SELECT 
          DATE(at.timestamp) as date,
          (at.diff_json->>'progress_percent')::int as progress
        FROM audit_trails at
        WHERE at.entity_type = 'project' 
          AND at.entity_id = $1 
          AND at.diff_json ? 'progress_percent'
          AND at.timestamp >= NOW() - INTERVAL '${days} days'
        ORDER BY at.timestamp ASC
      `, [projectId]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching project progress chart:', error);
      throw error;
    }
  }

  // Get team velocity metrics
  async getTeamVelocity(teamId, weeks = 4) {
    try {
      const result = await db.query(`
        SELECT 
          DATE_TRUNC('week', t.completed_at) as week,
          COUNT(*) as completed_tasks,
          AVG(t.estimate_hours) as avg_estimated_hours,
          AVG(t.actual_hours) as avg_actual_hours
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE p.team_id = $1 
          AND t.status = 'completed'
          AND t.completed_at >= NOW() - INTERVAL '${weeks} weeks'
        GROUP BY DATE_TRUNC('week', t.completed_at)
        ORDER BY week ASC
      `, [teamId]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching team velocity:', error);
      throw error;
    }
  }

  // Get burndown chart data
  async getBurndownChart(projectId) {
    try {
      const result = await db.query(`
        WITH daily_completion AS (
          SELECT 
            DATE(completed_at) as completion_date,
            COUNT(*) as tasks_completed
          FROM tasks
          WHERE project_id = $1 AND status = 'completed'
          GROUP BY DATE(completed_at)
        ),
        total_tasks AS (
          SELECT COUNT(*) as total FROM tasks WHERE project_id = $1
        )
        SELECT 
          dc.completion_date,
          dc.tasks_completed,
          tt.total,
          SUM(dc.tasks_completed) OVER (ORDER BY dc.completion_date) as cumulative_completed,
          (tt.total - SUM(dc.tasks_completed) OVER (ORDER BY dc.completion_date)) as remaining
        FROM daily_completion dc
        CROSS JOIN total_tasks tt
        ORDER BY dc.completion_date ASC
      `, [projectId]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching burndown chart:', error);
      throw error;
    }
  }

  // Generate empty analytics for new users
  getEmptyAnalytics() {
    return {
      projects: {
        total_projects: 0,
        active_projects: 0,
        completed_projects: 0,
        on_hold_projects: 0,
        avg_progress: 0,
        high_risk_projects: 0,
        overdue_projects: 0
      },
      tasks: {
        total_tasks: 0,
        completed_tasks: 0,
        in_progress_tasks: 0,
        todo_tasks: 0,
        high_priority_tasks: 0,
        overdue_tasks: 0,
        assigned_to_me: 0,
        my_completed_tasks: 0,
        my_in_progress_tasks: 0,
        avg_completion_hours: null
      },
      teams: {
        total_teams: 0,
        total_members: 0,
        avg_team_size: 0
      },
      risks: {
        total_risks: 0,
        critical_risks: 0,
        high_risks: 0,
        low_risks: 0,
        risks_last_week: 0
      },
      recent_activity: [],
      generated_at: new Date()
    };
  }
}

export class HealthService {
  // Track work session
  async startWorkSession(userId, projectId = null, taskId = null) {
    try {
      const sessionId = uuidv4();
      const result = await db.query(`
        INSERT INTO work_sessions (id, user_id, project_id, task_id, started_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `, [sessionId, userId, projectId, taskId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error starting work session:', error);
      throw error;
    }
  }

  // End work session
  async endWorkSession(sessionId, userId) {
    try {
      const result = await db.query(`
        UPDATE work_sessions 
        SET ended_at = NOW(),
            duration_minutes = EXTRACT(EPOCH FROM (NOW() - started_at))/60
        WHERE id = $1 AND user_id = $2 AND ended_at IS NULL
        RETURNING *
      `, [sessionId, userId]);

      if (result.rows.length === 0) {
        throw new Error('Work session not found or already ended');
      }

      // Update user health status
      await this.updateUserHealthStatus(userId);

      return result.rows[0];
    } catch (error) {
      console.error('Error ending work session:', error);
      throw error;
    }
  }

  // Get user health status
  async getUserHealthStatus(userId) {
    try {
      let result = await db.query(`
        SELECT * FROM user_health_status WHERE user_id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        // Create initial health status
        await db.query(`
          INSERT INTO user_health_status (user_id, avg_hours_last7d, breaks_taken, alert_level)
          VALUES ($1, 0, 0, 'green')
        `, [userId]);

        result = await db.query(`
          SELECT * FROM user_health_status WHERE user_id = $1
        `, [userId]);
      }

      const healthStatus = result.rows[0];

      // Get recent work sessions
      const sessionsResult = await db.query(`
        SELECT * FROM work_sessions 
        WHERE user_id = $1 
          AND started_at >= NOW() - INTERVAL '7 days'
          AND ended_at IS NOT NULL
        ORDER BY started_at DESC
      `, [userId]);

      healthStatus.recent_sessions = sessionsResult.rows;

      // Get health tips
      const tipsResult = await db.query(`
        SELECT * FROM health_tips 
        WHERE category = 'general' OR category = $1
        ORDER BY RANDOM()
        LIMIT 3
      `, [healthStatus.alert_level]);

      healthStatus.tips = tipsResult.rows;

      return healthStatus;
    } catch (error) {
      console.error('Error fetching user health status:', error);
      throw error;
    }
  }

  // Update user health status
  async updateUserHealthStatus(userId) {
    try {
      // Calculate average hours in last 7 days
      const hoursResult = await db.query(`
        SELECT 
          COALESCE(AVG(duration_minutes)/60, 0) as avg_hours,
          COUNT(*) as session_count,
          SUM(duration_minutes) as total_minutes
        FROM work_sessions 
        WHERE user_id = $1 
          AND started_at >= NOW() - INTERVAL '7 days'
          AND ended_at IS NOT NULL
      `, [userId]);

      const { avg_hours, session_count, total_minutes } = hoursResult.rows[0];

      // Determine alert level
      let alertLevel = 'green';
      if (avg_hours > 10) {
        alertLevel = 'red';  // Working too much
      } else if (avg_hours > 8) {
        alertLevel = 'yellow';  // Moderate concern
      } else if (avg_hours < 4 && session_count > 0) {
        alertLevel = 'blue';  // Low activity
      }

      // Update health status
      await db.query(`
        UPDATE user_health_status 
        SET avg_hours_last7d = $1,
            alert_level = $2,
            updated_at = NOW()
        WHERE user_id = $3
      `, [avg_hours, alertLevel, userId]);

      return { avg_hours, alert_level, session_count, total_minutes };
    } catch (error) {
      console.error('Error updating user health status:', error);
      throw error;
    }
  }

  // Record break taken
  async recordBreak(userId) {
    try {
      await db.query(`
        UPDATE user_health_status 
        SET breaks_taken = breaks_taken + 1,
            updated_at = NOW()
        WHERE user_id = $1
      `, [userId]);

      return { message: 'Break recorded successfully' };
    } catch (error) {
      console.error('Error recording break:', error);
      throw error;
    }
  }

  // Get team health overview
  async getTeamHealthOverview(teamId) {
    try {
      const result = await db.query(`
        SELECT 
          u.id,
          u.full_name,
          u.avatar_url,
          uhs.avg_hours_last7d,
          uhs.alert_level,
          uhs.breaks_taken,
          uhs.updated_at
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        LEFT JOIN user_health_status uhs ON u.id = uhs.user_id
        WHERE tm.team_id = $1
        ORDER BY uhs.alert_level DESC, uhs.avg_hours_last7d DESC
      `, [teamId]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching team health overview:', error);
      throw error;
    }
  }

  // Get wellness recommendations
  async getWellnessRecommendations(userId) {
    try {
      const healthStatus = await this.getUserHealthStatus(userId);
      const recommendations = [];

      if (healthStatus.alert_level === 'red') {
        recommendations.push({
          type: 'urgent',
          message: 'You\'ve been working long hours. Consider taking a break or reducing your workload.',
          action: 'Take a 15-minute break now'
        });
      }

      if (healthStatus.breaks_taken < 3) {
        recommendations.push({
          type: 'reminder',
          message: 'Remember to take regular breaks throughout the day.',
          action: 'Set a break reminder'
        });
      }

      if (healthStatus.avg_hours_last7d > 0) {
        const efficiency = healthStatus.recent_sessions.length > 0 ? 
          healthStatus.recent_sessions.reduce((acc, session) => acc + (session.duration_minutes || 0), 0) / healthStatus.recent_sessions.length : 0;
        
        if (efficiency < 30) {
          recommendations.push({
            type: 'tip',
            message: 'Consider using the Pomodoro technique to improve focus.',
            action: 'Start a focused work session'
          });
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting wellness recommendations:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
export const healthService = new HealthService();
