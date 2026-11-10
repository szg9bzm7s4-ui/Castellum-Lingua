# Traduction mot à mot (infobulles des exercices)

Quand on touche un mot dans un exercice, l'infobulle cherche sa traduction dans cet ordre :

1. **Le cours** : un mot isolé du cours qui correspond exactement (comme avant).
2. **Les traductions déduites** : `data/gloss/<langue apprise>.js`, chargé à la demande au premier exercice. Pour chaque langue de l'apprenant, `t` donne mot étranger → mot de sa langue, et `r` l'inverse (pour toucher les mots de la consigne).
3. **Une forme proche du cours** (« ≈ »), comme avant.
4. Sinon : « Pas de traduction pour ce mot seul », avec la phrase entière.

Dès qu'une traduction déduite est affichée, la phrase entière traduite est montrée en dessous, pour que l'apprenant puisse vérifier le sens dans son contexte.

## Comment les traductions sont déduites

- **Corpus** : les 2 878 phrases parallèles du cours (A1 à C2), des scènes et des registres, dans les 8 langues (fr, it, es, pt, en, de, nl, ary).
- **Alignement** : pour chaque paire de langues, liaison compétitive des mots (score de Dice entre mots qui apparaissent dans les mêmes phrases, plus un bonus quand les mots se ressemblent, comme *privato* / *privé*). Les phrases presque identiques ne comptent qu'une fois.
- **Filtre** : un lien n'est gardé que s'il est sûr. Il faut un mot qui ressemble à sa traduction, ou un lien régulier dans plusieurs phrases différentes et confirmé en passant par une troisième langue.
- **Petits mots** : une cinquantaine de mots grammaticaux (articles, prépositions, pronoms, « chaque », « très », « où », « merci »…) sont écrits à la main, avec leurs formes contractées (*della*, *nel*, *zum*, *do*…).

Environ 55 000 traductions au total. Sur des échantillons, à peu près 95 % sont justes. Les erreurs restantes viennent surtout d'expressions idiomatiques, où le mot d'une langue n'a pas d'équivalent direct. Les petits mots très ambigus (*la*, *a*…) passent par la liste écrite à la main, ou renvoient à la phrase entière.
