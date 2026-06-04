import { z } from "zod";

const SECRET_KEY_HEX = "C5D58EF67A7584E4A29F6C35BBC4EB12";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

const videoUrlSchema = z.string().url().refine((value) => getVideoId(value), "Invalid YouTube URL");

type SaveTubeInfo = {
  id: string;
  key: string;
  url: string;
  title: string;
  titleSlug?: string;
  thumbnail: string;
  duration: number;
  channel?: string;
};

export const infoInputSchema = z.object({
  url: videoUrlSchema,
});

export const downloadInputSchema = z.object({
  url: videoUrlSchema,
  format: z.enum(["mp4", "mp3"]),
  quality: z.enum(["144p", "360p", "720p", "1080p", "best"]),
  bitrate: z.enum(["128", "192", "320"]).optional(),
});

export function getVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    if (!host.endsWith("youtube.com")) return null;
    if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
    const match = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function getVideoInfo(url: string) {
  const info = await getSaveTubeInfo(url);
  return {
    id: info.id,
    title: info.title,
    duration: Number(info.duration) || 0,
    thumbnail: info.thumbnail || `https://i.ytimg.com/vi/${info.id}/maxresdefault.jpg`,
    channel: info.channel || "YouTube",
  };
}

export async function createDownload(url: string, format: "mp4" | "mp3", quality: string, bitrate?: string) {
  const info = await getSaveTubeInfo(url);
  const cdn = await getRandomCdn();
  const selectedQuality = format === "mp3" ? bitrate || "128" : quality === "best" ? "1080" : quality.replace("p", "");
  const response = await fetch(`https://${cdn}/download`, {
    method: "POST",
    headers: providerHeaders(),
    body: JSON.stringify({
      downloadType: format === "mp3" ? "audio" : "video",
      quality: selectedQuality,
      key: info.key,
    }),
  });

  const payload = await response.json().catch(() => null) as { status?: boolean; data?: { downloadUrl?: string }; message?: string } | null;
  const downloadUrl = payload?.data?.downloadUrl;
  if (!response.ok || !payload?.status || !downloadUrl) {
    throw new Error(payload?.message || "The download service could not create this file.");
  }

  return {
    downloadUrl,
    filename: `${sanitizeFilename(info.title)}-${selectedQuality}${format === "mp3" ? "kbps" : "p"}.${format}`,
    title: info.title,
    thumbnail: info.thumbnail,
  };
}

async function getSaveTubeInfo(url: string): Promise<SaveTubeInfo> {
  const cdn = await getRandomCdn();
  const response = await fetch(`https://${cdn}/v2/info`, {
    method: "POST",
    headers: providerHeaders(),
    body: JSON.stringify({ url: `https://youtube.com/watch?v=${getVideoId(url)}` }),
  });

  const payload = await response.json().catch(() => null) as { status?: boolean; data?: string; message?: string } | null;
  if (!response.ok || !payload?.status || !payload.data) {
    throw new Error(payload?.message || "Could not read video details.");
  }

  return decryptInfo(payload.data);
}

async function getRandomCdn(): Promise<string> {
  const response = await fetch("https://media.savetube.vip/api/random-cdn", {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  const payload = await response.json().catch(() => null) as { cdn?: string } | null;
  if (!response.ok || !payload?.cdn) throw new Error("Download provider is unavailable.");
  return payload.cdn;
}

async function decryptInfo(encrypted: string): Promise<SaveTubeInfo> {
  const bytes = Uint8Array.from(atob(encrypted), (char) => char.charCodeAt(0));
  const iv = bytes.slice(0, 16);
  const content = bytes.slice(16);
  const key = await crypto.subtle.importKey("raw", hexToBytes(SECRET_KEY_HEX), { name: "AES-CBC" }, false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, content);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

function providerHeaders() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": USER_AGENT,
    Referer: "https://save-tube.com/",
  };
}

function hexToBytes(hex: string) {
  return Uint8Array.from(hex.match(/.{1,2}/g) || [], (byte) => parseInt(byte, 16));
}

function sanitizeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ").trim().slice(0, 120) || "youtube-download";
}