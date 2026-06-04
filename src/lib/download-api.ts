export interface VideoInfo {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  channel?: string;
}

export const isBackendConfigured = () => true;

export async function fetchVideoInfo(url: string): Promise<VideoInfo> {
  const res = await fetch("/api/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export interface DownloadOpts {
  url: string;
  format: "mp4" | "mp3";
  quality: "144p" | "360p" | "720p" | "1080p" | "best";
  bitrate?: "128" | "192" | "320";
  onProgress?: (loaded: number, total: number | null) => void;
  signal?: AbortSignal;
}

export async function downloadToDevice(opts: DownloadOpts): Promise<string> {
  opts.onProgress?.(15, 100);

  const res = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: opts.url,
      format: opts.format,
      quality: opts.quality,
      bitrate: opts.bitrate,
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || "Download failed");
  }

  const data = (await res.json()) as { downloadUrl: string; filename: string };
  if (!data.downloadUrl) throw new Error("No download link returned");

  opts.onProgress?.(90, 100);
  const a = document.createElement("a");
  a.href = data.downloadUrl;
  a.download = data.filename;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
  opts.onProgress?.(100, 100);

  return data.filename;
}

export function formatDuration(sec: number): string {
  if (!sec || !isFinite(sec)) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}