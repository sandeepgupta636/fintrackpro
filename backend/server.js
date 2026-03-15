const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const WebSocket = require('ws');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Set default secrets for demo if not provided
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'demo_jwt_secret_for_fintrackpro';
if (!process.env.JWT_REFRESH_SECRET) process.env.JWT_REFRESH_SECRET = 'demo_refresh_secret_for_fintrackpro';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database connection
const dbPath = process.env.NODE_ENV === 'production' ? ':memory:' : './fintrack.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Initialize tables
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  const fs = require('fs');
  const path = require('path');
  const initSqlPath = path.join(__dirname, 'models', 'init.sql');
  
  if (fs.existsSync(initSqlPath)) {
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    // Convert PostgreSQL syntax to SQLite
    const sqliteSql = initSql
      .replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
      .replace(/DECIMAL\(\d+,\d+\)/g, 'REAL')
      .replace(/BOOLEAN DEFAULT FALSE/g, 'INTEGER DEFAULT 0')
      .replace(/BOOLEAN DEFAULT TRUE/g, 'INTEGER DEFAULT 1')
      .replace(/TRUE/g, '1')
      .replace(/FALSE/g, '0');
    
    // Split SQL into individual statements and execute them sequentially
    const statements = sqliteSql.split(';').map(stmt => stmt.trim()).filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    db.serialize(() => {
      let completed = 0;
      const total = statements.length;
      
      if (total === 0) {
        console.log('No SQL statements to execute');
        insertDefaultUser();
        return;
      }
      
      statements.forEach((stmt, index) => {
        db.run(stmt, (err) => {
          if (err) {
            console.error(`Error executing statement ${index + 1}:`, stmt.substring(0, 50), err);
          } else {
            completed++;
            console.log(`Executed statement ${completed}/${total}`);
            if (completed === total) {
              console.log('Database initialized successfully');
              insertDefaultUser();
            }
          }
        });
      });
    });
  }
}

// Insert default user for testing
function insertDefaultUser() {
  const bcrypt = require('bcryptjs');
  
  // Check if default user already exists
  db.get('SELECT id FROM users WHERE email = ?', ['admin@fintrack.com'], (err, row) => {
    if (err) {
      console.error('Error checking for default user:', err);
      return;
    }
    
    if (!row) {
      // Create default user
      bcrypt.hash('admin123', 10, (err, hashedPassword) => {
        if (err) {
          console.error('Error hashing password:', err);
          return;
        }
        
        db.run(
          'INSERT INTO users (name, email, password_hash, phone, is_verified) VALUES (?, ?, ?, ?, ?)',
          ['Admin User', 'admin@fintrack.com', hashedPassword, '1234567890', 1],
          function(err) {
            if (err) {
              console.error('Error inserting default user:', err);
            } else {
              console.log('Default user created: admin@fintrack.com / admin123');
            }
          }
        );
      });
    } else {
      console.log('Default user already exists');
    }
  });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/savings', require('./routes/savings'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/ipos', require('./routes/ipos'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));

// WebSocket for real-time data
const wss = new WebSocket.Server({ port: 8081 });
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log('Received:', message);
  });
  ws.send('Welcome to FinTrackPro WebSocket');
});

// Cron job for updating IPO info daily
// cron.schedule('0 0 * * *', () => {
//   console.log('Running daily IPO update');
//   // Implement IPO update logic here
// });

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;