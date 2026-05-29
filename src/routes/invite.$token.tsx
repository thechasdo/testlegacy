import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { openInvitation } from "@/lib/invite.functions";

export const Route = createFileRoute("/invite/$token")({
  component: InvitePage,
});

const KIND_EMOJI: Record<string, string> = {
  photo: "📸",
  voice: "🎙️",
  letter: "✉️",
  recipe: "🍳",
  document: "📄",
};

function StatusCard({
  title,
  body,
  bg,
}: {
  title: string;
  body: string;
  bg: string;
}) {
  return (
    <div className="min-h-screen bg-pop-cream flex items-center justify-center p-6">
      <div
        className={`max-w-md w-full ${bg} border-2 border-pop-ink rounded-3xl p-8 shadow-pop-blue text-center`}
      >
        <h1 className="font-display text-3xl uppercase text-pop-ink">
          {title}
        </h1>
        <p className="mt-3 font-semibold text-pop-ink/80">{body}</p>
      </div>
    </div>
  );
}

function InvitePage() {
  const { token } = Route.useParams();
  const open = useServerFn(openInvitation);
  const { data, isLoading } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => open({ data: { token } }),
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-pop-cream">
        <p className="font-bold uppercase">Opening invitation…</p>
      </div>
    );

  if (!data) return null;
  if (data.status === "not_found")
    return (
      <StatusCard
        title="Invitation not found"
        body="This invite link doesn't exist or has been deleted."
        bg="bg-white"
      />
    );
  if (data.status === "revoked")
    return (
      <StatusCard
        title="Invitation revoked"
        body="The owner of this soul has revoked your access."
        bg="bg-pop-pink text-white"
      />
    );
  if (data.status === "expired")
    return (
      <StatusCard
        title="Invitation expired"
        body="This invitation has reached its expiration date."
        bg="bg-pop-yellow"
      />
    );

  const { invite, legacy, memories } = data;

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify({ legacy, memories }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${legacy?.title ?? "soul"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportText = () => {
    const lines = [
      `# ${legacy?.title ?? "Soul"}`,
      legacy?.description ?? "",
      "",
      ...memories.map(
        (m) =>
          `## ${KIND_EMOJI[m.kind] ?? ""} ${m.title}\n${m.body ?? ""}\n`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${legacy?.title ?? "soul"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-pop-cream">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white border-2 border-pop-ink rounded-3xl p-6 shadow-pop-pink">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-pop-lime border-2 border-pop-ink rounded-full px-2 py-0.5">
            Invitation for {invite.recipient_name || invite.recipient_email}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl uppercase text-pop-blue mt-4">
            {legacy?.title}
          </h1>
          {legacy?.description && (
            <p className="mt-2 font-semibold text-pop-ink/70">
              {legacy.description}
            </p>
          )}
          {invite.message && (
            <p className="mt-4 italic text-pop-ink/80 border-l-4 border-pop-pink pl-3">
              “{invite.message}”
            </p>
          )}
          {invite.permission === "export" && (
            <div className="mt-5 flex gap-2 flex-wrap">
              <button
                onClick={exportJson}
                className="px-4 py-2 rounded-full bg-pop-blue text-white border-2 border-pop-ink font-bold uppercase text-xs shadow-pop-yellow"
              >
                ⬇ Export JSON
              </button>
              <button
                onClick={exportText}
                className="px-4 py-2 rounded-full bg-pop-yellow border-2 border-pop-ink font-bold uppercase text-xs"
              >
                ⬇ Export Text
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          {memories.length === 0 && (
            <p className="font-semibold text-pop-ink/60">
              No memories in this soul yet.
            </p>
          )}
          {memories.map((m) => (
            <div
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
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs font-bold uppercase text-pop-ink/50">
          Delivered via Soulprint
        </p>
      </div>
    </div>
  );
}
