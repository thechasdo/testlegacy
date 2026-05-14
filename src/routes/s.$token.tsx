import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getSharedSoul } from "@/lib/shared-soul.functions";

export const Route = createFileRoute("/s/$token")({
  component: SharedSoul,
});

const KIND_EMOJI: Record<string, string> = {
  photo: "📸",
  voice: "🎙️",
  letter: "✉️",
  recipe: "🍳",
  document: "📄",
};

const COVER: Record<string, string> = {
  pink: "bg-pop-pink text-white",
  yellow: "bg-pop-yellow text-pop-ink",
  lime: "bg-pop-lime text-pop-ink",
  sky: "bg-pop-sky text-pop-blue",
};

function SharedSoul() {
  const { token } = Route.useParams();
  const fetchShared = useServerFn(getSharedSoul);
  const { data, isLoading, error } = useQuery({
    queryKey: ["shared-soul", token],
    queryFn: () => fetchShared({ data: { token } }),
  });

  if (isLoading)
    return (
      <div className="min-h-screen bg-pop-cream flex items-center justify-center">
        <p className="font-display text-2xl text-pop-blue">Opening soul…</p>
      </div>
    );

  if (error || !data)
    return (
      <Notice
        title="Something broke"
        body="We couldn't open this share link. Try again later."
      />
    );

  if (data.status === "not_found")
    return (
      <Notice
        title="Link not found"
        body="This share link doesn't exist. Double-check the URL."
      />
    );
  if (data.status === "revoked")
    return (
      <Notice
        title="Link revoked"
        body="The owner turned this share link off. Ask them for a new one."
      />
    );
  if (data.status === "expired")
    return (
      <Notice
        title="Link expired"
        body="This share link has expired. Ask the owner for a fresh one."
      />
    );

  const l = data.legacy!;
  return (
    <div className="min-h-screen bg-pop-cream">
      <header
        className={`${COVER[l.cover_color] ?? "bg-pop-pink text-white"} border-b-2 border-pop-ink`}
      >
        <div className="max-w-4xl mx-auto px-6 py-12">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
            Shared soul · read only
          </span>
          <h1 className="font-display text-5xl uppercase mt-3">{l.title}</h1>
          {l.description && (
            <p className="mt-3 font-semibold opacity-90">{l.description}</p>
          )}
          {data.expires_at && (
            <p className="mt-4 text-xs font-bold uppercase opacity-80">
              ⏰ Link expires {new Date(data.expires_at).toLocaleString()}
            </p>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-4">
        {data.memories.length === 0 && (
          <p className="font-semibold text-pop-ink/60">
            This soul has no memories yet.
          </p>
        )}
        {data.memories.map((m) => (
          <article
            key={m.id}
            className="bg-white border-2 border-pop-ink rounded-2xl p-5 flex gap-4"
          >
            <div className="text-3xl">{KIND_EMOJI[m.kind]}</div>
            <div className="flex-1">
              <h3 className="font-display text-xl uppercase">{m.title}</h3>
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
          </article>
        ))}
      </div>

      <footer className="text-center pb-12 text-xs font-bold uppercase tracking-widest text-pop-ink/50">
        Shared via Digital Soul
      </footer>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-screen bg-pop-cream flex items-center justify-center px-6">
      <div className="max-w-md text-center bg-white border-2 border-pop-ink rounded-3xl p-10 shadow-pop-pink">
        <h1 className="font-display text-3xl uppercase text-pop-blue">
          {title}
        </h1>
        <p className="mt-3 font-semibold text-pop-ink/70">{body}</p>
      </div>
    </div>
  );
}
