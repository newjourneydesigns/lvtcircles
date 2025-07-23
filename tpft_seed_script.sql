
-- Seed Script for The Plan For Today App

-- Insert Pricing Tiers
INSERT INTO pricing_tiers (id, name, max_blocks_per_plan)
VALUES 
  ('tier-free', 'Free', 10),
  ('tier-pro', 'Pro', 100),
  ('tier-org', 'Organization', 1000)
ON CONFLICT (id) DO NOTHING;

-- Insert Test Organization
INSERT INTO orgs (id, name, ai_token_limit)
VALUES 
  ('org-demo-001', 'Demo Organization', 10000)
ON CONFLICT (id) DO NOTHING;

-- Insert Test Users
INSERT INTO users (id, email, full_name)
VALUES
  ('user-001', 'admin@example.com', 'Admin User'),
  ('user-002', 'editor@example.com', 'Editor User'),
  ('user-003', 'viewer@example.com', 'Viewer User')
ON CONFLICT (id) DO NOTHING;

-- Add Users to Org
INSERT INTO org_members (id, org_id, user_id, role)
VALUES
  (gen_random_uuid(), 'org-demo-001', 'user-001', 'admin'),
  (gen_random_uuid(), 'org-demo-001', 'user-002', 'editor'),
  (gen_random_uuid(), 'org-demo-001', 'user-003', 'viewer')
ON CONFLICT DO NOTHING;

-- Insert a Test Plan
INSERT INTO plans (id, org_id, title, status)
VALUES 
  ('plan-001', 'org-demo-001', 'Sample Plan', 'draft')
ON CONFLICT (id) DO NOTHING;

-- Insert Plan Blocks
INSERT INTO plan_blocks (id, plan_id, content, status, visible_from, visible_until)
VALUES
  ('block-001', 'plan-001', '{"type":"text","text":"Welcome to your plan!"}', 'published', now(), NULL),
  ('block-002', 'plan-001', '{"type":"checklist","items":["Item 1","Item 2"]}', 'draft', now(), NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert Checklist Assignments
INSERT INTO checklist_assignments (id, plan_block_id, assigned_user_id, due_date)
VALUES
  ('chk-001', 'block-002', 'user-002', now() + interval '7 days')
ON CONFLICT (id) DO NOTHING;

-- Seed Reusable Block
INSERT INTO reusable_blocks (id, title, content, created_by)
VALUES 
  ('reuse-001', 'Onboarding Checklist', '{"type":"checklist","items":["Sign contract","Read welcome doc"]}', 'user-001')
ON CONFLICT (id) DO NOTHING;

-- Link Reusable Block to Block
UPDATE plan_blocks SET reusable_block_id = 'reuse-001' WHERE id = 'block-002';

-- Grant Block Permission
INSERT INTO block_permissions (id, block_id, user_id, role)
VALUES 
  (gen_random_uuid(), 'block-001', 'user-003', 'viewer')
ON CONFLICT DO NOTHING;

-- Seed AI usage logs
INSERT INTO ai_usage (id, user_id, org_id, feature, tokens_used)
VALUES
  (gen_random_uuid(), 'user-001', 'org-demo-001', 'summarize_plan', 520)
ON CONFLICT DO NOTHING;
