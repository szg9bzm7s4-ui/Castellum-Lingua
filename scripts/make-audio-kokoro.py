#!/usr/bin/env python3
"""Audio intégré avec la voix neuronale libre Kokoro (sans clé, sans service en ligne).

Prépare un environnement (une seule fois) :
    python3 -m venv .venv-tts && .venv-tts/bin/pip install kokoro-onnx soundfile
    # modèle : paquet npm « kokoro-q8-shards » (concaténer kokoro-q8.part0..5.bin en kokoro-q8.onnx)
    # voix   : dossier voices/ du paquet npm « kokoro-js »
Puis :
    .venv-tts/bin/python scripts/make-audio-kokoro.py it --model kokoro-q8.onnx --voices chemin/voices

Lit audio/sources/<langue>.json, écrit audio/<langue>/<cle>.mp3 (ffmpeg requis), l'index audio/<langue>/index.json
(chargé par l'appli seulement pour la langue apprise) et la liste des langues dans audio/manifest.json.
Un enregistrement natif déjà présent n'est jamais remplacé. La clé est la même que dans l'appli et dans make-audio.mjs.
"""
import argparse, glob, json, os, re, subprocess, sys, tempfile, unicodedata

VOICES = {"it": ("if_sara", "it"), "fr": ("ff_siwis", "fr-fr"), "es": ("ef_dora", "es"), "pt": ("pf_dora", "pt"), "en": ("bf_emma", "en-gb"), "hi": ("hf_alpha", "hi")}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def clean(t):
    t = re.sub(r"\s*\(.*?\)", "", str(t or ""))
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", t).strip())

def key(code, text):
    h = 0x811C9DC5
    for ch in code + "|" + clean(text):
        h ^= ord(ch); h = (h * 0x01000193) & 0xFFFFFFFF
    return "%08x" % h

def _init(model, npz, voice, elang, speed, br):
    global K, V
    import onnxruntime as ort
    from kokoro_onnx import Kokoro
    o = ort.SessionOptions(); o.intra_op_num_threads = 1; o.inter_op_num_threads = 1
    K = Kokoro.from_session(ort.InferenceSession(model, o, providers=["CPUExecutionProvider"]), npz)
    V = (voice, elang, speed, br)

def _make(job):
    import soundfile as sf
    kk, text, out = job
    voice, elang, speed, br = V
    try:
        samples, sr = K.create(clean(text), voice=voice, speed=speed, lang=elang)
        wav = out[:-4] + ".wav"; sf.write(wav, samples, sr)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af",
                        "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.15",
                        "-ac", "1", "-ar", "24000", "-b:a", br, out], check=True)
        os.remove(wav); return kk, True
    except Exception as e:
        print("Échec :", text, e, file=sys.stderr); return kk, False

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("lang"); ap.add_argument("--model", required=True); ap.add_argument("--voices", required=True)
    ap.add_argument("--speed", type=float, default=0.95); ap.add_argument("--bitrate", default="32k")
    ap.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) - 1)); ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    if a.lang not in VOICES: sys.exit("Pas de voix Kokoro pour " + a.lang)
    import numpy as np
    from multiprocessing import Pool
    npz = os.path.join(tempfile.gettempdir(), "kokoro-voices.npz")
    if not os.path.exists(npz):
        np.savez(npz, **{os.path.basename(f)[:-4]: np.fromfile(f, dtype=np.float32).reshape(-1, 1, 256) for f in glob.glob(os.path.join(a.voices, "*.bin"))})
    voice, elang = VOICES[a.lang]
    items = json.load(open(os.path.join(ROOT, "audio", "sources", a.lang + ".json"), encoding="utf8"))["items"]
    d = os.path.join(ROOT, "audio", a.lang); os.makedirs(d, exist_ok=True)
    ixf = os.path.join(d, "index.json")
    ix = json.load(open(ixf, encoding="utf8")) if os.path.exists(ixf) else {}
    mf = os.path.join(ROOT, "audio", "manifest.json")
    man = json.load(open(mf, encoding="utf8")) if os.path.exists(mf) else {}
    for k, v in (man.get("files", {}).get(a.lang) or {}).items():  # ancien format : on reprend les entrées
        ix.setdefault(k, "n" if v.get("src") == "native" else "t")
    jobs, seen = [], set()
    for it in items:
        kk = key(a.lang, it["text"])
        if kk in seen or not clean(it["text"]): continue
        seen.add(kk); out = os.path.join(d, kk + ".mp3")
        if os.path.exists(out) and kk in ix and (ix[kk] == "n" or not a.force): continue
        jobs.append((kk, it["text"], out))
    print(f"{a.lang} : {len(jobs)} phrases à générer ({a.workers} processus)…", flush=True)
    done = 0
    with Pool(a.workers, _init, (a.model, npz, voice, elang, a.speed, a.bitrate)) as pool:
        for kk, ok in pool.imap_unordered(_make, jobs, chunksize=8):
            if ok: ix[kk] = "t"
            done += 1
            if done % 200 == 0:
                print(f"  {done}/{len(jobs)}", flush=True)
                json.dump(ix, open(ixf, "w", encoding="utf8"), separators=(",", ":"))
    json.dump(ix, open(ixf, "w", encoding="utf8"), separators=(",", ":"))
    man = json.load(open(mf, encoding="utf8")) if os.path.exists(mf) else {}
    man["version"] = 2
    man.setdefault("langs", {})[a.lang] = {"n": len(ix), "voice": "kokoro-" + voice}
    man.setdefault("files", {}).pop(a.lang, None)
    json.dump(man, open(mf, "w", encoding="utf8"), ensure_ascii=False, indent=1); open(mf, "a").write("\n")
    print(f"{a.lang} : terminé, {len(ix)} phrases avec audio.")

if __name__ == "__main__":
    main()
