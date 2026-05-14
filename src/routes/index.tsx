import { useState } from "react";
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

type BillingCycle = "monthly" | "yearly";

const TIERS = [
  {
    id: "keepsake",
    name: "Keepsake",
    tagline: "Get the party started.",
    monthly: 0,
    yearly: 0,
    monthlyPriceId: null,
    yearlyPriceId: null,
    accent: "bg-white",
    text: "text-pop-ink",
    shadow: "shadow-pop-yellow",
    button: "border-pop-ink hover:bg-pop-yellow",
    cta: "Start free",
    features: [
      "🐬 1 GB of memories",
      "🐘 2 trusted heirs",
      "👯 3 future-send letters",
      "✨ Public profile page",
    ],
    addons: ["+ Custom domain ($5/mo)"],
  },
  {
    id: "snapshot",
    name: "Snapshot",
    tagline: "A pocketful of polaroids.",
    monthly: 9.99,
    yearly: 95.9,
    monthlyPriceId: "snapshot_monthly",
    yearlyPriceId: "snapshot_yearly",
    accent: "bg-pop-sky",
    text: "text-pop-ink",
    shadow: "shadow-pop-pink",
    button: "border-pop-ink hover:bg-pop-pink hover:text-white",
    cta: "Get Snapshot",
    features: [
      "🐬 10 GB of memories",
      "🐘 5 trusted heirs",
      "👯 25 future-send letters",
      "✨ Voice memos (HQ)",
      "🌞 Custom domain included",
    ],
    addons: ["+ Extra 50 GB ($4/mo)", "+ Annual photo zine ($25/yr)"],
  },
  {
    id: "collector",
    name: "Collector",
    tagline: "For a lifetime of stories.",
    monthly: 19.99,
    yearly: 191.9,
    monthlyPriceId: "collector_v2_monthly",
    yearlyPriceId: "collector_v2_yearly",
    accent: "bg-pop-pink",
    text: "text-white",
    shadow: "shadow-[10px_10px_0_var(--color-pop-blue)]",
    button: "bg-white text-pop-pink border-pop-ink hover:bg-pop-yellow hover:text-pop-ink",
    cta: "Choose Collector",
    featured: true,
    features: [
      "🐬 100 GB + voice memos",
      "🐘 Unlimited heirs",
      "👯 Unlimited future-sends",
      "✨ Collaborative family albums",
      "🌞 Custom domain + email",
      "🎀 Inline scrapbook editor",
    ],
    addons: ["+ Extra 500 GB ($10/mo)", "+ Video vault ($8/mo)"],
  },
  {
    id: "archivist",
    name: "Archivist",
    tagline: "Big vault energy.",
    monthly: 34.99,
    yearly: 335.9,
    monthlyPriceId: "archivist_monthly",
    yearlyPriceId: "archivist_yearly",
    accent: "bg-pop-yellow",
    text: "text-pop-ink",
    shadow: "shadow-pop-blue",
    button: "border-pop-ink bg-pop-ink text-white hover:bg-pop-pink",
    cta: "Become Archivist",
    features: [
      "🐬 500 GB + 4K video memos",
      "🐘 Unlimited heirs + co-curators",
      "👯 Smart future-sends w/ triggers",
      "✨ Family branching trees",
      "🌞 Multi-domain support",
      "🎀 Auto-tagging & search",
      "🐠 Annual printed photo book",
    ],
    addons: ["+ Concierge digitization ($15/mo)", "+ Heirloom NFC tags ($30/yr)"],
  },
  {
    id: "curator",
    name: "Curator",
    tagline: "The full historian regalia.",
    monthly: 49.99,
    yearly: 479.9,
    monthlyPriceId: "curator_v2_monthly",
    yearlyPriceId: "curator_v2_yearly",
    accent: "bg-pop-lime",
    text: "text-pop-ink",
    shadow: "shadow-[10px_10px_0_var(--color-pop-tangerine)]",
    button: "border-pop-ink bg-pop-blue text-white hover:bg-pop-pink",
    cta: "Become Curator",
    features: [
      "🐬 1 TB high-res video vault",
      "🐘 Concierge digitization included",
      "👯 White-glove future-send concierge",
      "✨ Annual printed photo book",
      "🌞 Custom branding + multi-domain",
      "🎀 Heirloom NFC tags (4/yr)",
      "🐠 Dedicated archivist contact",
      "🦩 Priority forever-storage guarantee",
    ],
    addons: ["+ Family historian onsite visit ($499/yr)"],
  },
] as const;

function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();
  const [cycle, setCycle] = useState<BillingCycle>("yearly");

  const handleSubscribe = (priceId: string | null) => {
    if (!priceId) {
      navigate({ to: user ? "/dashboard" : "/login" });
      return;
    }
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    openCheckout({ priceId, userId: user.id, customerEmail: user.email });
  };

  const fmt = (n: number) =>
    n === 0 ? "$0" : `$${n.toFixed(n % 1 === 0 ? 0 : 2)}`;

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
          <div className="text-center mb-12">
            <h2 className="font-display text-5xl md:text-7xl uppercase text-pop-blue">
              Pick your <span className="text-pop-pink">volume.</span>
            </h2>
            <p className="mt-4 text-lg font-semibold text-pop-ink/70">
              Five tiers. Auto-renews so the party never stops. Yearly saves you ~20%.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-14">
            <div className="inline-flex items-center gap-1 bg-white border-2 border-pop-ink rounded-full p-1 shadow-pop-pink">
              <button
                onClick={() => setCycle("monthly")}
                className={`px-5 py-2 rounded-full font-bold text-sm uppercase tracking-tight transition-colors ${
                  cycle === "monthly"
                    ? "bg-pop-blue text-white"
                    : "text-pop-ink hover:bg-pop-yellow"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setCycle("yearly")}
                className={`px-5 py-2 rounded-full font-bold text-sm uppercase tracking-tight transition-colors flex items-center gap-2 ${
                  cycle === "yearly"
                    ? "bg-pop-blue text-white"
                    : "text-pop-ink hover:bg-pop-yellow"
                }`}
              >
                Yearly
                <span className="bg-pop-lime text-pop-ink border border-pop-ink px-2 py-0.5 rounded-full text-[10px]">
                  save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {TIERS.map((tier) => {
              const isYearly = cycle === "yearly";
              const priceId = isYearly ? tier.yearlyPriceId : tier.monthlyPriceId;
              const isFree = tier.monthly === 0;
              const monthlyEquiv = isYearly && !isFree ? tier.yearly / 12 : tier.monthly;
              const yearlyTotal = tier.yearly;
              const featured = "featured" in tier && tier.featured;

              return (
                <div
                  key={tier.id}
                  className={`${tier.accent} ${tier.text} border-2 border-pop-ink rounded-3xl p-7 flex flex-col ${tier.shadow} ${
                    featured ? "lg:-translate-y-4 relative" : "relative"
                  } hover:-translate-y-1 transition-transform`}
                >
                  {featured && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pop-yellow text-pop-ink border-2 border-pop-ink px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                      Most loved
                    </span>
                  )}
                  <span className="font-display text-2xl uppercase">{tier.name}</span>
                  <p className={`text-xs font-semibold mt-1 ${featured ? "text-white/80" : "text-pop-ink/60"}`}>
                    {tier.tagline}
                  </p>

                  <div className="mt-5">
                    <div className="font-display text-5xl leading-none">
                      {fmt(monthlyEquiv)}
                      <span className={`text-sm font-sans ml-1 ${featured ? "text-white/70" : "text-pop-ink/50"}`}>
                        /mo
                      </span>
                    </div>
                    <div className={`mt-2 text-[11px] font-bold uppercase tracking-widest ${featured ? "text-white/80" : "text-pop-ink/60"}`}>
                      {isFree
                        ? "Forever free"
                        : isYearly
                        ? `Billed ${fmt(yearlyTotal)}/yr · auto-renews`
                        : `${fmt(tier.monthly)}/mo · auto-renews`}
                    </div>
                    {isYearly && !isFree && (
                      <div className="mt-1 inline-block bg-pop-lime text-pop-ink border border-pop-ink px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        save {fmt(tier.monthly * 12 - tier.yearly)}/yr
                      </div>
                    )}
                  </div>

                  <ul className="mt-6 space-y-2 flex-1 font-semibold text-sm">
                    {tier.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>

                  {tier.addons.length > 0 && (
                    <div className={`mt-5 pt-4 border-t-2 border-dashed ${featured ? "border-white/40" : "border-pop-ink/20"}`}>
                      <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${featured ? "text-white/80" : "text-pop-ink/50"}`}>
                        Add-ons
                      </div>
                      <ul className="space-y-1 text-xs font-semibold">
                        {tier.addons.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => handleSubscribe(priceId)}
                    disabled={checkoutLoading && !!priceId}
                    className={`mt-6 py-3 rounded-full border-2 font-bold uppercase text-sm transition-colors disabled:opacity-60 ${tier.button}`}
                  >
                    {checkoutLoading && !!priceId ? "Opening…" : tier.cta}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-center mt-10 text-sm font-semibold text-pop-ink/60">
            All plans auto-renew · cancel anytime in your dashboard · prices in USD
          </p>

          {/* COMPARISON TABLE */}
          <div className="mt-24">
            <h3 className="font-display text-3xl md:text-5xl uppercase text-pop-blue text-center mb-3">
              Compare the <span className="text-pop-pink">whole party.</span>
            </h3>
            <p className="text-center text-sm font-semibold text-pop-ink/60 mb-10">
              Showing <span className="bg-pop-yellow px-2 border border-pop-ink rounded">{cycle === "yearly" ? "yearly" : "monthly"}</span> pricing · toggle above to flip
            </p>

            <div className="overflow-x-auto border-2 border-pop-ink rounded-3xl bg-white shadow-pop-blue">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b-2 border-pop-ink">
                    <th className="p-4 font-display uppercase text-pop-blue text-sm sticky left-0 bg-white z-10 min-w-[200px]">
                      Feature
                    </th>
                    {TIERS.map((t) => {
                      const featured = "featured" in t && t.featured;
                      return (
                        <th
                          key={t.id}
                          className={`p-4 text-center align-bottom min-w-[140px] ${featured ? "bg-pop-pink text-white" : ""}`}
                        >
                          <div className="font-display uppercase text-lg">{t.name}</div>
                          <div className={`font-display text-2xl mt-2 ${featured ? "text-pop-yellow" : "text-pop-pink"}`}>
                            {t.monthly === 0
                              ? "Free"
                              : cycle === "yearly"
                              ? fmt(t.yearly / 12)
                              : fmt(t.monthly)}
                            {t.monthly !== 0 && (
                              <span className={`text-[10px] font-sans ml-1 ${featured ? "text-white/70" : "text-pop-ink/50"}`}>
                                /mo
                              </span>
                            )}
                          </div>
                          <div className={`text-[10px] font-bold uppercase mt-1 ${featured ? "text-white/80" : "text-pop-ink/60"}`}>
                            {t.monthly === 0
                              ? "Forever"
                              : cycle === "yearly"
                              ? `${fmt(t.yearly)}/yr`
                              : "billed monthly"}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="font-semibold text-sm">
                  {[
                    { label: "🐬 Memory storage", values: ["1 GB", "10 GB", "100 GB", "500 GB", "1 TB"] },
                    { label: "🐘 Trusted heirs", values: ["2", "5", "Unlimited", "Unlimited", "Unlimited"] },
                    { label: "👯 Future-send letters", values: ["3", "25", "Unlimited", "Smart triggers", "White-glove"] },
                    { label: "🎙️ Voice memos (HQ)", values: [false, true, true, true, true] },
                    { label: "📼 Video memos", values: [false, "SD", "HD", "4K", "4K + RAW"] },
                    { label: "🌞 Custom domain", values: ["Add-on", true, true, "Multi", "Multi + email"] },
                    { label: "🎀 Collaborative albums", values: [false, false, true, true, true] },
                    { label: "🔍 Auto-tagging & search", values: [false, false, false, true, true] },
                    { label: "📚 Annual printed photo book", values: ["Add-on", "Zine add-on", "Add-on", true, true] },
                    { label: "🐠 Concierge digitization", values: [false, false, "Add-on", true, true] },
                    { label: "🦩 Heirloom NFC tags", values: [false, false, false, "Add-on", "4/yr included"] },
                    { label: "✨ Dedicated archivist", values: [false, false, false, false, true] },
                    { label: "♾️ Priority forever-storage", values: [false, false, false, false, true] },
                  ].map((row, i) => (
                    <tr
                      key={row.label}
                      className={`border-t border-pop-ink/10 ${i % 2 === 0 ? "bg-pop-cream/30" : ""}`}
                    >
                      <td className="p-4 font-bold sticky left-0 bg-inherit z-10">
                        {row.label}
                      </td>
                      {row.values.map((v, idx) => {
                        const featured = "featured" in TIERS[idx] && (TIERS[idx] as any).featured;
                        return (
                          <td
                            key={idx}
                            className={`p-4 text-center ${featured ? "bg-pop-pink/10" : ""}`}
                          >
                            {v === true ? (
                              <span className="inline-flex items-center justify-center size-7 rounded-full bg-pop-lime border-2 border-pop-ink font-display">
                                ✓
                              </span>
                            ) : v === false ? (
                              <span className="text-pop-ink/30 font-display">—</span>
                            ) : (
                              <span>{v}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* CTA row */}
                  <tr className="border-t-2 border-pop-ink bg-pop-yellow/40">
                    <td className="p-4 font-display uppercase text-pop-blue sticky left-0 bg-pop-yellow/40 z-10">
                      Get it
                    </td>
                    {TIERS.map((t) => {
                      const priceId = cycle === "yearly" ? t.yearlyPriceId : t.monthlyPriceId;
                      const featured = "featured" in t && t.featured;
                      return (
                        <td key={t.id} className="p-4 text-center">
                          <button
                            onClick={() => handleSubscribe(priceId)}
                            disabled={checkoutLoading && !!priceId}
                            className={`px-4 py-2 rounded-full border-2 border-pop-ink font-bold uppercase text-xs transition-colors disabled:opacity-60 ${
                              featured
                                ? "bg-pop-pink text-white hover:bg-pop-blue"
                                : "bg-white text-pop-ink hover:bg-pop-pink hover:text-white"
                            }`}
                          >
                            {checkoutLoading && !!priceId ? "Opening…" : t.cta}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
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
