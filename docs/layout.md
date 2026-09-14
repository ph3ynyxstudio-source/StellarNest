# LAYOUT — Stell▲rNest

## Objectif

Ce document définit la structure visuelle principale de l'application.

Il sert à comprendre où modifier le layout global sans toucher aux composants internes.

---

## Fichiers concernés

```txt
src/App.tsx
src/App.css
src/screens/Editor/Editor.tsx
src/screens/Editor/Editor.css
```

---

## Rôle des fichiers

### App.tsx

```txt
charge l'écran principal
```

### App.css

```txt
définit les styles globaux
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

## Structure écran

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
export-button
```

### library-panel

Panneau latéral gauche.

Contient la librairie de components disponibles (Card, Button, Section, Text) — glissables vers le canvas.

### canvas-zone

Zone centrale principale.

Espace de travail où l'utilisateur assemble visuellement son interface en droppant des components.

### style-panel

Panneau latéral droit.

Affiche les propriétés éditables (`.schema.ts`) du component actuellement sélectionné sur le canvas.

### layers-panel

Zone basse ou rétractable.

Affiche l'arborescence des components présents sur le canvas — permet de sélectionner, réordonner, supprimer.

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
