#!/bin/sh
set -e

echo "Starting PulseCollab application..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432 -U postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is ready!"

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
until redis-cli -h redis ping; do
  echo "Redis is unavailable - sleeping"
  sleep 1
done
echo "Redis is ready!"

# Run database migrations if needed
if [ "$1" = "migrate" ]; then
  echo "Running database migrations..."
  cd /app/backend
  node -e "
    const fs = require('fs');
    const { Pool } = require('pg');
    
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    
    const sql = fs.readFileSync('./database/db.sql', 'utf8');
    pool.query(sql).then(() => {
      console.log('Database migrations completed');
      process.exit(0);
    }).catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
  "
  exit 0
fi

# Start the backend server
cd /app/backend
exec node index.js
