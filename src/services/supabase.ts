import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && publishableKey);

export const supabaseConfigurationError =
  "Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en .env.local.";

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, publishableKey)
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(supabaseConfigurationError);
  }

  return supabase;
}