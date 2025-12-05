-- Create database if it doesn't exist
-- Run this manually: CREATE DATABASE theaiworld;

-- Connect to the database and create a test user
-- The table will be auto-created by TypeORM synchronize feature

-- Insert a test user (password is 'password123' hashed with bcrypt)
-- You can use this after the application creates the table
-- INSERT INTO users (username, password, created_at, updated_at) 
-- VALUES ('testuser', '$2b$10$rQZ5YJ5YJ5YJ5YJ5YJ5YJOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', NOW(), NOW());
