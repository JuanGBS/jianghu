import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jgsucvfebonkaunlbbow.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnc3VjdmZlYm9ua2F1bmxiYm93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDg3MjUsImV4cCI6MjA3NzkyNDcyNX0.yDXkk22vx0kYcgLMO3JiejDf1YjGX9u_UuujWVTZ6b4";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

const PROJECT_STORAGE_KEY = 'jianghu_auth_token_v1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: PROJECT_STORAGE_KEY,
  }
});