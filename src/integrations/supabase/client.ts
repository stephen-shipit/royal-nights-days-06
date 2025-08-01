// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://twbqokjjdopxcgiiuluz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YnFva2pqZG9weGNnaWl1bHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTUzMTYsImV4cCI6MjA2ODc3MTMxNn0.r98rEFBnbJaJg4Qesmxfht8zPNsm3keFvnDBp5z4DxY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});