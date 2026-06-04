import { createFileRoute } from "@tanstack/react-router";
import { getVideoInfo, infoInputSchema } from "@/lib/savetube.server";

export const Route = createFileRoute("/api/info")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const input = infoInputSchema.parse(await request.json());
          return Response.json(await getVideoInfo(input.url));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Could not load video details.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});