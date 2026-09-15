# LAYOUT — Stell▲rNest

## Objectif

Ce document définit la structure visuelle principale de l'application.

Il sert à comprendre où modifier le layout global sans toucher aux composants internes.

---

## Fichiers concernés

```txt
src/App.tsx
src/App.css
src/screens/Launcher/Launcher.tsx
src/screens/Launcher/Launcher.css
src/screens/Editor/Editor.tsx
src/screens/Editor/Editor.css
```

---

## Rôle des fichiers

### App.tsx

```txt
gère l'écran actif (Launcher ou Editor) et charge l'écran correspondant
```

Au lancement, `Launcher` est l'écran actif. Il bascule vers `Editor` une fois qu'un choix est fait (nouveau projet ou projet récent) — l'éditeur ne se monte qu'à ce moment-là, jamais avant.

### App.css

```txt
définit les styles globaux
```

### Launcher.tsx

```txt
assemble l'écran de démarrage (splash/launcher)
```

### Launcher.css

```txt
définit le layout et le style de l'écran de démarrage
```

### Editor.tsx

```txt
assemble les grandes zones de l'éditeur
```

### Editor.css

```txt
définit le layout de l'éditeur, les zones et l'habillage général de l'écran
```

---

## Launcher

Écran de démarrage (splash/launcher), affiché avant l'Editor au lancement de l'app — dans l'esprit d'un écran style Blender. L'utilisateur y fait un choix explicite avant que l'éditeur ne se monte.

### Structure écran

```txt
launcher
└─ launcher-panel
   ├─ launcher-branding          (emplacement réservé logo/branding, voir ci-dessous)
   │  └─ launcher-title / launcher-tagline
   ├─ launcher-actions
   │  ├─ "Nouveau projet"        (toujours visible, ouvre launcher-dialog)
   │  └─ "Projet récent — {nom}" (visible seulement si un projet récent est connu)
   ├─ launcher-theme-section     (réservée, désactivée, "Bientôt disponible")
   └─ launcher-info
      ├─ concepteur (nom)
      ├─ lien vers https://ph3ynyx.dev/ (ouvre dans le navigateur externe, jamais dans la fenêtre Tauri)
      └─ launcher-changelog (texte statique pour le MVP, pas un changelog dynamique)
```

### launcher-branding (réservé)

Emplacement réservé pour un futur logo/branding, en haut du `launcher-panel`, centré horizontalement, au-dessus de la fiche info du programme. Hauteur minimale conservée (`min-height`) pour qu'un logo puisse s'y insérer plus tard sans redesign du layout.

Au MVP, cette zone reste vide de tout logo — elle contient seulement le nom "Stell▲rNest" en typographie (`launcher-title`) et le sous-titre (`launcher-tagline`). Aucune image n'est implémentée ici.

### Nouveau projet — launcher-dialog

Cliquer "Nouveau projet" n'ouvre pas directement l'éditeur — ça ouvre un overlay modal (`launcher-dialog`, fond assombri `launcher-dialog-scrim`) qui demande :

```txt
Nom du projet    (input texte, prérempli avec le nom par défaut)
Mode             (toggle Mobile / Desktop, Desktop par défaut)
```

Le mode choisi ici fixe la largeur logique du canvas pour toute la session d'édition (voir `canvas-zone` ci-dessous) — il n'y a plus de toggle dans l'éditeur lui-même. Un component mal adapté à une largeur reste un problème visuel à corriger par l'utilisateur, pas une transformation automatique du système (voir `components.md`, Règle 10).

"Créer" confirme et ouvre l'éditeur avec ce nom et ce mode. "Annuler" (ou un clic sur le fond assombri) ferme l'overlay sans rien changer.

### Projet récent

Pour ce MVP, un seul projet récent est retenu (le dernier ouvert) — pas une liste. La référence (nom + mode) est stockée dans `.stellarnest/launcher.json` (voir `storage.md`), lue/écrite via deux commandes Rust (`get_last_project`, `save_last_project`) suivant le flux `UI → Rust → Filesystem` documenté dans `architecture.md`.

Le bouton "Projet récent" n'apparaît que si cette référence existe, et rouvre l'éditeur directement avec le nom et le mode déjà connus (pas de dialogue). Il n'y a pas de reprise automatique au lancement — l'utilisateur doit toujours cliquer explicitement pour entrer dans l'éditeur, jamais de décision prise à sa place.

### Section thème (réservée)

La zone de choix du thème de départ est visuellement présente mais désactivée (grisée, mention "Bientôt disponible"). Aucune logique de thème n'est implémentée ici au MVP — voir `theme.md` pour le futur sélecteur (V2+).

---

## Structure écran (Editor)

```txt
stellarnest-app
└─ editor-shell
   ├─ editor-header
   │  ├─ project-name
   │  ├─ status-badge
   │  └─ export-button
   │
   └─ main-content
      ├─ library-panel
      ├─ canvas-zone
      ├─ style-panel
      └─ layers-panel
```

---

## Zones principales

### editor-header

Bandeau du haut.

Contient :

```txt
project-name
status-badge
zoom-control
export-button
```

### library-panel

Panneau latéral gauche.

Contient la librairie de components disponibles. Au MVP, seul `Card` est listé (Button/Section/Text viendront après validation de ce pattern) sous forme d'item (`library-item` : aperçu "+" + nom "Carte").

Un clic sur le "+" ajoute une nouvelle instance au canvas (voir `canvas-zone` ci-dessous) — pas de drag-and-drop depuis ce panneau au MVP. Aucune instance n'apparaît au chargement tant que l'utilisateur n'a pas cliqué.

### canvas-zone

Zone centrale principale.

Espace de travail où l'utilisateur assemble visuellement son interface.

#### Ajout, déplacement et redimensionnement des instances

Un clic sur "+" dans `library-panel` ajoute une nouvelle instance (`canvas-element`) à l'intérieur de `canvas-frame`, avec les valeurs par défaut de `Card.schema.ts` (`title: "Titre"`, `content: "Contenu"`) et une taille par défaut. Si une instance existe déjà, la nouvelle est légèrement décalée de la précédente pour éviter un chevauchement exact.

Chaque instance sur le canvas :

```txt
se déplace par glisser (drag) à l'intérieur de canvas-frame
se redimensionne via une poignée visible sur la sélection
utilise la classe .active pour l'état sélectionné (jamais .is-active, voir components.md Règle 7)
reste contenue dans la largeur logique du canvas-frame (375px Mobile / 1440px Desktop) — jamais de sortie du cadre
```

Chaque ajout, déplacement ou redimensionnement persiste dans `.stellarnest/canvas.json` (voir `storage.md`) — état visuel uniquement, jamais de duplication du code du component.

Un clic sur une zone vide (dans `canvas-zone` ou `canvas-frame`, en dehors de toute instance) retire la sélection active. Le déplacement/redimensionnement ne force jamais la sélection à rester active au-delà de l'interaction — une fois l'action terminée, un clic ailleurs désélectionne normalement.

Pas encore implémenté à ce stade : le branchement des propriétés `title`/`content` d'une instance au `style-panel` et la suppression d'une instance.

#### Mode Mobile/Desktop (fixé à la création)

Le mode Mobile/Desktop n'est plus choisi dans l'éditeur — il est fixé une fois pour toutes au moment de la création du projet, dans `launcher-dialog` (voir section Launcher ci-dessus). Il détermine la largeur simulée du canvas pour toute la session :

```txt
Mobile   → 375px
Desktop  → 1440px
```

Le canvas simulé est centré dans `canvas-zone`, le reste de l'espace autour reste en fond neutre (`--bg-app`).

Les components de la librairie (voir `components.md`) ne changent pas selon le mode — c'est la largeur du canvas qui change, pas le component lui-même. Un component mal adapté à une largeur reste un problème visuel à corriger par l'utilisateur, pas une transformation automatique du système.

#### Zoom to fit

Le canvas garde toujours sa vraie largeur logique (375px Mobile, 1440px Desktop, fixée à la création du projet) pour tous les calculs de contenu — rien n'est recalculé ou réadapté selon l'espace disponible.

Pour l'affichage, un facteur de zoom est calculé dynamiquement :

```txt
zoom = largeur disponible dans canvas-zone / largeur logique du canvas
zoom plafonné à 100% (jamais agrandi au-delà de la vraie taille)
```

Ce zoom est appliqué visuellement au canvas simulé pour qu'il rentre toujours entièrement dans `canvas-zone`, sans jamais déborder ni provoquer de scroll horizontal.

Le pourcentage de zoom actuel est affiché dans `editor-header` (`zoom-control`), pour que l'utilisateur sache quand il regarde une version réduite du canvas.

Le plancher du zoom est 25% — jamais 0. Le plafond reste 100% (jamais agrandi au-delà de la vraie taille).

#### Zoom manuel

Le pourcentage affiché (`zoom-indicator`) est cliquable. Un clic ouvre un petit overlay ancré juste sous l'indicateur, avec un slider allant de 25% à 100%.

```txt
Tant que l'utilisateur n'a pas touché au slider
→ le zoom reste automatique (zoom-to-fit), recalculé à chaque redimensionnement

Dès que l'utilisateur bouge le slider
→ override manuel : cette valeur prend le dessus sur le calcul automatique
→ reste fixe même si la fenêtre est redimensionnée ensuite
```

Un lien "Ajuster" apparaît dans l'overlay uniquement quand un override manuel est actif — il efface l'override et revient au calcul zoom-to-fit.

L'overlay se ferme au clic en dehors de lui, ou en cliquant à nouveau sur `zoom-indicator`.

### style-panel

Panneau latéral droit. Contextuel selon la sélection sur le canvas :

```txt
Rien sélectionné       → propriétés du canvas lui-même
Instance sélectionnée  → propriétés de l'instance
```

#### Rien sélectionné — propriétés du canvas

Pour ce MVP, une seule propriété du canvas est éditable : sa couleur de fond (`canvas-frame`). Affichée comme un carré de couleur (`color-swatch`) montrant la couleur actuelle, avec son code hex à côté. Cliquer sur le swatch ouvre un color picker natif (`input type="color"`) — le changement s'applique immédiatement au fond de `canvas-frame` et persiste dans `.stellarnest/canvas.json` (`canvasBackgroundColor`, voir `storage.md`).

#### Instance sélectionnée — propriétés de l'instance

Affiche les propriétés éditables définies dans `Card.schema.ts` (voir `components.md`, Règle 5) pour l'instance sélectionnée :

```txt
Titre, Contenu           → champs texte simples
Couleur de fond           → même pattern swatch + hex que la couleur du canvas
Couleur du contour        → même pattern swatch + hex
Épaisseur du contour (px) → champ numérique
Rondeur des bords (px)    → champ numérique
```

Chaque instance garde ses propres valeurs — rien n'est partagé entre plusieurs cartes. Les changements s'appliquent immédiatement à l'instance affichée sur le canvas et persistent dans `.stellarnest/canvas.json` (voir `storage.md`). Pas encore implémenté : l'édition inline directement sur le canvas, et le choix de police/taille/poids du texte.

Tout en bas du panneau, un bouton "Supprimer" retire l'instance sélectionnée du canvas (et de `canvas.json`). Visible uniquement quand une instance est sélectionnée.

### layers-panel

Zone basse ou rétractable.

Affiche l'arborescence des components présents sur le canvas — permet de sélectionner, réordonner, supprimer.

### Mode Aperçu

Bouton "Aperçu" dans `editor-header`, juste après `export-button`. Au clic, remplace tout `main-content` (library-panel, canvas-zone, style-panel, layers-panel) par un rendu passif de `src/screens/Export/GeneratedPage.tsx` (voir `architecture.md`, Component Engine), dans un cadre simple (`preview-frame`) occupant l'espace disponible.

```txt
Aucune sélection, aucun déplacement, aucune interaction d'édition en mode Aperçu
→ c'est le rendu du dernier export, pas l'état live du canvas
→ pas de rafraîchissement automatique si le canvas change sans ré-exporter
```

Le bouton devient visuellement actif ("Retour à l'édition") tant que le mode Aperçu est actif ; un re-clic revient à la vue normale du canvas.

Si `GeneratedPage.tsx` n'existe pas encore (aucun export fait), le mode Aperçu affiche un message ("Exporte d'abord pour voir l'aperçu") à la place du rendu, plutôt que de planter. Un export réussi (`export_project`) rend immédiatement l'Aperçu disponible sans devoir recharger l'éditeur.

---

## Règles strictes

### Règle 1

`App.tsx` reste léger.

### Règle 2

`Editor.tsx` assemble les zones de l'éditeur.

### Règle 3

`App.css` garde les styles globaux.

### Règle 4

`Editor.css` gère le layout de l'écran éditeur.

### Règle 5

`App.css` ne doit pas contenir les styles internes d'un component de la librairie.

### Règle 6

Les components réutilisables doivent être dans `src/components/library/`.

### Règle 7

Les composants propres à l'éditeur peuvent rester dans `src/screens/Editor/components/`.

### Règle 8

Les couleurs et valeurs partagées doivent venir de `src/theme/`.

---

## À éviter

Ne pas mélanger dans `App.css` :

```txt
layout global
style interne des components
tokens de thème
logique visuelle spécifique
```

Ne pas transformer `App.tsx` en fichier géant.

---

## Phrase simple

```txt
App.tsx charge l'écran.
Editor.tsx assemble.
Editor.css place les zones.
Le thème vit dans src/theme/.
```
