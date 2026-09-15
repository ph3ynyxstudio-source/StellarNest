# GOVERNANCE — Stell▲rNest

## Objectif

Ce document définit les règles de fonctionnement du projet.

Il sert de référence pour :

- le développement
- la documentation
- les contributions
- l'utilisation d'IA (Claude Code, etc.)

---

# Principe fondamental

L'humain reste le seul décideur du système.

Le système :

```txt
organise
structure
lie le visuel au code
```

Le système ne :

```txt
décide pas
ne remplace pas l'humain
ne modifie pas le code source sans action explicite de l'utilisateur
```

---

# MVP LOCK

Le MVP actuel est centré sur :

```txt
Launcher (écran de démarrage, choix explicite avant d'entrer dans l'éditeur)
Canvas d'assemblage visuel
Librairie de components de base
Lien component ↔ code source
Export du projet en code réel
```

Toute évolution doit respecter ce périmètre.

---

## Fonctionnalités classées

### Launcher — MVP

Écran de démarrage affiché avant l'Editor. Classé MVP car nécessaire avant de pouvoir choisir le mode Mobile/Desktop et plus généralement avant d'entrer dans l'éditeur — l'utilisateur doit toujours faire un choix explicite (nouveau projet ou projet récent), jamais de reprise automatique. Voir `layout.md` (section Launcher) et `storage.md` (`launcher.json`).

---

# Règle d'expansion

Toute nouvelle idée doit être classée comme :

```txt
MVP
ou
V2+
```

Avant toute implémentation.

Aucune fonctionnalité ne doit être ajoutée sans classification.

---

# Simplicité avant complexité

Toujours privilégier :

```txt
simple
lisible
maintenable
compréhensible
```

Éviter :

```txt
abstractions inutiles
architecture excessive
sur-ingénierie
multiplication des couches
```

---

# Séparation des responsabilités

## UI

Responsable de :

```txt
affichage
interaction
navigation
```

Ne doit pas :

```txt
écrire dans le code source
résoudre la structure des components
prendre des décisions
```

---

## Rust

Responsable de :

```txt
orchestration
communication
déclenchement du Component Engine
```

Ne doit pas :

```txt
décider de la structure visuelle
```

---

## Component Engine

Responsable de :

```txt
résolution du lien canvas ↔ code
parsing AST
transformation du code source
```

Ne doit pas :

```txt
contrôler l'interface
publier sans action explicite de l'utilisateur
```

---

## Filesystem

Responsable de :

```txt
stockage
persistance du code source
```

Ne doit pas :

```txt
calculer
décider
valider
```

---

# Documentation

La documentation doit rester courte et utile.

Avant de créer un nouveau document, poser la question :

```txt
L'information existe-t-elle déjà ?
```

Si oui :

```txt
mettre à jour le document existant.
```

---

# Organisation documentaire

Tous les documents vivent à plat dans `docs/` :

```txt
docs/
  architecture.md   → système, component engine, flux
  governance.md      → gouvernance, règles, limites
  components.md       → structure de la librairie de components
  storage.md          → où vivent les données
  layout.md           → structure visuelle de l'écran
  theme.md            → couleurs, tokens, textes UI
```

Pas de sous-dossiers (`system/`, `ui/`, `rules/`) ni de `INDEX.md` séparé — ce fichier (`governance.md`) et `CLAUDE.md` font office de point d'entrée.

---

# Utilisation des IA

Les IA peuvent :

```txt
proposer
structurer
expliquer
générer du code
documenter
```

Les IA ne peuvent pas :

```txt
prendre des décisions produit
modifier l'architecture sans demande
inventer des besoins
valider à la place de l'humain
```

---

# Règle de modification

Avant une modification importante :

1. Identifier le besoin.
2. Identifier le fichier concerné.
3. Limiter le changement à la zone concernée.
4. Éviter les effets de bord.
5. Conserver la cohérence du MVP.

---

# Source de vérité

Le code est la réalité.

La documentation existe pour aider à comprendre le code.

En cas de contradiction :

```txt
Code
↓
Documentation
↓
Interprétation
```

---

# Phrase finale

L'humain décide.
Le système organise.
La documentation guide.
Le code exécute.
