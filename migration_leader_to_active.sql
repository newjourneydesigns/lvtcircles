-- Migration script to change "leader" status to "active"
-- Run this against your Supabase database

-- Step 1: Update existing records that have status 'leader' to 'active'
UPDATE circle_leaders 
SET status = 'active' 
WHERE status = 'leader';

-- Step 2: Drop the existing check constraint
ALTER TABLE circle_leaders 
DROP CONSTRAINT IF EXISTS circle_leaders_status_check;

-- Step 3: Add new check constraint with 'active' instead of 'leader'
ALTER TABLE circle_leaders 
ADD CONSTRAINT circle_leaders_status_check 
CHECK (status IN ('invite', 'pipeline', 'active', 'paused'));

-- Verify the changes
SELECT status, COUNT(*) as count 
FROM circle_leaders 
GROUP BY status 
ORDER BY status;
