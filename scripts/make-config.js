// Génère config.js à partir des variables d'environnement (build Vercel ou Netlify).
// Usage : node scripts/make-config.js
const fs = require('fs');
const path = require('path');
const env = (k) => (process.env[k] || '').trim();
const url = env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
const anon = env('SUPABASE_ANON_KEY') || env('VITE_SUPABASE_ANON_KEY');
if (env('SUPABASE_SERVICE_ROLE_KEY')) console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY est ignorée : elle ne doit jamais être envoyée au navigateur.');
if (!url || !anon) {
  // Pas de variables : on garde config.js tel quel (il a peut-être été rempli à la main).
  console.warn('⚠️  SUPABASE_URL ou SUPABASE_ANON_KEY manquante : config.js est conservé tel quel.');
  process.exit(0);
}
if (anon) {
  try {
    const payload = JSON.parse(Buffer.from(anon.split('.')[1], 'base64').toString());
    if (payload.role === 'service_role') { console.error('❌ SUPABASE_ANON_KEY contient une clé service_role. Build arrêté.'); process.exit(1); }
  } catch (e) { /* nouvelles clés « publishable » (sb_publishable_…) : pas de JWT à vérifier */ if (/^sb_secret_/.test(anon)) { console.error('❌ Clé secrète détectée. Build arrêté.'); process.exit(1); } }
}
const cfg = {
  supabaseUrl: url,
  supabaseAnonKey: anon,
  authRedirectUrl: env('AUTH_REDIRECT_URL'),
  enableApple: env('ENABLE_APPLE_SIGNIN') === 'true'
};
const out = `/* Généré par scripts/make-config.js — ne pas modifier à la main. */\nwindow.CASTELLUM_CONFIG = ${JSON.stringify(cfg, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'config.js'), out);
console.log('config.js généré', url ? '(Supabase activé)' : '(sans Supabase)');
