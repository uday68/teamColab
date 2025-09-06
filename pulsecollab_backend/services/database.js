import pg from 'pg';
import { readFileSync } from 'fs';
import path from 'path';

const { Pool } = pg;

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pulsecollab',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT) || 5432,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export class DatabaseService {
  constructor() {
    this.pool = new Pool(dbConfig);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.pool.on('connect', () => {
      console.log('✅ Database connected successfully');
    });

    this.pool.on('error', (err) => {
      console.error('❌ Database connection error:', err);
    });
  }

  // Execute a query
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Query executed:', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Get a client from the pool for transactions
  async getClient() {
    return await this.pool.connect();
  }

  // Initialize database with schema
  async initializeDatabase() {
    try {
      const schemaPath = path.join(process.cwd(), 'database', 'db.sql');
      const schema = readFileSync(schemaPath, 'utf8');
      
      await this.query(schema);
      console.log('✅ Database schema initialized');
      
      // Insert sample data
      await this.insertSampleData();
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  // Insert sample data for development
  async insertSampleData() {
    try {
      // Create sample users
      const users = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          full_name: 'John Doe',
          email: 'john@pulsecollab.com',
          hashed_password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewthRB/R8T9J3F9q', // password123
          role: 'owner',
          status: 'online'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          full_name: 'Jane Smith',
          email: 'jane@pulsecollab.com',
          hashed_password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewthRB/R8T9J3F9q',
          role: 'leader',
          status: 'online'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          full_name: 'Mike Johnson',
          email: 'mike@pulsecollab.com',
          hashed_password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewthRB/R8T9J3F9q',
          role: 'member',
          status: 'offline'
        }
      ];

      for (const user of users) {
        await this.query(`
          INSERT INTO users (id, full_name, email, hashed_password, role, status)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (email) DO NOTHING
        `, [user.id, user.full_name, user.email, user.hashed_password, user.role, user.status]);
      }

      // Create sample team
      const teamId = '660e8400-e29b-41d4-a716-446655440001';
      await this.query(`
        INSERT INTO teams (id, name, description, created_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING
      `, [teamId, 'PulseCollab Core Team', 'Main development team for PulseCollab platform', users[0].id]);

      // Add team members
      for (const user of users) {
        await this.query(`
          INSERT INTO team_members (team_id, user_id, is_admin)
          VALUES ($1, $2, $3)
          ON CONFLICT (team_id, user_id) DO NOTHING
        `, [teamId, user.id, user.role === 'owner']);
      }

      // Create sample projects
      const projects = [
        {
          id: '770e8400-e29b-41d4-a716-446655440001',
          name: 'Mobile App Redesign',
          description: 'Complete overhaul of the mobile application user interface',
          progress_percent: 78,
          risk_level: 'medium',
          status: 'active'
        },
        {
          id: '770e8400-e29b-41d4-a716-446655440002',
          name: 'API Integration',
          description: 'Integrate third-party APIs for enhanced functionality',
          progress_percent: 92,
          risk_level: 'low',
          status: 'active'
        },
        {
          id: '770e8400-e29b-41d4-a716-446655440003',
          name: 'User Research Study',
          description: 'Comprehensive user experience research and analysis',
          progress_percent: 65,
          risk_level: 'high',
          status: 'active'
        }
      ];

      for (const project of projects) {
        await this.query(`
          INSERT INTO projects (id, team_id, name, description, progress_percent, risk_level, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [project.id, teamId, project.name, project.description, project.progress_percent, project.risk_level, project.status]);
      }

      // Create sample tasks
      const tasks = [
        {
          project_id: projects[0].id,
          title: 'Design new login screen',
          description: 'Create mockups and prototypes for the new login interface',
          assignee_id: users[1].id,
          priority: 'high',
          status: 'in_progress'
        },
        {
          project_id: projects[0].id,
          title: 'Implement responsive layout',
          description: 'Ensure the app works well on all screen sizes',
          assignee_id: users[2].id,
          priority: 'medium',
          status: 'todo'
        },
        {
          project_id: projects[1].id,
          title: 'Test payment gateway integration',
          description: 'Comprehensive testing of payment processing',
          assignee_id: users[0].id,
          priority: 'high',
          status: 'completed'
        }
      ];

      for (const task of tasks) {
        await this.query(`
          INSERT INTO tasks (project_id, title, description, assignee_id, priority, status)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [task.project_id, task.title, task.description, task.assignee_id, task.priority, task.status]);
      }

      // Insert health tips
      const healthTips = [
        'Take a 5-minute break every hour to reduce eye strain',
        'Stand up and stretch for 2 minutes every 30 minutes',
        'Keep a water bottle nearby and stay hydrated',
        'Practice the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds',
        'Take a proper lunch break away from your workspace'
      ];

      for (const tip of healthTips) {
        await this.query(`
          INSERT INTO health_tips (tip_text, category)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [tip, 'general']);
      }

      console.log('✅ Sample data inserted successfully');
    } catch (error) {
      console.error('❌ Failed to insert sample data:', error);
    }
  }

  // Close the database connection
  async close() {
    await this.pool.end();
    console.log('Database connection closed');
  }
}

export const db = new DatabaseService();
