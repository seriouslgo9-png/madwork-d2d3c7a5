// Talks to a self-hosted NeonTube backend (Node/Express + yt-dlp).
// Configure via env:
//   VITE_DOWNLOAD_API       = http://localhost:8080
//   VITE_DOWNLOAD_API_KEY   = (optional, matches backend DOWNLOAD_API_KEY)

const API = import.meta.env.VITE_DOWNLOAD_API as string | undefined;
const API_KEY = import.meta.env.VITE_DOWNLOAD_API_KEY as string | undefined;

export const isBackendConfigured = () => Boolean(API);

const headers = (): Record<string, string> => {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) h["x-api-key"] = API_KEY;
  return h;
};

export interface VideoInfo {
  id: string;
  title: string;
  duration: number; // seconds
  thumbnail: string;
  channel?: string;
}

export async function fetchVideoInfo(url: string): Promise<VideoInfo> {
  if (!API) throw new Error("Backend not configured");
  const res = await fetch(`${API}/api/info`, {
    method: "POST",
    headers: headers(),
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

// Streams the file from the backend and triggers a browser save.
// Returns the filename written to the user's device.
export async function downloadToDevice(opts: DownloadOpts): Promise<string> {
  if (!API) throw new Error("Backend not configured");

  const res = await fetch(`${API}/api/download`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      url: opts.url,
      format: opts.format,
      quality: opts.quality,
      bitrate: opts.bitrate,
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || "Download failed");
  }

  // Pull filename from Content-Disposition
  const disp = res.headers.get("Content-Disposition") || "";
  const match = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i.exec(disp);
  const filename = decodeURIComponent(match?.[1] || match?.[2] || `download.${opts.format}`);

  const totalHeader = res.headers.get("Content-Length");
  const total = totalHeader ? parseInt(totalHeader, 10) : null;

  // Stream chunks so we can report progress
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    opts.onProgress?.(loaded, total);
  }

  const blob = new Blob(chunks, {
    type: opts.format === "mp3" ? "audio/mpeg" : "video/mp4",
  });

  // Trigger browser save dialog → file lands in user's Downloads folder
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);

  return filename;
}

// Format seconds to mm:ss or h:mm:ss
export function formatDuration(sec: number): string {
  if (!sec || !isFinite(sec)) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
