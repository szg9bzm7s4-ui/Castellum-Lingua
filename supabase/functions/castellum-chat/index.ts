// Fonction Supabase « castellum-chat » : conversation avec une IA dans la langue étudiée.
// La clé Anthropic reste côté serveur (secret ANTHROPIC_API_KEY) ; seuls les utilisateurs connectés
// peuvent appeler la fonction (vérification du jeton Supabase, activée par défaut).
import Anthropic from "npm:@anthropic-ai/sdk@0.131.0";

const client = new Anthropic(); // lit ANTHROPIC_API_KEY dans les secrets de la fonction
const MODEL = "claude-opus-5-5";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SCENARIOS: Record<string, string> = {
  libre: "a free, friendly conversation about the learner's life, tastes and day",
  cafe: "ordering at a café or restaurant; you are the waiter",
  voyage: "travelling: at the train station, asking for directions, buying tickets; you are a helpful local",
  hotel: "checking into a hotel; you are the receptionist",
  medecin: "a visit to the doctor; you are the doctor",
  entretien: "a job interview; you are the recruiter",
  rencontre: "meeting someone new at a party; you are a friendly guest",
  marche: "shopping at a market; you are the stallholder",
  debat: "a respectful debate of ideas on a topic you propose, adapted to the level",
  rome: "daily life in ancient Rome; you are a Roman citizen in the forum",
};
const ANCIENT = new Set(["la", "grc", "arc", "egy", "sux", "akk"]);

function clean(s: unknown, max: number): string {
  return String(s ?? "").replace(/[\u0000-\u001f]/g, " ").slice(0, max).trim();
}

function systemPrompt(p: { lang: string; langName: string; srcName: string; level: string; scenario: string; correct: boolean }): string {
  const lines = [
    `You are Castellum, a warm and patient conversation partner in a language-learning app.`,
    `The learner speaks ${p.srcName} and is learning ${p.langName} at CEFR level ${p.level}.`,
    `Reply only in ${p.langName}, at a level suited to ${p.level}: very short and simple sentences for A1-A2, natural everyday language for B1-B2, rich and idiomatic language for C1-C2.`,
    `Keep each reply to 1-4 sentences and end with a question or a prompt that keeps the conversation going.`,
    `Situation: ${SCENARIOS[p.scenario] ?? SCENARIOS.libre}. Stay in that role.`,
    `If the learner writes in ${p.srcName} or seems stuck, help in one short sentence of ${p.srcName}, then continue in ${p.langName}.`,
    p.correct
      ? `If the learner's last message contains mistakes in ${p.langName}, add a final line starting with "✏️ " that gives the corrected sentence and a very short explanation in ${p.srcName}. If there is no mistake, add nothing.`
      : `Do not correct the learner's mistakes; just keep the conversation natural.`,
    `If ${p.langName} is not written in the Latin alphabet, write it in its own script and, for levels A1-B1, add a final line starting with "🔤 " giving a romanization of your reply.`,
    `Plain text only: no markdown, no lists, no headings.`,
  ];
  if (ANCIENT.has(p.lang)) {
    lines.push(`${p.langName} is an ancient language: use its classical, attested forms; for modern things, use a natural periphrasis instead of inventing words.`);
  }
  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  let body: any;
  try { body = await req.json(); } catch { return new Response("Bad JSON", { status: 400, headers: CORS }); }

  const params = {
    lang: clean(body.lang, 12),
    langName: clean(body.langName, 40) || "the target language",
    srcName: clean(body.srcName, 40) || "French",
    level: LEVELS.includes(body.level) ? body.level : "A1",
    scenario: SCENARIOS[body.scenario] ? body.scenario : "libre",
    correct: body.correct !== false,
  };
  const raw: any[] = Array.isArray(body.messages) ? body.messages.slice(-24) : [];
  const messages: Anthropic.Beta.BetaMessageParam[] = raw
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role, content: clean(m.content, 2000) }));
  if (!messages.length || messages[0].role !== "user") {
    return new Response("Bad messages", { status: 400, headers: CORS });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = client.beta.messages.stream({
          model: MODEL,
          max_tokens: 2048,
          output_config: { effort: "low" },
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          system: systemPrompt(params),
          messages,
        });
        s.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
        const final = await s.finalMessage();
        if (final.stop_reason === "refusal") controller.enqueue(encoder.encode("\n[[refus]]"));
      } catch (err) {
        const status = err instanceof Anthropic.APIError ? err.status : 0;
        controller.enqueue(encoder.encode(`\n[[erreur ${status || ""}]]`));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
});
