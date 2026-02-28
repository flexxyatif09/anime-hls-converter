import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
  try {
    const payload = await req.json();

    // Jab Mux bolega ki video ready ho chuki hai
    if (payload.type === 'video.asset.ready') {
      const asset = payload.data;
      const playbackId = asset.playback_ids[0].id;
      const uploadId = asset.upload_id;
      
      // Asli .m3u8 link generate karna
      const m3u8Url = `https://stream.mux.com/${playbackId}.m3u8`;

      // Supabase Database se connect karna (Bina RLS block ke)
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Table mein .m3u8 link update karna
      const { error } = await supabaseAdmin
        .from('anime_episodes')
        .update({
          playback_id: playbackId,
          m3u8_url: m3u8Url,
          status: 'Ready'
        })
        .eq('upload_id', uploadId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response("Event ignored", { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});
