import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';


let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials are missing. Set `extra.supabaseUrl` and `extra.supabaseAnonKey` in app.json');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return supabaseClient;
}


