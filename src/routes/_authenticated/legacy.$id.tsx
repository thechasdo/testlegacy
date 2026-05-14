import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getLegacy,
  addMemory,
  deleteMemory,
} from "@/lib/legacy.functions";
import { ShareSoulPanel } from "@/components/ShareSoulPanel";
import { InviteSoulPanel } from "@/components/InviteSoulPanel";

export const Route = createFileRoute("/_authenticated/legacy/$id")({
  component: LegacyDetail,
});

const KIND_EMOJI: Record<string, string> = {
  photo: "📸",
  voice: "🎙️",
  letter: "✉️",
  recipe: "🍳",
  document: "📄",
};

function LegacyDetail() {
  const { id } = Route.useParams();
  const get = useServerFn(getLegacy);
  const add = useServerFn(addMemory);
  const del = useServerFn(deleteMemory);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["legacy", id],
    queryFn: () => get({ data: { id } }),
  });

  const addMut = useMutation({
    mutationFn: (input: {
      legacy_id: string;
      kind: "photo" | "voice" | "letter" | "recipe" | "document";
      title: string;
      body?: string;
      scheduled_for?: string;
    }) => add({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["legacy", id] }),
  });
  const delMut = useMutation({
    mutationFn: (mid: string) => del({ data: { id: mid } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["legacy", id] }),
  });

  const [kind, setKind] = useState<"photo" | "voice" | "letter" | "recipe" | "document">("letter");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [scheduled, setScheduled] = useState("");

  if (isLoading) return <p className="p-12 font-bold">Loading…</p>;
  if (!data?.legacy) return <p className="p-12 font-bold">Not found.</p>;

  const l = data.legacy;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link
        to="/dashboard"
        className="text-xs font-bold uppercase text-pop-blue hover:text-pop-pink"
      >
        ← Dashboard
      </Link>
      <h1 className="font-display text-5xl uppercase text-pop-blue mt-4">
        {l.title}
      </h1>
      {l.description && (
        <p className="mt-2 font-semibold text-pop-ink/70">{l.description}</p>
      )}

      <ShareSoulPanel legacyId={id} />
      <InviteSoulPanel legacyId={id} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          addMut.mutate({
            legacy_id: id,
            kind,
            title,
            body: body || undefined,
            scheduled_for: scheduled
              ? new Date(scheduled).toISOString()
              : undefined,
          });
          setTitle("");
          setBody("");
          setScheduled("");
        }}
        className="mt-8 bg-white border-2 border-pop-ink rounded-3xl p-6 shadow-pop-pink space-y-3"
      >
        <div className="flex flex-wrap gap-2">
          {(["letter", "photo", "voice", "recipe", "document"] as const).map((k) => (
            <button
              type="button"
              key={k}
              onClick={() => setKind(k)}
              className={`px-3 py-1 rounded-full border-2 border-pop-ink text-xs font-bold uppercase ${
                kind === k ? "bg-pop-yellow" : "bg-white opacity-70"
              }`}
            >
              {KIND_EMOJI[k]} {k}
            </button>
          ))}
        </div>
        <input
          required
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-pop-ink font-semibold"
        />
        <textarea
          placeholder="Write the memory…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border-2 border-pop-ink font-semibold"
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold uppercase text-pop-ink/70">
            Future-send (optional)
          </label>
          <input
            type="datetime-local"
            value={scheduled}
            onChange={(e) => setScheduled(e.target.value)}
            className="px-3 py-2 rounded-xl border-2 border-pop-ink font-semibold text-sm"
          />
          <button
            disabled={addMut.isPending}
            className="ml-auto px-6 py-3 rounded-full bg-pop-pink text-white font-bold uppercase text-sm border-2 border-pop-ink shadow-pop-blue disabled:opacity-60"
          >
            + Add memory
          </button>
        </div>
      </form>

      <div className="mt-10 space-y-4">
        {data.memories.length === 0 && (
          <p className="font-semibold text-pop-ink/60">
            No memories yet. Add the first one ↑
          </p>
        )}
        {data.memories.map((m) => (
          <div
            key={m.id}
            className="bg-white border-2 border-pop-ink rounded-2xl p-5 flex gap-4"
          >
            <div className="text-3xl">{KIND_EMOJI[m.kind]}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl uppercase">{m.title}</h3>
                <button
                  onClick={() => {
                    if (confirm("Delete this memory?")) delMut.mutate(m.id);
                  }}
                  className="text-xs font-bold uppercase text-pop-pink"
                >
                  Delete
                </button>
              </div>
              {m.body && (
                <p className="mt-2 text-sm text-pop-ink/80 whitespace-pre-wrap">
                  {m.body}
                </p>
              )}
              {m.scheduled_for && (
                <p className="mt-2 text-xs font-bold uppercase text-pop-blue">
                  ⏰ Sends {new Date(m.scheduled_for).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
