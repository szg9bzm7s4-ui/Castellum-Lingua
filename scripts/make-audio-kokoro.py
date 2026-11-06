#!/usr/bin/env python3
"""Audio intégré avec la voix neuronale libre Kokoro (sans clé, sans service en ligne).

Prépare un environnement (une seule fois) :
    python3 -m venv .venv-tts && .venv-tts/bin/pip install kokoro-onnx soundfile
    # modèle : paquet npm « kokoro-q8-shards » (concaténer kokoro-q8.part0..5.bin en kokoro-q8.onnx)
    # voix   : dossier voices/ du paquet npm « kokoro-js »
Puis :
    .venv-tts/bin/python scripts/make-audio-kokoro.py it --model kokoro-q8.onnx --voices chemin/voices

Lit audio/sources/<langue>.json, écrit audio/<langue>/<cle>.mp3 (ffmpeg requis) et met à jour audio/manifest.json.
Un enregistrement natif déjà présent n'est jamais remplacé. La clé est la même que dans l'appli et dans make-audio.mjs.
"""
import argparse, glob, json, os, re, subprocess, sys, tempfile, unicodedata

VOICES = {"it": ("if_sara", "it"), "fr": ("ff_siwis", "fr-fr"), "es": ("ef_dora", "es"), "pt": ("pf_dora", "pt-br"), "en": ("bf_emma", "en-gb")}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def clean(t):
    t = re.sub(r"\s*\(.*?\)", "", str(t or ""))
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", t).strip())

def key(code, text):
    h = 0x811C9DC5
    for ch in code + "|" + clean(text):
        h ^= ord(ch); h = (h * 0x01000193) & 0xFFFFFFFF
    return "%08x" % h

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("lang"); ap.add_argument("--model", required=True); ap.add_argument("--voices", required=True)
    ap.add_argument("--speed", type=float, default=0.95); ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    if a.lang not in VOICES: sys.exit("Pas de voix Kokoro pour " + a.lang)
    import numpy as np, soundfile as sf
    from kokoro_onnx import Kokoro
    npz = os.path.join(tempfile.gettempdir(), "kokoro-voices.npz")
    np.savez(npz, **{os.path.basename(f)[:-4]: np.fromfile(f, dtype=np.float32).reshape(-1, 1, 256) for f in glob.glob(os.path.join(a.voices, "*.bin"))})
    k = Kokoro(a.model, npz)
    voice, elang = VOICES[a.lang]
    items = json.load(open(os.path.join(ROOT, "audio", "sources", a.lang + ".json"), encoding="utf8"))["items"]
    mf = os.path.join(ROOT, "audio", "manifest.json")
    man = json.load(open(mf, encoding="utf8")) if os.path.exists(mf) else {"version": 1, "files": {}}
    files = man.setdefault("files", {}).setdefault(a.lang, {})
    os.makedirs(os.path.join(ROOT, "audio", a.lang), exist_ok=True)
    made = kept = 0
    for it in items:
        kk = key(a.lang, it["text"]); rel = f"{a.lang}/{kk}.mp3"; out = os.path.join(ROOT, "audio", rel)
        cur = files.get(kk)
        if cur and os.path.exists(out) and (cur.get("src") == "native" or not a.force):
            kept += 1; continue
        samples, sr = k.create(clean(it["text"]), voice=voice, speed=a.speed, lang=elang)
        wav = os.path.join(tempfile.gettempdir(), kk + ".wav"); sf.write(wav, samples, sr)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.15",
                        "-ac", "1", "-ar", "24000", "-b:a", "48k", out], check=True)
        os.remove(wav)
        files[kk] = {"f": rel, "src": "tts", "voice": "kokoro-" + voice}
        made += 1
    json.dump(man, open(mf, "w", encoding="utf8"), ensure_ascii=False, indent=1); open(mf, "a").write("\n")
    print(f"{a.lang} : {made} créés, {kept} déjà présents.")

if __name__ == "__main__":
    main()
