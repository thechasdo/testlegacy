import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function makeToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const listInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ legacy_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("legacy_invitations")
      .select("*")
      .eq("legacy_id", data.legacy_id)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { invitations: rows ?? [] };
  });

export const createInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        legacy_id: z.string().uuid(),
        recipient_email: z.string().email().max(200),
        recipient_name: z.string().max(120).optional(),
        message: z.string().max(500).optional(),
        permission: z.enum(["read", "export"]).default("read"),
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
      .from("legacy_invitations")
      .insert({
        legacy_id: data.legacy_id,
        user_id: context.userId,
        token: makeToken(),
        recipient_email: data.recipient_email,
        recipient_name: data.recipient_name ?? null,
        message: data.message ?? null,
        permission: data.permission,
        expires_at,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { invitation: row };
  });

async function assertInviteOwner(
  context: { supabase: any; userId: string },
  id: string,
) {
  const { data: row, error } = await context.supabase
    .from("legacy_invitations")
    .select("user_id")
    .eq("id", id)
    .single();
  if (error || !row) throw new Error("Invitation not found");
  if (row.user_id !== context.userId) throw new Error("Not allowed");
}

export const revokeInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertInviteOwner(context, data.id);
    const { error } = await context.supabase
      .from("legacy_invitations")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertInviteOwner(context, data.id);
    const { error } = await context.supabase
      .from("legacy_invitations")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Public: open an invitation by token
export const openInvitation = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({ token: z.string().min(16).max(128) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: invite, error } = await supabaseAdmin
      .from("legacy_invitations")
      .select(
        "id,legacy_id,recipient_email,recipient_name,message,permission,expires_at,revoked_at,accepted_at,view_count",
      )
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!invite) return { status: "not_found" as const };
    if (invite.revoked_at) return { status: "revoked" as const };
    if (invite.expires_at && new Date(invite.expires_at) < new Date())
      return { status: "expired" as const };

    const [{ data: legacy }, { data: memories }] = await Promise.all([
      supabaseAdmin
        .from("legacies")
        .select("id,title,description,cover_color,plan,created_at")
        .eq("id", invite.legacy_id)
        .single(),
      supabaseAdmin
        .from("memories")
        .select("id,kind,title,body,scheduled_for,created_at")
        .eq("legacy_id", invite.legacy_id)
        .order("created_at", { ascending: false }),
    ]);

    await supabaseAdmin
      .from("legacy_invitations")
      .update({
        view_count: (invite.view_count ?? 0) + 1,
        accepted_at: invite.accepted_at ?? new Date().toISOString(),
      })
      .eq("id", invite.id);

    return {
      status: "ok" as const,
      invite: {
        recipient_email: invite.recipient_email,
        recipient_name: invite.recipient_name,
        message: invite.message,
        permission: invite.permission,
        expires_at: invite.expires_at,
      },
      legacy,
      memories: memories ?? [],
    };
  });
