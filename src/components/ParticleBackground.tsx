import { useMemo } from "react";

// Lightweight animated particle layer (CSS-only, no canvas)
export function ParticleBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 4 + 1,
        delay: Math.random() * 8,
        duration: Math.random() * 8 + 6,
        hue: ["230", "310", "350"][i % 3],
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `oklch(0.8 0.2 ${p.hue})`,
            boxShadow: `0 0 ${p.size * 4}px oklch(0.8 0.2 ${p.hue})`,
            animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
