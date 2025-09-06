import { db } from './database.js';
import { v4 as uuidv4 } from 'uuid';

export class TeamService {
  // Get teams for a user
  async getUserTeams(userId) {
    try {
      const result = await db.query(`
        SELECT t.*, tm.is_admin, tm.joined_at,
               COUNT(DISTINCT tm2.user_id) as member_count,
               COUNT(DISTINCT p.id) as project_count
        FROM teams t
        JOIN team_members tm ON t.id = tm.team_id
        LEFT JOIN team_members tm2 ON t.id = tm2.team_id
        LEFT JOIN projects p ON t.id = p.team_id
        WHERE tm.user_id = $1
        GROUP BY t.id, tm.is_admin, tm.joined_at
        ORDER BY tm.joined_at DESC
      `, [userId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching user teams:', error);
      throw error;
    }
  }

  // Get team by ID with members
  async getTeamById(teamId, userId) {
    try {
      // Check if user is a member of the team
      const memberCheck = await db.query(`
        SELECT tm.is_admin FROM team_members tm WHERE tm.team_id = $1 AND tm.user_id = $2
      `, [teamId, userId]);

      if (memberCheck.rows.length === 0) {
        throw new Error('Access denied: Not a team member');
      }

      const teamResult = await db.query(`
        SELECT t.*, u.full_name as created_by_name
        FROM teams t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.id = $1
      `, [teamId]);

      if (teamResult.rows.length === 0) {
        throw new Error('Team not found');
      }

      const membersResult = await db.query(`
        SELECT tm.*, u.full_name, u.email, u.avatar_url, u.status, u.role
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE tm.team_id = $1
        ORDER BY tm.is_admin DESC, tm.joined_at ASC
      `, [teamId]);

      const team = teamResult.rows[0];
      team.members = membersResult.rows;
      team.is_admin = memberCheck.rows[0].is_admin;

      return team;
    } catch (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
  }

  // Create a new team
  async createTeam(teamData, userId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      const teamId = uuidv4();
      const { name, description, settings = {} } = teamData;

      // Create team
      const teamResult = await client.query(`
        INSERT INTO teams (id, name, description, created_by, settings)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [teamId, name, description, userId, JSON.stringify(settings)]);

      // Add creator as admin member
      await client.query(`
        INSERT INTO team_members (team_id, user_id, is_admin)
        VALUES ($1, $2, $3)
      `, [teamId, userId, true]);

      await client.query('COMMIT');
      
      // Log audit trail
      await this.logAuditTrail(userId, 'team', teamId, 'created', {
        name,
        description
      });

      return teamResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating team:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update team
  async updateTeam(teamId, updates, userId) {
    try {
      // Check admin permission
      const adminCheck = await db.query(`
        SELECT is_admin FROM team_members WHERE team_id = $1 AND user_id = $2
      `, [teamId, userId]);

      if (adminCheck.rows.length === 0 || !adminCheck.rows[0].is_admin) {
        throw new Error('Access denied: Admin privileges required');
      }

      const setClause = [];
      const values = [];
      let paramIndex = 1;

      const allowedFields = ['name', 'description', 'settings'];
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          if (field === 'settings') {
            setClause.push(`${field} = $${paramIndex}`);
            values.push(JSON.stringify(updates[field]));
          } else {
            setClause.push(`${field} = $${paramIndex}`);
            values.push(updates[field]);
          }
          paramIndex++;
        }
      }

      if (setClause.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(new Date()); // updated_at
      values.push(teamId);

      const result = await db.query(`
        UPDATE teams 
        SET ${setClause.join(', ')}, updated_at = $${paramIndex}
        WHERE id = $${paramIndex + 1}
        RETURNING *
      `, values);

      if (result.rows.length === 0) {
        throw new Error('Team not found');
      }

      // Log audit trail
      await this.logAuditTrail(userId, 'team', teamId, 'updated', updates);

      return result.rows[0];
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  }

  // Add team member
  async addTeamMember(teamId, memberEmail, userId) {
    const client = await db.getClient();
    
    try {
      // Check admin permission
      const adminCheck = await db.query(`
        SELECT is_admin FROM team_members WHERE team_id = $1 AND user_id = $2
      `, [teamId, userId]);

      if (adminCheck.rows.length === 0 || !adminCheck.rows[0].is_admin) {
        throw new Error('Access denied: Admin privileges required');
      }

      // Find user by email
      const userResult = await db.query(`
        SELECT id, full_name, email FROM users WHERE email = $1
      `, [memberEmail]);

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const newMember = userResult.rows[0];

      // Check if already a member
      const memberCheck = await db.query(`
        SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2
      `, [teamId, newMember.id]);

      if (memberCheck.rows.length > 0) {
        throw new Error('User is already a team member');
      }

      await client.query('BEGIN');

      // Add team member
      await client.query(`
        INSERT INTO team_members (team_id, user_id, is_admin)
        VALUES ($1, $2, $3)
      `, [teamId, newMember.id, false]);

      await client.query('COMMIT');

      // Log audit trail
      await this.logAuditTrail(userId, 'team', teamId, 'member_added', {
        member_email: memberEmail,
        member_id: newMember.id
      });

      return {
        id: newMember.id,
        full_name: newMember.full_name,
        email: newMember.email,
        is_admin: false,
        joined_at: new Date()
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error adding team member:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Remove team member
  async removeTeamMember(teamId, memberId, userId) {
    try {
      // Check admin permission
      const adminCheck = await db.query(`
        SELECT is_admin FROM team_members WHERE team_id = $1 AND user_id = $2
      `, [teamId, userId]);

      if (adminCheck.rows.length === 0 || !adminCheck.rows[0].is_admin) {
        throw new Error('Access denied: Admin privileges required');
      }

      // Cannot remove yourself if you're the last admin
      if (memberId === userId) {
        const adminCount = await db.query(`
          SELECT COUNT(*) as count FROM team_members WHERE team_id = $1 AND is_admin = true
        `, [teamId]);

        if (parseInt(adminCount.rows[0].count) <= 1) {
          throw new Error('Cannot remove the last admin from the team');
        }
      }

      const result = await db.query(`
        DELETE FROM team_members 
        WHERE team_id = $1 AND user_id = $2
        RETURNING *
      `, [teamId, memberId]);

      if (result.rows.length === 0) {
        throw new Error('Team member not found');
      }

      // Log audit trail
      await this.logAuditTrail(userId, 'team', teamId, 'member_removed', {
        member_id: memberId
      });

      return result.rows[0];
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  }

  // Update member role
  async updateMemberRole(teamId, memberId, isAdmin, userId) {
    try {
      // Check admin permission
      const adminCheck = await db.query(`
        SELECT is_admin FROM team_members WHERE team_id = $1 AND user_id = $2
      `, [teamId, userId]);

      if (adminCheck.rows.length === 0 || !adminCheck.rows[0].is_admin) {
        throw new Error('Access denied: Admin privileges required');
      }

      // Cannot demote yourself if you're the last admin
      if (memberId === userId && !isAdmin) {
        const adminCount = await db.query(`
          SELECT COUNT(*) as count FROM team_members WHERE team_id = $1 AND is_admin = true
        `, [teamId]);

        if (parseInt(adminCount.rows[0].count) <= 1) {
          throw new Error('Cannot demote the last admin');
        }
      }

      const result = await db.query(`
        UPDATE team_members 
        SET is_admin = $1
        WHERE team_id = $2 AND user_id = $3
        RETURNING *
      `, [isAdmin, teamId, memberId]);

      if (result.rows.length === 0) {
        throw new Error('Team member not found');
      }

      // Log audit trail
      await this.logAuditTrail(userId, 'team', teamId, 'member_role_updated', {
        member_id: memberId,
        is_admin: isAdmin
      });

      return result.rows[0];
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  // Delete team
  async deleteTeam(teamId, userId) {
    try {
      // Check if user is the creator or admin
      const permissionCheck = await db.query(`
        SELECT t.created_by, tm.is_admin 
        FROM teams t
        LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.user_id = $2
        WHERE t.id = $1
      `, [teamId, userId]);

      if (permissionCheck.rows.length === 0) {
        throw new Error('Team not found');
      }

      const { created_by, is_admin } = permissionCheck.rows[0];
      if (created_by !== userId && !is_admin) {
        throw new Error('Access denied: Only team creator or admin can delete the team');
      }

      const result = await db.query(`
        DELETE FROM teams WHERE id = $1 RETURNING *
      `, [teamId]);

      // Log audit trail
      await this.logAuditTrail(userId, 'team', teamId, 'deleted', {
        name: result.rows[0].name
      });

      return result.rows[0];
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  }

  // Get team analytics
  async getTeamAnalytics(teamId, userId) {
    try {
      // Check team membership
      const memberCheck = await db.query(`
        SELECT is_admin FROM team_members WHERE team_id = $1 AND user_id = $2
      `, [teamId, userId]);

      if (memberCheck.rows.length === 0) {
        throw new Error('Access denied: Not a team member');
      }

      const analytics = await db.query(`
        SELECT 
          COUNT(DISTINCT tm.user_id) as total_members,
          COUNT(DISTINCT p.id) as total_projects,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
          COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
          AVG(p.progress_percent) as avg_project_progress
        FROM teams team
        LEFT JOIN team_members tm ON team.id = tm.team_id
        LEFT JOIN projects p ON team.id = p.team_id
        LEFT JOIN tasks t ON p.id = t.project_id
        WHERE team.id = $1
      `, [teamId]);

      return analytics.rows[0];
    } catch (error) {
      console.error('Error fetching team analytics:', error);
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

export const teamService = new TeamService();
