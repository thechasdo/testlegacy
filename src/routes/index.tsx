import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { usePaddleCheckout } from "@/hooks/use-paddle-checkout";
import { useAuth } from "@/hooks/use-auth";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export const Route = createFileRoute("/")({
  component: Index,
});

/* ---------- tiny inline SVG icons of "things that are alive" ---------- */

function Dolphin({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M4 38c8-2 12-10 22-10 9 0 13 5 22 4 6-1 10-4 12-7-1 9-9 17-22 17-3 4-9 6-15 6 2-2 3-4 3-6-9 0-17-1-22-4Zm38-12c1-3 4-6 8-7-1 4-4 7-8 7Z"
      />
      <circle cx="40" cy="32" r="1.6" fill="#fff" />
    </svg>
  );
}

function Elephant({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M10 40c0-12 10-22 22-22s22 10 22 22v6h-8v-4a4 4 0 0 0-8 0v4H22v-4a4 4 0 0 0-8 0v4h-4Zm38-6c2 0 4 4 4 8s-2 6-4 6c0-3-1-5-3-7 1-3 2-7 3-7Z"
      />
      <circle cx="26" cy="30" r="1.8" fill="#fff" />
    </svg>
  );
}

function Twins({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="22" cy="20" r="8" fill="currentColor" />
      <circle cx="42" cy="20" r="8" fill="currentColor" />
      <path
        fill="currentColor"
        d="M6 52c0-8 7-14 16-14s16 6 16 14v6H6Zm20 0c0-8 7-14 16-14s16 6 16 14v6H26Z"
      />
    </svg>
  );
}

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"
      />
    </svg>
  );
}

function Sun({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="12" fill="currentColor" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const x1 = 32 + Math.cos(a) * 18;
        const y1 = 32 + Math.sin(a) * 18;
        const x2 = 32 + Math.cos(a) * 28;
        const y2 = 32 + Math.sin(a) * 28;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/* ---------- page ---------- */

function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();

  const handleSubscribe = (priceId: string) => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    openCheckout({ priceId, userId: user.id, customerEmail: user.email });
  };

  return (
    <div className="min-h-screen bg-pop-cream text-pop-ink overflow-x-hidden selection:bg-pop-pink selection:text-white">
      <PaymentTestModeBanner />
      {/* NAV */}
      <nav className="relative z-20 max-w-7xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-pop-pink border-2 border-pop-ink flex items-center justify-center">
            <Sparkle className="size-4 text-pop-yellow" />
          </div>
          <span className="font-display text-2xl text-pop-blue tracking-tight">
            chasdo
          </span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest">
          <a href="#vault" className="hover:text-pop-pink transition-colors">
            The Vault
          </a>
          <a href="#showcase" className="hover:text-pop-pink transition-colors">
            Showcase
          </a>
          <a href="#pricing" className="hover:text-pop-pink transition-colors">
            Pricing
          </a>
        </div>
        <a
          href="#pricing"
          className="bg-pop-blue text-white px-6 py-2.5 rounded-full font-bold uppercase tracking-tight text-sm border-2 border-pop-ink shadow-pop-pink hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
        >
          Join the Legacy
        </a>
      </nav>

      {/* HERO */}
      <header className="relative px-6 pt-12 pb-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 relative z-10">
            <span className="inline-flex items-center gap-2 bg-pop-yellow border-2 border-pop-ink px-3 py-1 rounded-full font-bold text-xs uppercase tracking-widest mb-6">
              <Sparkle className="size-3 text-pop-pink" /> A vault for the
              loud, living, real you
            </span>

            <h1 className="font-display text-[clamp(3.5rem,9vw,7.5rem)] uppercase leading-[0.85] text-pop-blue">
              Live{" "}
              <span className="text-pop-pink italic inline-block animate-wiggle origin-bottom">
                Forever
              </span>
              <br />
              In High{" "}
              <span className="relative text-pop-tangerine">
                Def.
                <span className="absolute -bottom-2 left-0 right-0 h-2 bg-pop-lime -z-10 rounded" />
              </span>{" "}
              <span className="text-pop-yellow drop-shadow-[3px_3px_0_var(--color-pop-ink)]">
                Digital
              </span>
            </h1>

            <p className="mt-10 max-w-xl text-xl font-semibold leading-relaxed text-pop-ink/80">
              chasdo is a technicolor time capsule for your stories, voice
              notes, recipes, and inside jokes. Not a graveyard — a{" "}
              <span className="bg-pop-lime px-1">backyard party</span> that
              lasts a hundred years.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 items-center">
              <a
                href="#pricing"
                className="bg-pop-pink text-white text-lg px-10 py-4 rounded-2xl font-display uppercase border-2 border-pop-ink shadow-[6px_6px_0_var(--color-pop-blue)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
              >
                Start Your Capsule
              </a>
              <div className="flex items-center gap-3 text-sm font-bold">
                <div className="flex -space-x-2">
                  <div className="size-8 rounded-full bg-pop-yellow border-2 border-pop-ink" />
                  <div className="size-8 rounded-full bg-pop-pink border-2 border-pop-ink" />
                  <div className="size-8 rounded-full bg-pop-lime border-2 border-pop-ink" />
                </div>
                12,000+ legacies in bloom
              </div>
            </div>
          </div>

          {/* Hero collage */}
          <div className="lg:col-span-5 relative h-[420px] sm:h-[520px]">
            <div className="absolute top-0 right-4 rotate-6 z-20 bg-white p-3 pb-10 border-2 border-pop-ink shadow-pop-pink">
              <div className="w-56 aspect-square bg-pop-sky flex items-center justify-center text-pop-blue">
                <Dolphin className="size-32" />
              </div>
              <p className="mt-2 font-bold text-sm">Hawaii, summer ’03 🐬</p>
            </div>

            <div className="absolute bottom-8 left-0 -rotate-6 z-30 bg-white p-3 pb-10 border-2 border-pop-ink shadow-pop-blue">
              <div className="w-52 aspect-square bg-pop-yellow flex items-center justify-center text-pop-tangerine">
                <Elephant className="size-32" />
              </div>
              <p className="mt-2 font-bold text-sm">Zoo trip with Pop 🐘</p>
            </div>

            <div className="absolute bottom-32 right-0 rotate-3 z-10 bg-white p-3 pb-10 border-2 border-pop-ink shadow-pop-yellow">
              <div className="w-48 aspect-square bg-pop-pink/30 flex items-center justify-center text-pop-pink">
                <Twins className="size-32" />
              </div>
              <p className="mt-2 font-bold text-sm">Me &amp; Mara, age 6 👯</p>
            </div>

            {/* deco */}
            <Sun className="absolute -top-6 -left-2 size-20 text-pop-yellow animate-float-y" />
            <Sparkle className="absolute bottom-2 right-10 size-8 text-pop-pink animate-wiggle" />
          </div>
        </div>
      </header>

      {/* MARQUEE-ish little life things */}
      <div className="bg-pop-blue text-pop-cream border-y-4 border-pop-ink py-4 overflow-hidden">
        <div className="flex items-center gap-12 font-display uppercase text-xl whitespace-nowrap animate-[float-y_4s_ease-in-out_infinite] justify-center">
          <span className="flex items-center gap-2">
            <Dolphin className="size-7 text-pop-sky" /> dolphins
          </span>
          <Sparkle className="size-4 text-pop-yellow" />
          <span className="flex items-center gap-2">
            <Elephant className="size-7 text-pop-pink" /> elephants
          </span>
          <Sparkle className="size-4 text-pop-lime" />
          <span className="flex items-center gap-2">
            <Twins className="size-7 text-pop-yellow" /> twins
          </span>
          <Sparkle className="size-4 text-pop-pink" />
          <span className="flex items-center gap-2">
            <Sun className="size-7 text-pop-yellow" /> sundays
          </span>
        </div>
      </div>

      {/* VALUE PROPS */}
      <section id="vault" className="px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-5xl md:text-7xl uppercase text-pop-blue mb-4">
            Three rules of <span className="text-pop-pink">a life kept well.</span>
          </h2>
          <p className="text-xl font-semibold max-w-2xl mb-16 text-pop-ink/70">
            We didn’t build a hard drive. We built a kitchen-table archive for
            the stuff that actually matters.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "The Mixtape Vault",
                body: "Voice notes, playlists, half-sung lullabies. Stored lossless so the rasp in your laugh stays in.",
                bg: "bg-pop-pink",
                fg: "text-white",
                shadow: "shadow-pop-blue",
                Icon: Dolphin,
              },
              {
                num: "02",
                title: "Memory in Color",
                body: "Drop in photos, scans, and pages from the recipe binder. We keep them in 10-bit color, not corporate gray.",
                bg: "bg-pop-yellow",
                fg: "text-pop-ink",
                shadow: "shadow-pop-pink",
                Icon: Elephant,
              },
              {
                num: "03",
                title: "Future Sends",
                body: "Schedule a letter for a graduation, a birthday, a Tuesday in 2052. Be there for the milestones, even when you aren’t.",
                bg: "bg-pop-lime",
                fg: "text-pop-ink",
                shadow: "shadow-pop-blue",
                Icon: Twins,
              },
            ].map(({ num, title, body, bg, fg, shadow, Icon }) => (
              <div
                key={num}
                className={`${bg} ${fg} border-2 border-pop-ink rounded-3xl p-8 ${shadow} hover:-translate-y-1 transition-transform`}
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="font-display text-5xl">{num}</span>
                  <Icon className="size-14 opacity-90" />
                </div>
                <h3 className="font-display text-3xl uppercase mb-3">{title}</h3>
                <p className="text-base font-semibold leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section
        id="showcase"
        className="px-6 py-32 bg-pop-blue text-pop-cream border-y-4 border-pop-ink relative overflow-hidden"
      >
        <Sparkle className="absolute top-10 left-10 size-10 text-pop-yellow animate-wiggle" />
        <Sparkle className="absolute bottom-16 right-16 size-14 text-pop-pink animate-float-y" />
        <Sun className="absolute top-20 right-1/3 size-16 text-pop-tangerine opacity-80" />

        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <h2 className="font-display text-5xl md:text-7xl uppercase">
              A peek at <span className="text-pop-yellow">the album.</span>
            </h2>
            <p className="text-lg font-semibold max-w-md text-pop-cream/80">
              Real legacies live like scrapbooks — taped, tilted, slightly
              jam-stained. Yours will too.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                tag: "Aug ’99",
                title: "Maui sunset, age 8",
                Icon: Dolphin,
                bg: "bg-pop-sky",
                ic: "text-pop-blue",
                rotate: "-rotate-3",
              },
              {
                tag: "Family",
                title: "Twins on the porch",
                Icon: Twins,
                bg: "bg-pop-pink",
                ic: "text-white",
                rotate: "rotate-2 mt-8",
              },
              {
                tag: "Letter",
                title: "Mom’s elephant story",
                Icon: Elephant,
                bg: "bg-pop-yellow",
                ic: "text-pop-tangerine",
                rotate: "-rotate-2",
              },
              {
                tag: "Sunday",
                title: "Backyard, July ’24",
                Icon: Sun,
                bg: "bg-pop-lime",
                ic: "text-pop-tangerine",
                rotate: "rotate-3 mt-6",
              },
            ].map((c) => (
              <div
                key={c.title}
                className={`bg-white text-pop-ink p-3 pb-8 border-2 border-pop-ink ${c.rotate} hover:rotate-0 transition-transform`}
              >
                <div
                  className={`${c.bg} aspect-square flex items-center justify-center`}
                >
                  <c.Icon className={`size-20 ${c.ic}`} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-pop-blue">
                    {c.tag}
                  </span>
                </div>
                <p className="font-bold text-sm mt-1">{c.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-7xl uppercase text-pop-blue">
              Pick your <span className="text-pop-pink">volume.</span>
            </h2>
            <p className="mt-4 text-lg font-semibold text-pop-ink/70">
              Plans that grow with you. Add-ons for the maximalists.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Tier 1 */}
            <div className="bg-white border-2 border-pop-ink rounded-3xl p-10 flex flex-col shadow-pop-yellow">
              <span className="font-display text-2xl text-pop-blue uppercase">
                Keepsake
              </span>
              <p className="text-sm font-semibold text-pop-ink/60 mt-1">
                For getting started.
              </p>
              <div className="font-display text-6xl text-pop-ink mt-6">
                $0
                <span className="text-lg font-sans text-pop-ink/40">/mo</span>
              </div>
              <ul className="mt-8 space-y-3 flex-1 font-semibold text-sm">
                <li>🐬 1 GB of memories</li>
                <li>🐘 2 trusted heirs</li>
                <li>👯 3 future-send letters</li>
              </ul>
              <button className="mt-8 py-3 rounded-full border-2 border-pop-ink font-bold uppercase text-sm hover:bg-pop-yellow transition-colors">
                Start free
              </button>
            </div>

            {/* Tier 2 - featured */}
            <div className="bg-pop-pink text-white border-2 border-pop-ink rounded-3xl p-10 flex flex-col shadow-[10px_10px_0_var(--color-pop-blue)] md:scale-105 relative">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pop-yellow text-pop-ink border-2 border-pop-ink px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Most loved
              </span>
              <span className="font-display text-2xl uppercase">Collector</span>
              <p className="text-sm font-semibold text-white/80 mt-1">
                For a lifetime of stories.
              </p>
              <div className="font-display text-6xl mt-6">
                $12
                <span className="text-lg font-sans text-white/60">/mo</span>
              </div>
              <ul className="mt-8 space-y-3 flex-1 font-semibold text-sm">
                <li>🐬 100 GB + voice memos</li>
                <li>🐘 Unlimited heirs</li>
                <li>👯 Unlimited future-sends</li>
                <li>✨ Collaborative family albums</li>
              </ul>
              <button className="mt-8 py-3 rounded-full bg-white text-pop-pink border-2 border-pop-ink font-bold uppercase text-sm hover:bg-pop-yellow hover:text-pop-ink transition-colors">
                Choose Collector
              </button>
            </div>

            {/* Tier 3 */}
            <div className="bg-white border-2 border-pop-ink rounded-3xl p-10 flex flex-col shadow-pop-lime">
              <span className="font-display text-2xl text-pop-blue uppercase">
                Curator
              </span>
              <p className="text-sm font-semibold text-pop-ink/60 mt-1">
                For the family historian.
              </p>
              <div className="font-display text-6xl text-pop-ink mt-6">
                $29
                <span className="text-lg font-sans text-pop-ink/40">/mo</span>
              </div>
              <ul className="mt-8 space-y-3 flex-1 font-semibold text-sm">
                <li>🐬 1 TB high-res video vault</li>
                <li>🐘 Concierge digitization</li>
                <li>👯 Annual printed photo book</li>
              </ul>
              <button className="mt-8 py-3 rounded-full border-2 border-pop-ink font-bold uppercase text-sm hover:bg-pop-lime transition-colors">
                Talk to us
              </button>
            </div>
          </div>

          {/* add-ons */}
          <div className="mt-16 flex flex-wrap gap-4 justify-center">
            {[
              { label: "Custom domain · +$5/mo", bg: "bg-pop-yellow", r: "rotate-2" },
              { label: "Video vault · +$8/mo", bg: "bg-pop-pink text-white", r: "-rotate-2" },
              { label: "Extra 500 GB · +$10/mo", bg: "bg-pop-lime", r: "rotate-1" },
              { label: "Annual photo book · +$45/yr", bg: "bg-pop-sky", r: "-rotate-3" },
            ].map((a) => (
              <span
                key={a.label}
                className={`${a.bg} ${a.r} border-2 border-pop-ink px-5 py-2 rounded-full font-bold text-sm uppercase tracking-tight`}
              >
                {a.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <footer className="px-6 pb-12">
        <div className="max-w-6xl mx-auto bg-pop-yellow border-2 border-pop-ink rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-[16px_16px_0_var(--color-pop-pink)]">
          <Dolphin className="absolute -top-6 -left-6 size-36 text-pop-blue/20" />
          <Elephant className="absolute -bottom-8 right-4 size-44 text-pop-pink/20" />
          <Twins className="absolute top-10 right-10 size-24 text-pop-blue/20" />

          <div className="relative text-center">
            <h2 className="font-display text-5xl md:text-7xl uppercase text-pop-blue leading-none">
              Don’t just <span className="italic">fade to gray.</span>
            </h2>
            <p className="mt-6 text-lg font-bold text-pop-ink/80 max-w-xl mx-auto">
              Bring the dolphins. Bring the elephants. Bring the twin sister
              you fought with for 30 years. Keep all of it, in color.
            </p>
            <a
              href="#pricing"
              className="inline-block mt-10 bg-pop-blue text-white text-xl px-12 py-5 rounded-full font-display uppercase border-2 border-pop-ink hover:bg-pop-pink transition-colors"
            >
              Claim your username
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold uppercase tracking-widest text-pop-ink/60">
          <span className="font-display text-xl text-pop-blue">
            chasdo · forever &amp; always
          </span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-pop-pink">Privacy</a>
            <a href="#" className="hover:text-pop-pink">Terms</a>
            <a href="#" className="hover:text-pop-pink">Manifesto</a>
          </div>
          <span>© 2026 chasdo</span>
        </div>
      </footer>
    </div>
  );
}
