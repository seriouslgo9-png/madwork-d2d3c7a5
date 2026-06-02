import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import {
  Clipboard,
  Copy,
  Download,
  Link2,
  Loader2,
  Music,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";

type Format = "mp4" | "mp3";
type VideoQuality = "144p" | "360p" | "720p" | "1080p" | "Best Available";
type AudioBitrate = "128kbps" | "192kbps" | "320kbps";

interface VideoDetails {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
}

const VIDEO_QUALITIES: VideoQuality[] = ["144p", "360p", "720p", "1080p", "Best Available"];
const AUDIO_BITRATES: AudioBitrate[] = ["128kbps", "192kbps", "320kbps"];

// Estimate file size from quality (demo math)
const sizeFor = (format: Format, q: VideoQuality | AudioBitrate, durationSec: number) => {
  const minutes = durationSec / 60;
  if (format === "mp3") {
    const kbps = parseInt(q as string);
    return ((kbps * 60 * minutes) / 8 / 1024).toFixed(1) + " MB";
  }
  const map: Record<string, number> = {
    "144p": 4, "360p": 12, "720p": 35, "1080p": 70, "Best Available": 110,
  };
  return ((map[q as string] ?? 35) * minutes).toFixed(1) + " MB";
};

// Extract YouTube ID from a variety of URL shapes
const extractId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

interface Props {
  onComplete: (item: { title: string; thumbnail: string; format: string; quality: string }) => void;
}

export function DownloaderCard({ onComplete }: Props) {
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [format, setFormat] = useState<Format>("mp4");
  const [videoQ, setVideoQ] = useState<VideoQuality>("1080p");
  const [audioQ, setAudioQ] = useState<AudioBitrate>("320kbps");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const durationSec = 247; // demo duration

  const handleFetch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const id = extractId(url.trim());
    if (!id) {
      toast.error("Invalid YouTube URL", { description: "Paste a valid youtube.com or youtu.be link." });
      return;
    }
    setFetching(true);
    setVideo(null);
    // Simulated detail fetch (real extraction can't run in this edge runtime).
    await new Promise((r) => setTimeout(r, 1200));
    setVideo({
      id,
      title: "Cinematic 4K — Neon City After Midnight",
      thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      duration: "4:07",
      channel: "Neon Visuals",
    });
    setFetching(false);
    toast.success("Video details loaded");
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      toast.success("Pasted from clipboard");
    } catch {
      toast.error("Clipboard access denied");
    }
  };

  const handleCopy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const handleDownload = async () => {
    if (!video) return;
    setDownloading(true);
    setProgress(0);
    // Simulate progress
    for (let i = 1; i <= 100; i += 4) {
      await new Promise((r) => setTimeout(r, 60));
      setProgress(i);
    }
    setDownloading(false);
    const q = format === "mp4" ? videoQ : audioQ;
    toast.success("Download complete (demo)", {
      description: `${video.title} — ${format.toUpperCase()} • ${q}`,
    });
    onComplete({ title: video.title, thumbnail: video.thumbnail, format: format.toUpperCase(), quality: q });
    setProgress(0);
  };

  const selectedQuality = format === "mp4" ? videoQ : audioQ;
  const estSize = video ? sizeFor(format, selectedQuality, durationSec) : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="glass rounded-3xl p-6 md:p-10 neon-glow-purple"
    >
      <form onSubmit={handleFetch} className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Link2 className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL (e.g. https://youtu.be/...)"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-32 text-foreground placeholder:text-muted-foreground/70 focus:border-[var(--neon-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--neon-purple)]/50 transition"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
            <button
              type="button"
              onClick={handlePaste}
              className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition"
              title="Paste from clipboard"
            >
              <Clipboard className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition"
              title="Copy link"
            >
              <Copy className="size-4" />
            </button>
          </div>
        </div>
        <motion.button
          type="submit"
          disabled={fetching || !url}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="gradient-neon animate-pulse-glow rounded-xl px-6 py-4 font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {fetching ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
          {fetching ? "Fetching..." : "Fetch"}
        </motion.button>
      </form>

      <AnimatePresence mode="wait">
        {fetching && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 flex flex-col items-center justify-center py-16"
          >
            <div className="relative">
              <div className="size-16 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 size-16 animate-spin rounded-full border-4 border-transparent border-t-[var(--neon-purple)] border-r-[var(--neon-pink)]" />
            </div>
            <p className="mt-4 text-sm uppercase tracking-widest text-muted-foreground">Scanning the stream...</p>
          </motion.div>
        )}

        {video && !fetching && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]"
          >
            {/* Thumbnail */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 group">
              <img
                src={video.thumbnail}
                alt={video.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                }}
                className="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
              <div className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-xs font-mono backdrop-blur">
                {video.duration}
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="line-clamp-2 text-xl font-bold text-foreground">{video.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{video.channel}</p>
              </div>

              {/* Format toggle */}
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: "mp4", icon: Video, label: "MP4 Video" },
                  { key: "mp3", icon: Music, label: "MP3 Audio" },
                ] as const).map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setFormat(key)}
                    className={`group relative overflow-hidden rounded-xl border p-4 transition ${
                      format === key
                        ? "border-[var(--neon-purple)] bg-white/5 neon-glow-purple"
                        : "border-white/10 bg-white/[0.02] hover:border-white/30"
                    }`}
                  >
                    <Icon className="mb-2 size-5" />
                    <p className="text-sm font-semibold">{label}</p>
                  </button>
                ))}
              </div>

              {/* Quality pills */}
              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                  {format === "mp4" ? "Video Quality" : "Audio Bitrate"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(format === "mp4" ? VIDEO_QUALITIES : AUDIO_BITRATES).map((q) => {
                    const active = format === "mp4" ? videoQ === q : audioQ === q;
                    return (
                      <button
                        key={q}
                        onClick={() =>
                          format === "mp4" ? setVideoQ(q as VideoQuality) : setAudioQ(q as AudioBitrate)
                        }
                        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                          active
                            ? "border-[var(--neon-pink)] bg-[var(--neon-pink)]/10 text-foreground neon-glow-pink"
                            : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground"
                        }`}
                      >
                        {q}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meta row */}
              <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <Meta label="Format" value={format.toUpperCase()} />
                <Meta label="Quality" value={selectedQuality} />
                <Meta label="Est. Size" value={estSize} />
              </div>

              {/* Progress */}
              {downloading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Downloading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full gradient-neon"
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "linear" }}
                    />
                  </div>
                </div>
              )}

              {/* Download */}
              <motion.button
                onClick={handleDownload}
                disabled={downloading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="gradient-neon animate-pulse-glow flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-60"
              >
                {downloading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Download className="size-5" />
                )}
                {downloading ? "Downloading" : "Download Now"}
                {!downloading && <Zap className="size-4" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
