#!/usr/bin/env node
// Prépare l'audio intégré de Castellum Lingua (fichiers servis avec l'appli, écoutables hors ligne).
//
// Deux usages :
//   1. Voix neuronales Azure (en attendant des enregistrements natifs) :
//        AZURE_SPEECH_KEY=… AZURE_SPEECH_REGION=westeurope node scripts/make-audio.mjs it
//      La clé reste sur ton ordinateur : elle n'est jamais écrite dans le dépôt ni envoyée au navigateur.
//   2. Enregistrements natifs : dépose des fichiers MP3 nommés d'après la colonne « cle » de
//      audio/sources/it-a-enregistrer.csv dans un dossier, puis :
//        node scripts/make-audio.mjs it --native chemin/du/dossier
//      Un enregistrement natif remplace toujours la voix de synthèse pour la même phrase.
//
// Le script lit audio/sources/<langue>.json, écrit audio/<langue>/<cle>.mp3 et met à jour audio/manifest.json.
// La clé d'une phrase est la même que dans l'appli : FNV-1a 32 bits de « langue|texte normalisé ».

import fs from "node:fs";
import path from "node:path";

const VOICES = {
  it: "it-IT-ElsaNeural", es: "es-ES-ElviraNeural", fr: "fr-FR-DeniseNeural", pt: "pt-PT-RaquelNeural",
  en: "en-GB-SoniaNeural", de: "de-DE-KatjaNeural", nl: "nl-NL-FennaNeural",
};
const LOCALES = { it: "it-IT", es: "es-ES", fr: "fr-FR", pt: "pt-PT", en: "en-GB", de: "de-DE", nl: "nl-NL" };

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const lang = process.argv[2];
const nativeIx = process.argv.indexOf("--native");
const nativeDir = nativeIx > 0 ? process.argv[nativeIx + 1] : null;
if (!lang) {
  console.error("Usage : node scripts/make-audio.mjs <langue> [--native dossier]");
  process.exit(1);
}

const clean = (t) => String(t || "").replace(/\s*\(.*?\)/g, "").normalize("NFC").trim().replace(/\s+/g, " ");
function key(code, text) {
  const s = code + "|" + clean(text);
  let h = 0x811c9dc5;
  for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return ("0000000" + h.toString(16)).slice(-8);
}
const xml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const srcFile = path.join(root, "audio", "sources", lang + ".json");
const items = JSON.parse(fs.readFileSync(srcFile, "utf8")).items;
const manifestFile = path.join(root, "audio", "manifest.json");
const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, "utf8")) : { version: 1, files: {} };
manifest.files[lang] = manifest.files[lang] || {};
const outDir = path.join(root, "audio", lang);
fs.mkdirSync(outDir, { recursive: true });

let made = 0, kept = 0, natives = 0, failed = 0;
for (const it of items) {
  const k = key(lang, it.text);
  if (k !== it.key) console.warn(`Clé recalculée pour « ${it.text} » : ${it.key} → ${k}`);
  const rel = `${lang}/${k}.mp3`, out = path.join(root, "audio", rel);

  if (nativeDir) {
    const f = path.join(nativeDir, k + ".mp3");
    if (fs.existsSync(f)) {
      fs.copyFileSync(f, out);
      manifest.files[lang][k] = { f: rel, src: "native" };
      natives++;
    }
    continue;
  }
  const cur = manifest.files[lang][k];
  if (cur && fs.existsSync(out)) { kept++; continue; } // déjà présent (natif ou synthèse) : on ne refait pas
  const keyAz = process.env.AZURE_SPEECH_KEY, region = process.env.AZURE_SPEECH_REGION;
  if (!keyAz || !region) { console.error("Définis AZURE_SPEECH_KEY et AZURE_SPEECH_REGION (ou utilise --native)."); process.exit(1); }
  const voice = VOICES[lang];
  if (!voice) { console.error("Pas de voix Azure configurée pour " + lang); process.exit(1); }
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${LOCALES[lang]}"><voice name="${voice}"><prosody rate="-5%">${xml(clean(it.text))}</prosody></voice></speak>`;
  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": keyAz, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3", "User-Agent": "castellum-lingua" },
    body: ssml,
  });
  if (!res.ok) { console.error(`Échec (${res.status}) : ${it.text}`); failed++; continue; }
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  manifest.files[lang][k] = { f: rel, src: "tts", voice };
  made++;
  await new Promise((r) => setTimeout(r, 120)); // reste sous la limite de l'offre gratuite
}
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 1) + "\n");
console.log(`${lang} : ${made} créés, ${natives} enregistrements natifs, ${kept} déjà présents, ${failed} échecs.`);
