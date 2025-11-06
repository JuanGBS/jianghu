import { createClient } from '@supabase/supabase-js';

// --- INSTRUÇÕES IMPORTANTES ---
// 1. Vá para o dashboard do seu projeto no Supabase.
// 2. Vá para Project Settings > API.
// 3. Copie a URL do Projeto e a chave 'anon' 'public' e cole-as abaixo.

const supabaseUrl = 'https://jgsucvfebonkaunlbbow.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnc3VjdmZlYm9ua2F1bmxiYm93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDg3MjUsImV4cCI6MjA3NzkyNDcyNX0.yDXkk22vx0kYcgLMO3JiejDf1YjGX9u_UuujWVTZ6b4';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required. Check your .env file or supabaseClient.js");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);