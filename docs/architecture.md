# ARCHITECTURE — Stell▲rNest

## Objectif

Ce document définit comment les couches du système communiquent entre elles.

Il ne décrit pas :

```txt
les composants UI
les couleurs
les textes
les données détaillées
```

Il décrit uniquement :

```txt
qui fait quoi
qui parle à qui
comment une action traverse le système
```

---

## Architecture générale

```txt
UI (Canvas + Panneaux)
↓
Rust (orchestration)
↓
Component Engine (résolution + AST)
↓
Filesystem (projet + code source)
↓
Retour UI
```

## Flux principal

```txt
Utilisateur
↓
Drop d'un component sur le canvas
↓
UI
↓
Rust
↓
Component Engine
↓
Filesystem
↓
Rust
↓
UI
```

---

## Couches du système

### UI Layer

Localisation :

```txt
src/
```

Responsabilités :

```txt
afficher le canvas
afficher les panneaux (components, style, projet)
déclencher les actions (drop, édition, export)
présenter les résultats
```

Ne doit jamais :

```txt
écrire dans les fichiers source
résoudre la structure des components
prendre des décisions
```

### Rust Layer

Localisation :

```txt
src-tauri/
```

Responsabilités :

```txt
recevoir les actions UI
orchestrer le système
appeler le Component Engine
lire et écrire les fichiers
retourner les résultats
```

Ne doit jamais :

```txt
décider de la structure visuelle
contrôler l'interface
```

### Component Engine

Localisation :

```txt
src-tauri/engine/
```

État actuel (première tranche) : le moteur génère un nouveau fichier `.tsx` propre à partir de l'état du canvas — il ne parse ni ne réécrit encore de fichier existant en AST (approche façon Onlook, prévue pour une itération suivante).

```txt
docs/architecture.md
  ↳ src-tauri/engine/mod.rs
    generate_page(&CanvasState) -> String
    → construit le JSX pour chaque élément (au MVP : componentRef "Card")
    → produit un fichier .tsx complet (imports + composant exporté)
```

Déclenché par la commande Rust `export_project` (`src-tauri/src/lib.rs`) : lit l'état du canvas (même source que `get_canvas_state`), appelle `engine::generate_page`, écrit le résultat dans `src/screens/Export/GeneratedPage.tsx` (crée le dossier si besoin). Rust orchestre l'appel ; toute la logique de génération vit dans `engine/`, jamais directement dans `lib.rs`.

Responsabilités (cible complète, au-delà de cette première tranche) :

```txt
maintenir la librairie de components de référence
lier un élément du canvas à son component réel
parser le code source en AST
injecter/modifier un component dans l'AST
réécrire le fichier source
```

Ne doit jamais :

```txt
modifier l'UI directement
décider seul de la structure finale
publier sans validation humaine
```

### Storage Layer

Localisation :

```txt
Le projet lui-même (dossier de code de l'utilisateur)
```

Responsabilités :

```txt
conserver le code source
conserver la structure du projet
```

Ne doit jamais :

```txt
calculer
valider
décider
```

---

## Responsabilités résumées

```txt
UI
→ affiche

Rust
→ orchestre

Component Engine
→ lie le visuel au code, transforme

Filesystem
→ stocke
```

---

## Exemple réel

Drop d'une carte sur le canvas :

```txt
Utilisateur
↓
Drag "Carte" depuis la librairie
↓
Drop sur le canvas
↓
UI
↓
envoie la demande (type de component + position)
↓
Rust
↓
appelle le Component Engine
↓
Component Engine
↓
résout le component réel (CardComponent)
↓
parse le fichier cible en AST
↓
injecte le component dans l'arbre
↓
Filesystem
↓
sauvegarde le fichier source
↓
Rust
↓
lit le résultat
↓
UI
↓
affiche la carte sur le canvas
```

---

## Principe clé — lien Canvas ↔ Code

Inspiré de la technique utilisée par des éditeurs visuels open source existants (ex. Onlook) :

```txt
Chaque élément du canvas porte une référence
qui pointe vers son emplacement réel dans le code source
(fichier + scope du component).
```

Cette référence permet de :

```txt
retrouver le bon fichier
parser en AST
appliquer la modification
réécrire proprement
```

Rien n'est jamais généré à partir de zéro après coup — le visuel EST déjà lié au code depuis le drop initial.

---

## Règles strictes

### Règle 1

UI n'écrit jamais directement dans le code source.

### Règle 2

Rust orchestre uniquement.

### Règle 3

Le Component Engine transforme uniquement, sur demande.

### Règle 4

Filesystem conserve uniquement.

### Règle 5

Aucune couche ne décide seule.

La validation finale appartient toujours à l'humain.

---

## À éviter

Ne pas créer :

```txt
UI → Component Engine direct
Component Engine → UI direct
Component Engine → décision autonome
Storage → logique métier
```

Toutes les communications passent par l'orchestration Rust.

---

## Structure actuelle

```txt
src/
src/screens/Export/GeneratedPage.tsx  (généré par le Component Engine, voir ci-dessus)
src-tauri/
src-tauri/engine/
docs/
```

---

## Phrase simple

```txt
UI affiche.
Rust orchestre.
Le Component Engine lie visuel et code.
Filesystem conserve.
L'humain décide.
```