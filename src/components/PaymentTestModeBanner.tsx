import { getPaddleEnvironment } from "@/lib/paddle";

export function PaymentTestModeBanner() {
  if (getPaddleEnvironment() !== "sandbox") return null;
  return (
    <div className="w-full bg-pop-yellow border-b-2 border-pop-ink px-4 py-2 text-center text-xs font-bold uppercase text-pop-ink">
      Test mode — payments in preview use test cards.{" "}
      <a
        href="https://docs.lovable.dev/features/payments#test-and-live-environments"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        Read more
      </a>
    </div>
  );
}
