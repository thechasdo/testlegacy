import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function makeToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function assertShareOwner(
  context: { supabase: any; userId: string },
  id: string,
) {
  const { data: row, error } = await context.supabase
    .from("legacy_shares")
    .select("user_id")
    .eq("id", id)
    .single();
  if (error || !row) throw new Error("Share not found");
  if (row.user_id !== context.userId) throw new Error("Not allowed");
}

export const listShares = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ legacy_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("legacy_shares")
      .select("*")
      .eq("legacy_id", data.legacy_id)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { shares: rows ?? [] };
  });

export const createShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        legacy_id: z.string().uuid(),
        label: z.string().max(80).optional(),
        expires_in_hours: z.number().int().min(1).max(24 * 365).nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: legacy, error: lerr } = await context.supabase
      .from("legacies")
      .select("id,user_id")
      .eq("id", data.legacy_id)
      .single();
    if (lerr || !legacy) throw new Error("Soul not found");
    if (legacy.user_id !== context.userId) throw new Error("Not allowed");

    const expires_at =
      data.expires_in_hours != null
        ? new Date(Date.now() + data.expires_in_hours * 3600_000).toISOString()
        : null;

    const { data: row, error } = await context.supabase
      .from("legacy_shares")
      .insert({
        legacy_id: data.legacy_id,
        user_id: context.userId,
        token: makeToken(),
        label: data.label ?? null,
        expires_at,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { share: row };
  });

export const revokeShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertShareOwner(context, data.id);
    const { error } = await context.supabase
      .from("legacy_shares")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertShareOwner(context, data.id);
    const { error } = await context.supabase
      .from("legacy_shares")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
