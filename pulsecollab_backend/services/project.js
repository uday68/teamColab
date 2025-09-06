import { db } from './database.js';
import { v4 as uuidv4 } from 'uuid';

export class ProjectService {
  // Get all projects for a team
  async getProjects(teamId, userId) {
    try {
      const result = await db.query(`
        SELECT p.*, u.full_name as created_by_name,
               COUNT(DISTINCT t.id) as task_count,
               COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN tasks t ON p.id = t.project_id
        WHERE p.team_id = $1
        GROUP BY p.id, u.full_name
        ORDER BY p.created_at DESC
      `, [teamId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get project by ID with detailed information
  async getProjectById(projectId) {
    try {
      const result = await db.query(`
        SELECT p.*, u.full_name as created_by_name,
               COUNT(DISTINCT t.id) as task_count,
               COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
               AVG(CASE WHEN t.status = 'completed' THEN 100 ELSE 
                   CASE WHEN t.status = 'in_progress' THEN 50 ELSE 0 END END) as calculated_progress
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN tasks t ON p.id = t.project_id
        WHERE p.id = $1
        GROUP BY p.id, u.full_name
      `, [projectId]);
      
      if (result.rows.length === 0) {
        throw new Error('Project not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  // Create a new project
  async createProject(projectData, userId) {
    try {
      const projectId = uuidv4();
      const {
        team_id,
        name,
        description,
        start_date,
        due_date,
        priority = 'medium'
      } = projectData;

      const result = await db.query(`
        INSERT INTO projects (id, team_id, name, description, start_date, due_date, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [projectId, team_id, name, description, start_date, due_date, userId]);
      
      // Log audit trail
      await this.logAuditTrail(userId, 'project', projectId, 'created', {
        name,
        team_id
      });
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update project
  async updateProject(projectId, updates, userId) {
    try {
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      // Dynamically build the SET clause
      const allowedFields = ['name', 'description', 'progress_percent', 'risk_level', 'status', 'start_date', 'due_date'];
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          setClause.push(`${field} = $${paramIndex}`);
          values.push(updates[field]);
          paramIndex++;
        }
      }

      if (setClause.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(new Date()); // updated_at
      values.push(projectId);

      const result = await db.query(`
        UPDATE projects 
        SET ${setClause.join(', ')}, updated_at = $${paramIndex}
        WHERE id = $${paramIndex + 1}
        RETURNING *
      `, values);

      if (result.rows.length === 0) {
        throw new Error('Project not found');
      }

      // Log audit trail
      await this.logAuditTrail(userId, 'project', projectId, 'updated', updates);

      return result.rows[0];
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  async deleteProject(projectId, userId) {
    try {
      const result = await db.query(`
        DELETE FROM projects WHERE id = $1 RETURNING *
      `, [projectId]);

      if (result.rows.length === 0) {
        throw new Error('Project not found');
      }

      // Log audit trail
      await this.logAuditTrail(userId, 'project', projectId, 'deleted', {
        name: result.rows[0].name
      });

      return result.rows[0];
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Get project analytics
  async getProjectAnalytics(projectId) {
    try {
      const analytics = await db.query(`
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
          COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_tasks,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tasks,
          AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as avg_completion_hours,
          COUNT(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 END) as overdue_tasks
        FROM tasks 
        WHERE project_id = $1
      `, [projectId]);

      return analytics.rows[0];
    } catch (error) {
      console.error('Error fetching project analytics:', error);
      throw error;
    }
  }

  // Log audit trail
  async logAuditTrail(userId, entityType, entityId, action, diffJson) {
    try {
      await db.query(`
        INSERT INTO audit_trails (user_id, entity_type, entity_id, action, diff_json)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, entityType, entityId, action, JSON.stringify(diffJson)]);
    } catch (error) {
      console.error('Error logging audit trail:', error);
    }
  }
}

export class TaskService {
  // Get tasks for a project
  async getTasks(projectId, filters = {}) {
    try {
      let query = `
        SELECT t.*, u.full_name as assignee_name, u.avatar_url as assignee_avatar,
               p.name as project_name
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.project_id = $1
      `;
      const values = [projectId];
      let paramIndex = 2;

      // Apply filters
      if (filters.status) {
        query += ` AND t.status = $${paramIndex}`;
        values.push(filters.status);
        paramIndex++;
      }

      if (filters.priority) {
        query += ` AND t.priority = $${paramIndex}`;
        values.push(filters.priority);
        paramIndex++;
      }

      if (filters.assignee_id) {
        query += ` AND t.assignee_id = $${paramIndex}`;
        values.push(filters.assignee_id);
        paramIndex++;
      }

      query += ` ORDER BY t.created_at DESC`;

      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Get task by ID
  async getTaskById(taskId) {
    try {
      const result = await db.query(`
        SELECT t.*, u.full_name as assignee_name, u.avatar_url as assignee_avatar,
               p.name as project_name, p.team_id
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.id = $1
      `, [taskId]);

      if (result.rows.length === 0) {
        throw new Error('Task not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  // Create a new task
  async createTask(taskData, userId) {
    try {
      const taskId = uuidv4();
      const {
        project_id,
        title,
        description,
        assignee_id,
        priority = 'medium',
        status = 'todo',
        start_date,
        due_date,
        estimate_hours
      } = taskData;

      const result = await db.query(`
        INSERT INTO tasks (id, project_id, title, description, assignee_id, priority, status, start_date, due_date, estimate_hours)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [taskId, project_id, title, description, assignee_id, priority, status, start_date, due_date, estimate_hours]);

      // Log audit trail
      await this.logAuditTrail(userId, 'task', taskId, 'created', {
        title,
        project_id,
        assignee_id
      });

      return result.rows[0];
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Update task
  async updateTask(taskId, updates, userId) {
    try {
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      const allowedFields = ['title', 'description', 'assignee_id', 'priority', 'status', 'start_date', 'due_date', 'estimate_hours', 'actual_hours'];
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          setClause.push(`${field} = $${paramIndex}`);
          values.push(updates[field]);
          paramIndex++;
        }
      }

      // Handle completion
      if (updates.status === 'completed' && updates.completed_at === undefined) {
        setClause.push(`completed_at = $${paramIndex}`);
        values.push(new Date());
        paramIndex++;
      }

      if (setClause.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(new Date()); // updated_at
      values.push(taskId);

      const result = await db.query(`
        UPDATE tasks 
        SET ${setClause.join(', ')}, updated_at = $${paramIndex}
        WHERE id = $${paramIndex + 1}
        RETURNING *
      `, values);

      if (result.rows.length === 0) {
        throw new Error('Task not found');
      }

      // Log audit trail
      await this.logAuditTrail(userId, 'task', taskId, 'updated', updates);

      return result.rows[0];
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete task
  async deleteTask(taskId, userId) {
    try {
      const result = await db.query(`
        DELETE FROM tasks WHERE id = $1 RETURNING *
      `, [taskId]);

      if (result.rows.length === 0) {
        throw new Error('Task not found');
      }

      // Log audit trail
      await this.logAuditTrail(userId, 'task', taskId, 'deleted', {
        title: result.rows[0].title
      });

      return result.rows[0];
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Get task comments
  async getTaskComments(taskId) {
    try {
      const result = await db.query(`
        SELECT tc.*, u.full_name as author_name, u.avatar_url as author_avatar
        FROM task_comments tc
        JOIN users u ON tc.user_id = u.id
        WHERE tc.task_id = $1
        ORDER BY tc.created_at ASC
      `, [taskId]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching task comments:', error);
      throw error;
    }
  }

  // Add task comment
  async addTaskComment(taskId, content, userId) {
    try {
      const commentId = uuidv4();
      const result = await db.query(`
        INSERT INTO task_comments (id, task_id, user_id, content)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [commentId, taskId, userId, content]);

      return result.rows[0];
    } catch (error) {
      console.error('Error adding task comment:', error);
      throw error;
    }
  }

  // Log audit trail
  async logAuditTrail(userId, entityType, entityId, action, diffJson) {
    try {
      await db.query(`
        INSERT INTO audit_trails (user_id, entity_type, entity_id, action, diff_json)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, entityType, entityId, action, JSON.stringify(diffJson)]);
    } catch (error) {
      console.error('Error logging audit trail:', error);
    }
  }
}

export const projectService = new ProjectService();
export const taskService = new TaskService();
