import { createFileRoute } from "@tanstack/react-router";
import { createDownload, downloadInputSchema } from "@/lib/savetube.server";

export const Route = createFileRoute("/api/download")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const input = downloadInputSchema.parse(await request.json());
          return Response.json(await createDownload(input.url, input.format, input.quality, input.bitrate));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Could not create download.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});