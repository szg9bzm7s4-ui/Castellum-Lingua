#!/bin/sh
# Lance tous les tests de l'appli dans un navigateur sans écran (Playwright).
# Usage : sh tests/run.sh            (tous les tests, environ 10 minutes)
#         sh tests/run.sh rapide     (sans les deux grands parcours)
cd "$(dirname "$0")/.." || exit 1
python3 -m http.server 8765 --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1
FAIL=0
run() { echo "== $1"; node "tests/$1.js" > "/tmp/castellum-test-$1.log" 2>&1; CODE=$?
  grep -E '✅|❌|erreurs|bouton|→' "/tmp/castellum-test-$1.log" | cut -c1-140
  if [ $CODE -ne 0 ] || grep -q '❌' "/tmp/castellum-test-$1.log" || grep -E "erreurs \[" "/tmp/castellum-test-$1.log" | grep -vq "erreurs \[\]"; then FAIL=1; echo "   >>> ÉCHEC : voir /tmp/castellum-test-$1.log"; fi; }
for t in outils ecoute visite lecons son darija version; do run "$t"; done
if [ "$1" != "rapide" ]; then run parcours; run latin; fi
[ $FAIL -eq 0 ] && echo "TOUT EST BON" || echo "AU MOINS UN TEST A ÉCHOUÉ"
exit $FAIL
