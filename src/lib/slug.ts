import { SupabaseClient } from "@supabase/supabase-js";

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

// Generates a unique slug, appending -2, -3, etc. if already taken
export async function generateUniqueSlug(
  supabase: SupabaseClient,
  name: string,
  excludeId?: string
): Promise<string> {
  const base = toSlug(name);
  let candidate = base;
  let attempt = 1;

  while (true) {
    let query = supabase
      .from("restaurants")
      .select("id")
      .eq("slug", candidate);

    if (excludeId) query = query.neq("id", excludeId);

    const { data } = await query.maybeSingle();
    if (!data) return candidate;

    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
}
