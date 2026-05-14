import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listLegacies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("legacies")
      .select("id,title,description,plan,cover_color,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { legacies: data ?? [] };
  });

export const createLegacy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        title: z.string().min(1).max(120),
        description: z.string().max(500).optional(),
        cover_color: z.enum(["pink", "yellow", "lime", "sky"]).default("pink"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("legacies")
      .insert({
        user_id: context.userId,
        title: data.title,
        description: data.description ?? null,
        cover_color: data.cover_color,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { legacy: row };
  });

export const deleteLegacy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("legacies")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getLegacy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const [{ data: legacy }, { data: memories }] = await Promise.all([
      context.supabase.from("legacies").select("*").eq("id", data.id).single(),
      context.supabase
        .from("memories")
        .select("*")
        .eq("legacy_id", data.id)
        .order("created_at", { ascending: false }),
    ]);
    return { legacy, memories: memories ?? [] };
  });

export const addMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        legacy_id: z.string().uuid(),
        kind: z.enum(["photo", "voice", "letter", "recipe", "document"]),
        title: z.string().min(1).max(160),
        body: z.string().max(5000).optional(),
        scheduled_for: z.string().datetime().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("memories")
      .insert({
        legacy_id: data.legacy_id,
        user_id: context.userId,
        kind: data.kind,
        title: data.title,
        body: data.body ?? null,
        scheduled_for: data.scheduled_for ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { memory: row };
  });

export const deleteMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("memories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
