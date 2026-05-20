import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listInvitations,
  createInvitation,
  revokeInvitation,
  deleteInvitation,
} from "@/lib/invite.functions";

const EXPIRY_OPTIONS = [
  { label: "24 hours", hours: 24 },
  { label: "7 days", hours: 24 * 7 },
  { label: "30 days", hours: 24 * 30 },
  { label: "1 year", hours: 24 * 365 },
  { label: "Never", hours: null as number | null },
];

export function InviteSoulPanel({ legacyId }: { legacyId: string }) {
  const list = useServerFn(listInvitations);
  const create = useServerFn(createInvitation);
  const revoke = useServerFn(revokeInvitation);
  const del = useServerFn(deleteInvitation);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["invitations", legacyId],
    queryFn: () => list({ data: { legacy_id: legacyId } }),
  });
  const refresh = () =>
    qc.invalidateQueries({ queryKey: ["invitations", legacyId] });

  const createMut = useMutation({
    mutationFn: (input: {
      recipient_email: string;
      recipient_name?: string;
      message?: string;
      permission: "read" | "export";
      expires_in_hours: number | null;
    }) => create({ data: { legacy_id: legacyId, ...input } }),
    onSuccess: refresh,
  });
  const revokeMut = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: refresh,
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: refresh,
  });

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [permission, setPermission] = useState<"read" | "export">("read");
  const [hours, setHours] = useState<number | null>(24 * 30);
  const [copied, setCopied] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <section className="mt-10 bg-white border-2 border-pop-ink rounded-3xl p-6 shadow-pop-pink">
      <div>
        <h2 className="font-display text-2xl uppercase text-pop-pink">
          Invite a soul
        </h2>
        <p className="text-sm font-semibold text-pop-ink/70">
          Send a personal invitation to a recipient. Choose read-only or allow
          export. Revoke anytime.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.trim()) return;
          createMut.mutate({
            recipient_email: email.trim(),
            recipient_name: name.trim() || undefined,
            message: msg.trim() || undefined,
            permission,
            expires_in_hours: hours,
          });
          setEmail("");
          setName("");
          setMsg("");
        }}
        className="mt-5 grid gap-3 sm:grid-cols-2"
      >
        <input
          required
          type="email"
          placeholder="Recipient email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={200}
          className="px-4 py-3 rounded-xl border-2 border-pop-ink font-semibold"
        />
        <input
          placeholder="Recipient name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className="px-4 py-3 rounded-xl border-2 border-pop-ink font-semibold"
        />
        <textarea
          placeholder="Personal message (optional)"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          maxLength={500}
          rows={2}
          className="sm:col-span-2 px-4 py-3 rounded-xl border-2 border-pop-ink font-semibold"
        />
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold uppercase text-pop-ink/70">
            Access:
          </span>
          {(["read", "export"] as const).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setPermission(p)}
              className={`px-3 py-2 rounded-full border-2 border-pop-ink text-xs font-bold uppercase ${
                permission === p ? "bg-pop-lime" : "bg-white opacity-70"
              }`}
            >
              {p === "read" ? "👁 Read" : "⬇ Read + Export"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center sm:justify-end">
          <select
            value={hours === null ? "null" : String(hours)}
            onChange={(e) =>
              setHours(
                e.target.value === "null" ? null : Number(e.target.value),
              )
            }
            className="px-4 py-3 rounded-xl border-2 border-pop-ink font-bold uppercase text-xs bg-pop-yellow"
          >
            {EXPIRY_OPTIONS.map((o) => (
              <option
                key={o.label}
                value={o.hours === null ? "null" : o.hours}
              >
                {o.label}
              </option>
            ))}
          </select>
          <button
            disabled={createMut.isPending}
            className="px-6 py-3 rounded-full bg-pop-pink text-white font-bold uppercase text-sm border-2 border-pop-ink shadow-pop-blue disabled:opacity-60"
          >
            ✉ Send invite
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {isLoading && (
          <p className="text-sm font-bold text-pop-ink/60">Loading…</p>
        )}
        {data?.invitations.length === 0 && (
          <p className="text-sm font-semibold text-pop-ink/60">
            No invitations yet.
          </p>
        )}
        {data?.invitations.map((inv) => {
          const url = `${origin}/invite/${
            // token isn't returned for safety in list? It IS — owner only via RLS.
            (inv as unknown as { token: string }).token
          }`;
          const expired =
            inv.expires_at && new Date(inv.expires_at) < new Date();
          const status = inv.revoked_at
            ? { label: "Revoked", bg: "bg-pop-pink text-white" }
            : expired
              ? { label: "Expired", bg: "bg-pop-ink text-white" }
              : inv.accepted_at
                ? { label: "Opened", bg: "bg-pop-sky text-pop-ink" }
                : { label: "Pending", bg: "bg-pop-lime text-pop-ink" };

          return (
            <div
              key={inv.id}
              className="border-2 border-pop-ink rounded-2xl p-4 bg-pop-cream"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`${status.bg} text-[10px] font-bold uppercase tracking-widest border-2 border-pop-ink rounded-full px-2 py-0.5`}
                  >
                    {status.label}
                  </span>
                  <span className="font-bold text-sm">
                    {inv.recipient_name
                      ? `${inv.recipient_name} · ${inv.recipient_email}`
                      : inv.recipient_email}
                  </span>
                  <span className="bg-white border-2 border-pop-ink rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                    {inv.permission === "export" ? "Read + Export" : "Read"}
                  </span>
                </div>
                <span className="text-[11px] font-bold uppercase text-pop-ink/60">
                  {inv.expires_at
                    ? `Expires ${new Date(inv.expires_at).toLocaleString()}`
                    : "Never expires"}{" "}
                  · {inv.view_count} view{inv.view_count === 1 ? "" : "s"}
                </span>
              </div>
              {inv.message && (
                <p className="mt-2 text-xs italic text-pop-ink/70">
                  “{inv.message}”
                </p>
              )}

              <div className="mt-3 flex gap-2 items-stretch flex-wrap">
                <input
                  readOnly
                  value={url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border-2 border-pop-ink font-mono text-xs bg-white"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(url);
                      setCopied(inv.id);
                      setTimeout(() => setCopied(null), 1500);
                    } catch {
                      // ignore
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-pop-yellow border-2 border-pop-ink font-bold uppercase text-xs"
                >
                  {copied === inv.id ? "Copied!" : "Copy link"}
                </button>
                <a
                  href={`mailto:${encodeURIComponent(
                    inv.recipient_email,
                  )}?subject=${encodeURIComponent(
                    "You've been invited to a Legacy by chasdo",
                  )}&body=${encodeURIComponent(
                    `${inv.message ? inv.message + "\n\n" : ""}Open your invitation: ${url}`,
                  )}`}
                  className="px-3 py-2 rounded-lg bg-pop-blue text-white border-2 border-pop-ink font-bold uppercase text-xs"
                >
                  ✉ Email
                </a>
                {!inv.revoked_at && !expired && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          "Revoke this invitation? The recipient will lose access immediately.",
                        )
                      )
                        revokeMut.mutate(inv.id);
                    }}
                    className="px-3 py-2 rounded-lg bg-white border-2 border-pop-ink font-bold uppercase text-xs hover:bg-pop-pink hover:text-white"
                  >
                    Revoke
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this invitation?"))
                      delMut.mutate(inv.id);
                  }}
                  className="px-3 py-2 rounded-lg bg-white border-2 border-pop-ink font-bold uppercase text-xs hover:bg-pop-ink hover:text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
