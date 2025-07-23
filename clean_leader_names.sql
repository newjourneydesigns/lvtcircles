-- CLEAN UP CIRCLE LEADER NAMES
-- This script removes "LVT | S1 | " prefix from all Circle Leader names
-- Run this in your Supabase SQL Editor

-- Step 1: Preview what names will be changed (run this first to see what will be updated)
SELECT 
  id,
  full_name as current_name,
  CASE 
    WHEN full_name LIKE 'LVT | S1 | %' THEN TRIM(SUBSTRING(full_name FROM 12))
    WHEN full_name LIKE 'LVT|S1|%' THEN TRIM(SUBSTRING(full_name FROM 8))
    WHEN full_name LIKE 'LVT | S1|%' THEN TRIM(SUBSTRING(full_name FROM 10))
    WHEN full_name LIKE 'LVT|S1 |%' THEN TRIM(SUBSTRING(full_name FROM 9))
    ELSE full_name
  END as cleaned_name
FROM circle_leaders 
WHERE full_name LIKE 'LVT%S1%' OR full_name LIKE '%LVT%' OR full_name LIKE '%S1%';

-- Step 2: Actually update the names (uncomment and run after reviewing the preview)
/*
UPDATE circle_leaders 
SET 
  full_name = CASE 
    WHEN full_name LIKE 'LVT | S1 | %' THEN TRIM(SUBSTRING(full_name FROM 12))
    WHEN full_name LIKE 'LVT|S1|%' THEN TRIM(SUBSTRING(full_name FROM 8))
    WHEN full_name LIKE 'LVT | S1|%' THEN TRIM(SUBSTRING(full_name FROM 10))
    WHEN full_name LIKE 'LVT|S1 |%' THEN TRIM(SUBSTRING(full_name FROM 9))
    ELSE full_name
  END,
  updated_at = NOW()
WHERE full_name LIKE 'LVT%S1%' OR full_name LIKE '%LVT%' OR full_name LIKE '%S1%';
*/

-- Step 3: Verify the changes (run after the update)
/*
SELECT 
  full_name,
  COUNT(*) as count
FROM circle_leaders 
GROUP BY full_name
ORDER BY full_name;
*/

-- Alternative: If you want to be more specific and only target exact "LVT | S1 | " prefix:
-- UPDATE circle_leaders 
-- SET 
--   full_name = TRIM(SUBSTRING(full_name FROM 12)),
--   updated_at = NOW()
-- WHERE full_name LIKE 'LVT | S1 | %';
