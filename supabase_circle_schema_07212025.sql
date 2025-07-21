
-- ENUM for meeting frequency
create type meeting_frequency as enum ('Weekly', '1st & 3rd', '1st & 4th', 'Other');

-- Main table: Circle Leaders
create table if not exists circle_leaders (
  id uuid primary key default gen_random_uuid(),

  full_name text not null,
  photo_url text,
  email text,
  phone text,
  status text check (status in ('invite', 'pipeline', 'leader')) default 'invite',

  campus text,
  ccb_group_id text,
  ccb_group_link text,
  meeting_day text,
  meeting_time text,
  meeting_frequency meeting_frequency,
  circle_type text,
  circle_location text,

  last_comm_date date,
  last_comm_type text,
  comments text[], -- Will migrate to a comments table for better structure

  last_monthly_connection date,
  last_one_on_one date,
  last_circle_visit date,
  last_leader_training date,

  next_meeting date,
  follow_up_needed boolean default false,

  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table: Comments (structured)
create table if not exists circle_comments (
  id uuid primary key default gen_random_uuid(),
  leader_id uuid references circle_leaders(id) on delete cascade,
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table: Authenticated Users (optional)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text check (role in ('admin', 'coach', 'viewer')) default 'viewer'
);

-- Table: Meetings (structured milestone tracking)
create table if not exists leader_meetings (
  id uuid primary key default gen_random_uuid(),
  leader_id uuid references circle_leaders(id) on delete cascade,
  type text, -- e.g., 'monthly connection', 'one-on-one', etc.
  date date,
  notes text
);

-- Table: Circle metadata (optional reuse of common types)
create table if not exists circle_metadata (
  id serial primary key,
  type text,
  frequency meeting_frequency,
  location text
);

-- Table: Tags (labels for filtering)
create table if not exists leader_tags (
  id uuid primary key default gen_random_uuid(),
  leader_id uuid references circle_leaders(id) on delete cascade,
  tag text
);

-- Table: Activity Log
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  leader_id uuid references circle_leaders(id) on delete cascade,
  user_id uuid references auth.users,
  action text,
  timestamp timestamp with time zone default timezone('utc'::text, now())
);
