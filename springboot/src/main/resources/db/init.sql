-- Drop existing objects if they exist to avoid conflicts
DROP TABLE IF EXISTS "descripto-ai".user_roles CASCADE;
DROP TABLE IF EXISTS "descripto-ai".users CASCADE;

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS "descripto-ai";

-- Set the search path
SET search_path TO "descripto-ai";

-- Create users table
CREATE TABLE IF NOT EXISTS "descripto-ai".users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile_number VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT true,
    verified BOOLEAN NOT NULL DEFAULT false,
    verification_token VARCHAR(255),
    verification_token_expiry TIMESTAMP WITH TIME ZONE,
    mobile_verified BOOLEAN NOT NULL DEFAULT false,
    mobile_verification_code VARCHAR(6),
    mobile_verification_code_expiry TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS "descripto-ai".user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(255) NOT NULL,
    CONSTRAINT fk_user_roles_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES "descripto-ai".users(id) 
        ON DELETE CASCADE,
    PRIMARY KEY (user_id, role)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON "descripto-ai".users(email);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON "descripto-ai".users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON "descripto-ai".user_roles(user_id);

-- Create admin user with hashed password (using BCrypt hash for 'admin')
INSERT INTO "descripto-ai".users (
    email, 
    password_hash, 
    first_name,
    last_name,
    active,
    verified,
    mobile_verified
) VALUES (
    'admin@descripto.ai',
    '$2a$10$KiHmM0IhbLdZXmvIXPW2/exSh1s9DUKzTBk8rYcsOlWracJap2sJ.',
    'Admin',
    'User',
    true,
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Assign admin role to admin user
INSERT INTO "descripto-ai".user_roles (user_id, role)
SELECT id, 'ROLE_ADMIN'
FROM "descripto-ai".users
WHERE email = 'admin@descripto.ai'
ON CONFLICT DO NOTHING;