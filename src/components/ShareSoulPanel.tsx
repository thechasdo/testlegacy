import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listShares,
  createShare,
  revokeShare,
  deleteShare,
} from "@/lib/share.functions";

const EXPIRY_OPTIONS = [
  { label: "1 hour", hours: 1 },
  { label: "24 hours", hours: 24 },
  { label: "7 days", hours: 24 * 7 },
  { label: "30 days", hours: 24 * 30 },
  { label: "Never", hours: null as number | null },
];

export function ShareSoulPanel({ legacyId }: { legacyId: string }) {
  const list = useServerFn(listShares);
  const create = useServerFn(createShare);
  const revoke = useServerFn(revokeShare);
  const del = useServerFn(deleteShare);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["shares", legacyId],
    queryFn: () => list({ data: { legacy_id: legacyId } }),
  });

  const refresh = () =>
    qc.invalidateQueries({ queryKey: ["shares", legacyId] });

  const createMut = useMutation({
    mutationFn: (input: { label?: string; expires_in_hours: number | null }) =>
      create({
        data: {
          legacy_id: legacyId,
          label: input.label,
          expires_in_hours: input.expires_in_hours,
        },
      }),
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

  const [label, setLabel] = useState("");
  const [hours, setHours] = useState<number | null>(24 * 7);
  const [copied, setCopied] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <section className="mt-10 bg-white border-2 border-pop-ink rounded-3xl p-6 shadow-pop-blue">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl uppercase text-pop-blue">
            Share this soul
          </h2>
          <p className="text-sm font-semibold text-pop-ink/70">
            Send a secure read-only link. Set an expiry, revoke anytime.
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMut.mutate({
            label: label.trim() || undefined,
            expires_in_hours: hours,
          });
          setLabel("");
        }}
        className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]"
      >
        <input
          placeholder="Label (e.g. For Mom)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={80}
          className="px-4 py-3 rounded-xl border-2 border-pop-ink font-semibold"
        />
        <select
          value={hours === null ? "null" : String(hours)}
          onChange={(e) =>
            setHours(e.target.value === "null" ? null : Number(e.target.value))
          }
          className="px-4 py-3 rounded-xl border-2 border-pop-ink font-bold uppercase text-xs bg-pop-yellow"
        >
          {EXPIRY_OPTIONS.map((o) => (
            <option key={o.label} value={o.hours === null ? "null" : o.hours}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          disabled={createMut.isPending}
          className="px-6 py-3 rounded-full bg-pop-blue text-white font-bold uppercase text-sm border-2 border-pop-ink shadow-pop-pink disabled:opacity-60"
        >
          + New link
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {isLoading && (
          <p className="text-sm font-bold text-pop-ink/60">Loading…</p>
        )}
        {data?.shares.length === 0 && (
          <p className="text-sm font-semibold text-pop-ink/60">
            No share links yet.
          </p>
        )}
        {data?.shares.map((s) => {
          const url = `${origin}/s/${s.token}`;
          const expired =
            s.expires_at && new Date(s.expires_at) < new Date();
          const status = s.revoked_at
            ? { label: "Revoked", bg: "bg-pop-pink text-white" }
            : expired
              ? { label: "Expired", bg: "bg-pop-ink text-white" }
              : { label: "Active", bg: "bg-pop-lime text-pop-ink" };

          return (
            <div
              key={s.id}
              className="border-2 border-pop-ink rounded-2xl p-4 bg-pop-cream"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span
                    className={`${status.bg} text-[10px] font-bold uppercase tracking-widest border-2 border-pop-ink rounded-full px-2 py-0.5`}
                  >
                    {status.label}
                  </span>
                  <span className="font-bold text-sm">
                    {s.label || "Untitled link"}
                  </span>
                </div>
                <span className="text-[11px] font-bold uppercase text-pop-ink/60">
                  {s.expires_at
                    ? `Expires ${new Date(s.expires_at).toLocaleString()}`
                    : "Never expires"}{" "}
                  · {s.view_count} view{s.view_count === 1 ? "" : "s"}
                </span>
              </div>

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
                      setCopied(s.id);
                      setTimeout(() => setCopied(null), 1500);
                    } catch {
                      // ignore
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-pop-yellow border-2 border-pop-ink font-bold uppercase text-xs"
                >
                  {copied === s.id ? "Copied!" : "Copy"}
                </button>
                {!s.revoked_at && !expired && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Revoke this link? Anyone with it will lose access immediately."))
                        revokeMut.mutate(s.id);
                    }}
                    className="px-3 py-2 rounded-lg bg-white border-2 border-pop-ink font-bold uppercase text-xs hover:bg-pop-pink hover:text-white"
                  >
                    Revoke
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this share link?")) delMut.mutate(s.id);
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
