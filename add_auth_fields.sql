-- Add username and password fields to users table
ALTER TABLE users ADD COLUMN username text UNIQUE;
ALTER TABLE users ADD COLUMN password_hash text;

-- Example: Insert a user with username and password
-- Passwords should be hashed before storing
-- INSERT INTO users (id, email, full_name, username, password_hash) VALUES ('user-004', 'login@example.com', 'Login User', 'loginuser', '<hashed_password>');
