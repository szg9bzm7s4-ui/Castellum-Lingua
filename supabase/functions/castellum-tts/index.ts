// Fonction Supabase « castellum-tts » : voix neuronales marocaine, algérienne et tunisienne (Microsoft Azure).
// La clé Azure reste côté serveur (secrets AZURE_SPEECH_KEY et AZURE_SPEECH_REGION) ; seuls les
// utilisateurs connectés peuvent appeler la fonction (vérification du jeton Supabase, activée par défaut).
// L'application envoie le texte déjà réécrit en lettres arabes et reçoit un fichier MP3.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Deux voix par darija : [voix féminine, voix masculine].
const VOICES: Record<string, { locale: string; voices: [string, string] }> = {
  ary: { locale: "ar-MA", voices: ["ar-MA-MounaNeural", "ar-MA-JamalNeural"] },
  arq: { locale: "ar-DZ", voices: ["ar-DZ-AminaNeural", "ar-DZ-IsmaelNeural"] },
  aeb: { locale: "ar-TN", voices: ["ar-TN-ReemNeural", "ar-TN-HediNeural"] },
};
const MAX_CHARS = 400;

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  const key = Deno.env.get("AZURE_SPEECH_KEY");
  const region = Deno.env.get("AZURE_SPEECH_REGION");
  if (!key || !region) return new Response("TTS not configured", { status: 503, headers: CORS });

  let body: { text?: unknown; lang?: unknown; slow?: unknown; male?: unknown };
  try { body = await req.json(); } catch { return new Response("Bad JSON", { status: 400, headers: CORS }); }

  const lang = String(body.lang ?? "");
  const conf = VOICES[lang];
  if (!conf) return new Response("Unsupported language", { status: 400, headers: CORS });
  const text = String(body.text ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, MAX_CHARS);
  if (!text) return new Response("Empty text", { status: 400, headers: CORS });
  const voice = conf.voices[body.male === true ? 1 : 0];
  const rate = body.slow === true ? "-30%" : "-5%";

  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${conf.locale}">` +
    `<voice name="${voice}"><prosody rate="${rate}">${xmlEscape(text)}</prosody></voice></speak>`;

  let res: Response;
  try {
    res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "castellum-lingua",
      },
      body: ssml,
    });
  } catch {
    return new Response("TTS unreachable", { status: 502, headers: CORS });
  }
  if (!res.ok) return new Response(`TTS error ${res.status}`, { status: 502, headers: CORS });

  return new Response(res.body, {
    headers: { ...CORS, "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=31536000" },
  });
});
