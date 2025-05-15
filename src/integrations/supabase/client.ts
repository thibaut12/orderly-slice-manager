
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://iqavqzopcjyhvqszzkmv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYXZxem9wY2p5aHZxc3p6a212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NTYzNzcsImV4cCI6MjA1ODEzMjM3N30.iIa3qN5nK4hZ54W_HZ519CA5IoWc4DFPJ9nH4L5yiSc";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});
