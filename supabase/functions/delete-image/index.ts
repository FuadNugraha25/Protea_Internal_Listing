import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const { path } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Convert full public URL → storage object path
  const cleanPath = path.replace(/^.*storage\.supabase\.co\/object\/public\//, "");

  const { error } = await supabase.storage.from("house-photos").remove([cleanPath]);

  if (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }

  return new Response("ok", { status: 200 });
});
