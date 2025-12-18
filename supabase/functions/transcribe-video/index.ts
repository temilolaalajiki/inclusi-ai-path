import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: "Video URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the video file
    console.log("Fetching video from:", videoUrl);
    const videoResponse = await fetch(videoUrl);
    
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    console.log("Video fetched, size:", videoBlob.size);

    // Create form data for ElevenLabs API
    const formData = new FormData();
    formData.append("file", videoBlob, "video.mp4");
    formData.append("model_id", "scribe_v1");
    formData.append("tag_audio_events", "false");
    formData.append("diarize", "false");

    console.log("Sending to ElevenLabs for transcription...");
    
    const transcriptionResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error("ElevenLabs error:", errorText);
      throw new Error(`ElevenLabs API error: ${transcriptionResponse.status}`);
    }

    const transcription = await transcriptionResponse.json();
    console.log("Transcription received:", transcription.text?.slice(0, 100));

    // Format captions with timestamps
    const captions = transcription.words?.map((word: any) => ({
      text: word.text,
      start: word.start,
      end: word.end,
    })) || [];

    return new Response(
      JSON.stringify({
        text: transcription.text,
        captions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Transcription error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to transcribe video";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
