# Database Migration: Leader Status to Active

## Problem
The application was updated to use "Active" instead of "Leader" for the status, but the database still has a constraint that only allows the old values including "leader".

## Solution
Run the migration script `migration_leader_to_active.sql` against your Supabase database.

## Steps to Apply Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `migration_leader_to_active.sql`
4. Run the script

### Option 2: Using Supabase CLI
```bash
supabase db reset --debug
# or apply the migration directly
```

### Option 3: Manual SQL Execution
Connect to your database and run these commands in order:

```sql
-- Update existing records
UPDATE circle_leaders 
SET status = 'active' 
WHERE status = 'leader';

-- Drop old constraint
ALTER TABLE circle_leaders 
DROP CONSTRAINT IF EXISTS circle_leaders_status_check;

-- Add new constraint
ALTER TABLE circle_leaders 
ADD CONSTRAINT circle_leaders_status_check 
CHECK (status IN ('invite', 'pipeline', 'active', 'paused'));
```

## Verification
After running the migration, verify with:
```sql
SELECT status, COUNT(*) as count 
FROM circle_leaders 
GROUP BY status 
ORDER BY status;
```

You should see "active" instead of "leader" in the results.

## What This Migration Does
1. **Updates Data**: Changes all existing records with status 'leader' to 'active'
2. **Updates Constraint**: Removes the old database constraint and adds a new one that accepts 'active' instead of 'leader'
3. **Maintains Compatibility**: All other status values ('invite', 'pipeline', 'paused') remain unchanged
