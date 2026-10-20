import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_URL = url || "";
export const SUPABASE_ANON_KEY = key || "";

export function isConfiguredRemote() {
  return Boolean(
    url &&
    key &&
    !url.includes("second-serve-demo.supabase.co") &&
    !url.includes("YOUR-PROJECT-REF")
  );
}

export const backendConfigured = Boolean(url && key);

export const supabase = backendConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

export function getClient() {
  return supabase;
}

