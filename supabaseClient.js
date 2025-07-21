import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eruboulvrgrodccmjjbe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVydWJvdWx2cmdyb2RjY21qamJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTMzOTUsImV4cCI6MjA2ODY2OTM5NX0.FJ0nu1Ov8jbAdZy8SX9qs2gJ60_qdROsIkwRg8k9GK0';

export const supabase = createClient(supabaseUrl, supabaseKey)

