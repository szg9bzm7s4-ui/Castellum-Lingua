"""À lancer avant chaque publication.
- Met à jour l'empreinte (?v=…) de chaque fichier app/*.js et data/units-extra.js cité dans index.html,
  pour qu'un fichier modifié ne soit jamais resservi depuis la mémoire du navigateur.
- Met à jour <meta name="castellum-build">, qui déclenche le bandeau « Nouvelle version disponible ».
Usage : python3 scripts/version.py"""
import re, os, hashlib, datetime
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
p = os.path.join(ROOT, "index.html")
s = open(p, encoding="utf8").read()
changed = 0
def stamp(m):
    global changed
    path = m.group(1)
    h = hashlib.md5(open(os.path.join(ROOT, path), "rb").read()).hexdigest()[:8]
    if m.group(2) != h:
        changed += 1
    return 'src="%s?v=%s"' % (path, h)
s = re.sub(r'src="((?:app|data)/[^"?]+\.js)\?v=([0-9a-f]+)"', stamp, s)
build = datetime.datetime.utcnow().strftime("%Y%m%d%H%M")
s, n = re.subn(r'<meta name="castellum-build" content="[^"]*">', '<meta name="castellum-build" content="%s">' % build, s, count=1)
assert n == 1, "balise castellum-build introuvable"
missing = [f for f in sorted(os.listdir(os.path.join(ROOT, "app"))) if ('src="app/%s?' % f) not in s]
open(p, "w", encoding="utf8").write(s)
print("build", build, "· fichiers dont l'empreinte a changé :", changed, "· fichiers non cités :", missing)
