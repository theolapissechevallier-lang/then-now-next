// Re-export the Lovable Cloud generated client so all app code uses a single instance.
import { supabase as cloudClient } from "@/integrations/supabase/client";

let _client: typeof cloudClient | null = null;
try {
  _client = cloudClient;
} catch (e) {
  console.warn("Cloud client unavailable, running in local-only mode.", e);
  _client = null;
}

export const supabase = _client;

export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}
