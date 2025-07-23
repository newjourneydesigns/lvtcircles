-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  leader_id uuid,
  user_id uuid,
  action text,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT activity_log_pkey PRIMARY KEY (id),
  CONSTRAINT activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT activity_log_leader_id_fkey FOREIGN KEY (leader_id) REFERENCES public.circle_leaders(id)
);
CREATE TABLE public.circle_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  leader_id uuid,
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT circle_comments_pkey PRIMARY KEY (id),
  CONSTRAINT circle_comments_leader_id_fkey FOREIGN KEY (leader_id) REFERENCES public.circle_leaders(id)
);
CREATE TABLE public.circle_leaders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  photo_url text,
  email text,
  phone text,
  status text DEFAULT 'invite'::text CHECK (status = ANY (ARRAY['invite'::text, 'pipeline'::text, 'active'::text, 'paused'::text])),
  campus text,
  ccb_group_id text,
  ccb_group_link text,
  meeting_day text,
  meeting_time text,
  meeting_frequency USER-DEFINED,
  circle_type text,
  circle_location text,
  last_comm_date date,
  last_comm_type text,
  comments ARRAY,
  last_monthly_connection date,
  last_one_on_one date,
  last_circle_visit date,
  last_leader_training date,
  next_meeting date,
  follow_up_needed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT circle_leaders_pkey PRIMARY KEY (id)
);
CREATE TABLE public.circle_metadata (
  id integer NOT NULL DEFAULT nextval('circle_metadata_id_seq'::regclass),
  type text,
  frequency USER-DEFINED,
  location text,
  CONSTRAINT circle_metadata_pkey PRIMARY KEY (id)
);
CREATE TABLE public.leader_meetings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  leader_id uuid,
  type text,
  date date,
  notes text,
  CONSTRAINT leader_meetings_pkey PRIMARY KEY (id),
  CONSTRAINT leader_meetings_leader_id_fkey FOREIGN KEY (leader_id) REFERENCES public.circle_leaders(id)
);
CREATE TABLE public.leader_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  leader_id uuid,
  tag text,
  CONSTRAINT leader_tags_pkey PRIMARY KEY (id),
  CONSTRAINT leader_tags_leader_id_fkey FOREIGN KEY (leader_id) REFERENCES public.circle_leaders(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  role text DEFAULT 'viewer'::text CHECK (role = ANY (ARRAY['admin'::text, 'coach'::text, 'viewer'::text])),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);