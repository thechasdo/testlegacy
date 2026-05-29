import logoUrl from "@/assets/soulprint-logo.png";

export function Logo({
  size = 36,
  className = "",
  showWordmark = true,
}: {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={logoUrl}
        alt="Soulprint logo"
        width={size}
        height={size}
        className="object-contain"
        style={{ width: size, height: size }}
      />
      {showWordmark && (
        <span className="font-display text-2xl text-pop-ink tracking-tighter lowercase leading-none">
          soulprint
        </span>
      )}
    </span>
  );
}
