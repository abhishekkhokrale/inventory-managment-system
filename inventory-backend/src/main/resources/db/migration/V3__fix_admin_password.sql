-- Fix admin user password with a valid BCrypt hash
-- Password: Admin@123
UPDATE users
SET password = '$2b$10$N8Q8gyFNSB/qSfMteATsoOAUWPRmsywKD3ZmduOXJEcN5rp73wJy6'
WHERE username = 'admin';
