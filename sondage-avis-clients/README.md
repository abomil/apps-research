# Mini-sondage clients – Nouvelle PSP Côte d’Ivoire

Visuel « Votre avis nous intéresse » destiné à la diffusion WhatsApp et digitale.

| Élément | Détail |
|---|---|
| Version | v1.0 du 06/10/2026 (projet, logo officiel non intégré) |
| Format | 1080 × 1350 px (4:5), version HD 2160 × 2700 px pour le zoom sur smartphone |
| Contenu | 3 questions et réponses reprises sans modification du brief |
| Couleurs | Palette provisoire (vert santé, accent orange), à aligner sur la charte officielle |

## Fichiers

- `export/sondage-avis-clients-psp-1080x1350.png` : visuel à diffuser.
- `export/sondage-avis-clients-psp-HD-2160x2700.png` : même visuel en haute définition.
- `sondage.html` : source du visuel (textes, couleurs, mise en page).
- `render.cjs` : export PNG et contrôles automatiques (zone sûre de 32 px, texte débordant, chevauchements, polices chargées).

## Intégrer le logo officiel

1. Déposer le fichier fourni par la communication, sans retouche, dans `assets/logo-officiel.png`.
2. Relancer l’export : `NODE_PATH=$(npm root -g) node render.cjs`.

Le logo prend la place du filet orange au-dessus du titre ; sans fichier, aucun logo n’est affiché.

## Modifier le visuel après diffusion

Toute modification donne lieu à une nouvelle version (v1.1, v2.0…) datée dans le tableau ci-dessus, à un nouvel export et à la rediffusion auprès des mêmes groupes, en précisant que la version précédente est remplacée.
