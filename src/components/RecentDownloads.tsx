import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export interface RecentItem {
  id: string;
  title: string;
  thumbnail: string;
  format: string;
  quality: string;
  at: number;
}

export function RecentDownloads({ items }: { items: RecentItem[] }) {
  if (items.length === 0) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12"
    >
      <div className="mb-4 flex items-center gap-2">
        <Clock className="size-4 text-[var(--neon-blue)]" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Recent Downloads
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <motion.div
            key={it.id}
            whileHover={{ y: -4 }}
            className="glass overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-video overflow-hidden">
              <img src={it.thumbnail} alt={it.title} className="size-full object-cover" />
              <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold backdrop-blur">
                {it.format} · {it.quality}
              </div>
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-semibold">{it.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(it.at).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
