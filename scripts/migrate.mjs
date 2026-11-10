import { createClient } from '@libsql/client';

const url = process.env.DB_URL || 'file:/app/data/reparbre.db';
const client = createClient({ url });

await client.executeBatch([
	`CREATE TABLE IF NOT EXISTS trees (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		species TEXT NOT NULL,
		lat REAL NOT NULL,
		lng REAL NOT NULL,
		address TEXT,
		description TEXT,
		photo_url TEXT,
		created_at INTEGER NOT NULL
	)`,
	`CREATE TABLE IF NOT EXISTS weekly_trees (
		id TEXT PRIMARY KEY,
		tree_id TEXT NOT NULL REFERENCES trees(id),
		week_start TEXT NOT NULL,
		created_at INTEGER NOT NULL,
		UNIQUE(week_start)
	)`,
	`CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		google_sub TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL,
		name TEXT NOT NULL,
		avatar_url TEXT,
		created_at INTEGER NOT NULL
	)`,
	`CREATE TABLE IF NOT EXISTS sessions (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES users(id),
		expires_at INTEGER NOT NULL,
		created_at INTEGER NOT NULL
	)`,
	`CREATE TABLE IF NOT EXISTS hugs (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES users(id),
		tree_id TEXT NOT NULL REFERENCES trees(id),
		week_start TEXT NOT NULL,
		started_at INTEGER NOT NULL,
		ended_at INTEGER,
		duration_s INTEGER,
		points INTEGER,
		lat REAL NOT NULL,
		lng REAL NOT NULL
	)`,
	`CREATE INDEX IF NOT EXISTS hugs_user_idx ON hugs(user_id)`,
	`CREATE INDEX IF NOT EXISTS hugs_week_idx ON hugs(week_start)`,
	`CREATE INDEX IF NOT EXISTS hugs_tree_idx ON hugs(tree_id)`,
	`CREATE TABLE IF NOT EXISTS intentions (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES users(id),
		text TEXT NOT NULL,
		cost INTEGER NOT NULL DEFAULT 10,
		status TEXT NOT NULL DEFAULT 'planned',
		created_at INTEGER NOT NULL,
		done_at INTEGER
	)`,
	`CREATE INDEX IF NOT EXISTS intentions_user_idx ON intentions(user_id)`
]);

console.log('✓ Migration terminée');
