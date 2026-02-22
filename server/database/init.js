const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const dbPath = path.join(dbDir, 'classified_ads.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  -- Ads table
  CREATE TABLE IF NOT EXISTS ads (
    id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    country TEXT NOT NULL,
    category TEXT NOT NULL,
    duration TEXT NOT NULL,
    image_path TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved')),
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  -- Admin table
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Create indexes for better query performance
  CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
  CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at);
  CREATE INDEX IF NOT EXISTS idx_ads_category ON ads(category);
  CREATE INDEX IF NOT EXISTS idx_ads_expires_at ON ads(expires_at);
`);

// Initialize admin user if not exists
const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

const existingAdmin = db.prepare('SELECT * FROM admin WHERE username = ?').get(adminUsername);

if (!existingAdmin) {
  const passwordHash = bcrypt.hashSync(adminPassword, 10);
  db.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)').run(adminUsername, passwordHash);
  console.log(`Admin user '${adminUsername}' created successfully`);
} else {
  console.log(`Admin user '${adminUsername}' already exists`);
}

module.exports = db;
