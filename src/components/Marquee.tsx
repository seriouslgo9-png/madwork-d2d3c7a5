// Continuous neon marquee banner
export function Marquee() {
  const text = "Made by Madhav with Love and Hard Work ❤️";
  const items = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="relative w-full overflow-hidden border-y border-white/10 bg-black/40 py-3 backdrop-blur-md">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
        {items.concat(items).map((i) => (
          <span
            key={i}
            className="text-sm font-semibold uppercase tracking-[0.3em] text-gradient-neon neon-text"
          >
            {text} ✦
          </span>
        ))}
      </div>
    </div>
  );
}
