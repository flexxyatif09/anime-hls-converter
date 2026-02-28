import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Mux from "https://esm.sh/@mux/mux-node@8.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  // CORS Pre-flight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const mux = new Mux({
      tokenId: Deno.env.get('MUX_TOKEN_ID'),
      tokenSecret: Deno.env.get('MUX_TOKEN_SECRET')
    });

    const upload = await mux.video.uploads.create({
      new_asset_settings: { 
        playback_policy: ['public'] 
        // Yahan se error dene wali mp4_support line hata di gayi hai
      },
      cors_origin: '*', 
    });

    return new Response(
      JSON.stringify({ 
        uploadUrl: upload.url, 
        uploadId: upload.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
