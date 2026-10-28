import { createClient } from '@supabase/supabase-js';

// Read values from Vite environment variables or fallback to project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://acqhlblaimfurcpyjnou.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QWW0r4g8U3qO44CM3DYAhQ_ZzkTur-s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
