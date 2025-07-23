-- MANUAL MIGRATION SCRIPT
-- Copy and paste this into your Supabase SQL Editor and run it

-- Step 1: Drop the existing check constraint first
ALTER TABLE circle_leaders 
DROP CONSTRAINT IF EXISTS circle_leaders_status_check;

-- Step 2: Update existing records that have status 'leader' to 'active'
UPDATE circle_leaders 
SET status = 'active' 
WHERE status = 'leader';

-- Step 3: Add new check constraint with 'active' instead of 'leader'
ALTER TABLE circle_leaders 
ADD CONSTRAINT circle_leaders_status_check 
CHECK (status IN ('invite', 'pipeline', 'active', 'paused'));

-- Step 4: Verify the changes
SELECT status, COUNT(*) as count 
FROM circle_leaders 
GROUP BY status 
ORDER BY status;
