import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/send-nudges")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace("Bearer ", "") ?? "";
        if (token.length < 32) return new Response("Unauthorized", { status: 401 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("cron_tokens")
          .select("token")
          .eq("name", "push")
          .maybeSingle();
        if (!data || data.token !== token) return new Response("Unauthorized", { status: 401 });
        const { deliverDueNudges } = await import("@/lib/push.server");
        const result = await deliverDueNudges(supabaseAdmin);
        return Response.json(result);
      },
    },
  },
});
