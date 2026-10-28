import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.acqhlblaimfurcpyjnou.supabase.co;
const supabaseAnonKey = import.meta.env.sb_publishable_QWW0r4g8U3qO44CM3DYAhQ_ZzkTur-s;

console.log("Supabase URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
