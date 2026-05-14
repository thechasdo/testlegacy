import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getSharedSoul = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({ token: z.string().min(16).max(128) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: share, error } = await supabaseAdmin
      .from("legacy_shares")
      .select("id,legacy_id,expires_at,revoked_at,label,view_count")
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!share) return { status: "not_found" as const };
    if (share.revoked_at) return { status: "revoked" as const };
    if (share.expires_at && new Date(share.expires_at) < new Date())
      return { status: "expired" as const };

    const [{ data: legacy }, { data: memories }] = await Promise.all([
      supabaseAdmin
        .from("legacies")
        .select("id,title,description,cover_color,plan,created_at")
        .eq("id", share.legacy_id)
        .single(),
      supabaseAdmin
        .from("memories")
        .select("id,kind,title,body,scheduled_for,created_at")
        .eq("legacy_id", share.legacy_id)
        .order("created_at", { ascending: false }),
    ]);

    await supabaseAdmin
      .from("legacy_shares")
      .update({ view_count: (share.view_count ?? 0) + 1 })
      .eq("id", share.id);

    return {
      status: "ok" as const,
      label: share.label,
      expires_at: share.expires_at,
      legacy,
      memories: memories ?? [],
    };
  });
