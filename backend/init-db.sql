-- init-db.sql
-- Runs on first Postgres container startup.
-- Prisma handles all schema creation via db:push or migrations.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE gifthance TO gifthance;