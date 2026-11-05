CREATE TABLE IF NOT EXISTS events (
 id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL,
 session TEXT NOT NULL, path TEXT NOT NULL, referrer TEXT NOT NULL DEFAULT 'Direct',
 source TEXT NOT NULL DEFAULT '', medium TEXT NOT NULL DEFAULT '', campaign TEXT NOT NULL DEFAULT '',
 device TEXT NOT NULL DEFAULT 'desktop', properties TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS events_created ON events(created_at);
CREATE INDEX IF NOT EXISTS events_path ON events(path,created_at);
CREATE TABLE IF NOT EXISTS inquiries (
 id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL,
 message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','reviewed','archived'))
);
CREATE INDEX IF NOT EXISTS inquiries_created ON inquiries(created_at);
CREATE TABLE IF NOT EXISTS request_limits (key TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, count INTEGER NOT NULL);
