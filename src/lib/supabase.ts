// Re-export the Lovable Cloud generated client as an untyped instance so the legacy
// app code (which uses ad-hoc snake_case payloads) keeps working without a full
// types refactor. Always import the single client from "@/lib/supabase".
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as cloudClient } from "@/integrations/supabase/client";

let _client: SupabaseClient | null = null;
try {
  _client = cloudClient as unknown as SupabaseClient;
} catch (e) {
  console.warn("Cloud client unavailable, running in local-only mode.", e);
  _client = null;
}

export const supabase = _client;

export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}
