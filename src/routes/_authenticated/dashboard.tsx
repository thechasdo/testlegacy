import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listLegacies,
  createLegacy,
  deleteLegacy,
} from "@/lib/legacy.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const COLORS: Record<string, string> = {
  pink: "bg-pop-pink text-white",
  yellow: "bg-pop-yellow text-pop-ink",
  lime: "bg-pop-lime text-pop-ink",
  sky: "bg-pop-sky text-pop-blue",
};

function Dashboard() {
  const list = useServerFn(listLegacies);
  const create = useServerFn(createLegacy);
  const del = useServerFn(deleteLegacy);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["legacies"],
    queryFn: () => list(),
  });

  const createMut = useMutation({
    mutationFn: (input: { title: string; description?: string; cover_color: "pink" | "yellow" | "lime" | "sky" }) =>
      create({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["legacies"] }),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["legacies"] }),
  });

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState<"pink" | "yellow" | "lime" | "sky">("pink");

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-5xl uppercase text-pop-blue">
        Your legacies
      </h1>
      <p className="mt-2 font-semibold text-pop-ink/70">
        Each legacy is a vibrant little vault. Add memories inside.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          createMut.mutate({
            title,
            description: desc || undefined,
            cover_color: color,
          });
          setTitle("");
          setDesc("");
        }}
        className="mt-8 bg-white border-2 border-pop-ink rounded-3xl p-6 shadow-pop-yellow grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          required
          placeholder="Title (e.g. For my kids)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-pop-ink font-semibold"
        />
        <input
          placeholder="One-line description (optional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-pop-ink font-semibold"
        />
        <button
          disabled={createMut.isPending}
          className="px-6 py-3 rounded-full bg-pop-blue text-white font-bold uppercase text-sm border-2 border-pop-ink shadow-pop-pink disabled:opacity-60"
        >
          + Create
        </button>
        <div className="sm:col-span-3 flex gap-2">
          {(["pink", "yellow", "lime", "sky"] as const).map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className={`px-3 py-1 rounded-full border-2 border-pop-ink text-xs font-bold uppercase ${COLORS[c]} ${color === c ? "ring-2 ring-pop-ink ring-offset-2" : "opacity-60"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </form>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="font-bold">Loading…</p>}
        {data?.legacies.length === 0 && (
          <p className="font-semibold text-pop-ink/60 col-span-full">
            No legacies yet. Make your first one ↑
          </p>
        )}
        {data?.legacies.map((l) => (
          <div
            key={l.id}
            className="bg-white border-2 border-pop-ink rounded-3xl overflow-hidden shadow-pop-blue hover:-translate-y-1 transition-transform"
          >
            <Link
              to="/legacy/$id"
              params={{ id: l.id }}
              className={`block ${COLORS[l.cover_color] ?? "bg-pop-pink text-white"} h-32 p-4`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                {l.plan}
              </span>
              <h3 className="font-display text-2xl uppercase mt-2 line-clamp-2">
                {l.title}
              </h3>
            </Link>
            <div className="p-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-pop-ink/70 line-clamp-2">
                {l.description ?? "Tap to open and add memories."}
              </p>
              <button
                onClick={() => {
                  if (confirm("Delete this legacy and all its memories?")) {
                    delMut.mutate(l.id);
                  }
                }}
                className="text-xs font-bold uppercase text-pop-pink shrink-0"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
