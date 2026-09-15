# COMPONENTS — Stell▲rNest

## Règle de structure

Chaque component réutilisable de la librairie doit avoir son propre dossier dans `src/components/library/`.

Exemple :

```txt
src/components/library/Card/
  Card.tsx
  Card.css
  Card.schema.ts
```

Les composants propres à l'éditeur lui-même (pas destinés à être droppés) restent dans leur écran.

Exemple actuel :

```txt
src/screens/Editor/components/
  Toolbar/
  LayerPanel/
  StylePanel/
```

---

## Rôle des fichiers

### Card.tsx

```txt
structure React du component (ce qui sera injecté dans le code exporté)
```

### Card.css

```txt
style par défaut du component
```

### Card.schema.ts

```txt
description des propriétés éditables du component
(ce que le Style Panel affiche quand le component est sélectionné)
```

### Editor/components/

```txt
composants de l'éditeur lui-même, pas des components exportables
```

---

## Structure verrouillée

```txt
src/
  App.tsx                → assemble l'application
  App.css                → styles globaux seulement

  screens/
    Editor/
      Editor.tsx          → assemble l'écran éditeur
      Editor.css           → layout de l'écran éditeur
      components/
        ...                → composants propres à l'éditeur

  theme/
    config.ts              → flags / config app
    design_tokens.ts       → couleurs, espacements, tailles
    UI_TERMS.ts            → textes visibles

  components/
    library/
      Card/
        Card.tsx           → structure React du component
        Card.css           → style par défaut
        Card.schema.ts     → propriétés éditables

  assets/
    ...
```

---

## Librairie de components — MVP

Premiers components à construire (petit nombre, fixe) :

```txt
Card
Button
Section
Text
```

Ne pas viser un système extensible/générique dès le MVP.

---

## Règles strictes

### Règle 1

`App.tsx` reste léger et charge l'écran principal.

### Règle 2

`Editor.tsx` assemble les zones (canvas, panneaux) de l'éditeur.

### Règle 3

`App.css` garde seulement les styles globaux.

### Règle 4

Un component de la librairie garde son style dans son propre `.css`.

### Règle 5

Chaque component de la librairie a un `.schema.ts` qui définit ses propriétés éditables — c'est ce fichier que le Component Engine et le Style Panel consultent.

### Règle 6

Le component tel qu'il existe dans `src/components/library/` EST le component tel qu'il sera exporté — pas de version "éditeur" différente de la version "code final".

### Règle 7

Utiliser `.active` pour l'état sélectionné sur le canvas.

### Règle 8

Ne pas utiliser `.is-active`.

### Règle 9

Ne pas ajouter de nouveau component à la librairie sans le classer MVP ou V2+ au préalable (voir governance.md).

### Règle 10

Un component de la librairie reste identique peu importe le mode du canvas (Mobile/Desktop) — pas de version "mobile" et "desktop" séparée d'un même component au MVP.
