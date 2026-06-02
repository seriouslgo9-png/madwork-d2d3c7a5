import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Toaster } from "sonner";
import { Github, Youtube } from "lucide-react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Marquee } from "@/components/Marquee";
import { DownloaderCard } from "@/components/DownloaderCard";
import { RecentDownloads, type RecentItem } from "@/components/RecentDownloads";
import { isBackendConfigured } from "@/lib/download-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeonTube Downloader — Fast MP3 & MP4 YouTube Downloads" },
      {
        name: "description",
        content:
          "Download YouTube videos instantly in MP4 or MP3 with multiple quality options. Glassmorphism + neon cyberpunk UI.",
      },
      { property: "og:title", content: "NeonTube Downloader" },
      {
        property: "og:description",
        content: "Fast, High Quality, MP3 & MP4 Downloads.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [recent, setRecent] = useState<RecentItem[]>([]);

  const addRecent = (item: Omit<RecentItem, "id" | "at">) => {
    setRecent((r) =>
      [{ ...item, id: crypto.randomUUID(), at: Date.now() }, ...r].slice(0, 6)
    );
  };

  return (
    <div className="relative min-h-screen animated-bg">
      <ParticleBackground />
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.18 0.05 280 / 0.85)",
            border: "1px solid oklch(0.72 0.22 310 / 0.4)",
            color: "oklch(0.97 0.02 280)",
            backdropFilter: "blur(20px)",
          },
        }}
      />

      <Marquee />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="gradient-neon flex size-10 items-center justify-center rounded-xl neon-glow-purple">
            <Youtube className="size-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">MadWork</p>
            <h1 className="font-bold text-gradient-neon">NeonTube</h1>
          </div>
        </div>
        <a
          href="#"
          className="glass hidden items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground transition hover:text-foreground sm:flex"
        >
          <Github className="size-4" /> v1.0
        </a>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-8">
        {/* Hero */}
        <section className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-muted-foreground"
          >
            <span className={`size-2 animate-pulse rounded-full ${isBackendConfigured() ? "bg-[var(--neon-blue)]" : "bg-[var(--neon-pink)]"}`} />
            {isBackendConfigured() ? "Live Backend Connected" : "Demo Mode · Configure VITE_DOWNLOAD_API"}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-balance text-5xl font-black leading-[1.05] tracking-tight md:text-7xl"
          >
            <span className="text-gradient-neon neon-text">Download YouTube</span>
            <br />
            <span className="text-foreground">Videos Instantly</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg"
          >
            Fast, High Quality, MP3 &amp; MP4 Downloads — wrapped in a glassmorphic neon UI.
          </motion.p>
        </section>

        <DownloaderCard onComplete={addRecent} />

        <RecentDownloads items={recent} />

        {/* Disclosure */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground"
        >
          This is a UI demo. Actual YouTube extraction is not performed — downloading content from
          YouTube without permission may violate their Terms of Service. Hook this UI up to your own
          backend (e.g. yt-dlp on a Node server) to enable real downloads.
        </motion.p>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-6 text-center text-xs text-muted-foreground">
        <span className="text-gradient-neon font-semibold">MadWork</span> · Crafted with neon &amp; glass
      </footer>
    </div>
  );
}
