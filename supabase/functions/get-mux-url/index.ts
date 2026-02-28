
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Mux from "https://esm.sh/@mux/mux-node@8.0.0";

// CORS Headers: Inke bina aapka HTML frontend connect nahi kar payega
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Browser ki pre-flight OPTIONS request ko handle karna
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Mux SDK initialize karna (Secrets Dashboard se fetch honge)
    const mux = new Mux({
      tokenId: Deno.env.get('MUX_TOKEN_ID'),
      tokenSecret: Deno.env.get('MUX_TOKEN_SECRET')
    });

    // Mux par ek naya "Direct Upload" create karna
    const upload = await mux.video.uploads.create({
      new_asset_settings: { 
        playback_policy: ['public'],
        mp4_support: 'standard' // Taaki agar download feature dena ho toh kaam aaye
      },
      cors_origin: '*', // Aapke admin panel ko permission deta hai
    });

    // Frontend ko Upload URL aur ID bhejenge
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
