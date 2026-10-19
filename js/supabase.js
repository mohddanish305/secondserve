/**
 * Second Serve — Supabase Client Loader with CDN Fallbacks
 * TRD v2.0 §16.3
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const CDNS = [
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm",
  "https://esm.sh/@supabase/supabase-js@2.45.4"
];

let clientPromise;

export function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      // If unconfigured placeholder, note it clearly
      for (const url of CDNS) {
        try {
          const { createClient } = await import(url);
          if (createClient) {
            return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
              auth: {
                persistSession: true,
                autoRefreshToken: true,
                storageKey: 'second-serve-auth'
              }
            });
          }
        } catch (e) {
          // Try next CDN
        }
      }
      throw new Error("BACKEND_UNAVAILABLE");
    })();
  }
  return clientPromise;
}
