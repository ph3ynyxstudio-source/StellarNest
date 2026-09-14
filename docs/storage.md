# STORAGE — Stell▲rNest

## Objectif

Ce document définit comment les données sont stockées dans le système.

Il décrit :

```txt
où vivent les données
comment elles sont organisées
ce qui est conservé
ce qui ne l'est pas
```

Il ne décrit pas :

```txt
l'interface
les composants
la logique de l'éditeur
```

---

## Principe

Le code source du projet est la vérité.

Stell▲rNest ne maintient pas une copie parallèle de la structure du projet.

```txt
Code source
→ source de vérité
```

L'éditeur lit et écrit directement dans le vrai projet de l'utilisateur — pas dans une base de données séparée.

---

## Structure générale

```txt
{dossier du projet utilisateur}/
├─ src/
│  └─ components/
│     └─ library/
├─ .stellarnest/
│  ├─ canvas.json
│  └─ library.json
```

---

## src/

Contient le vrai code du projet.

```txt
src/
→ vérité du code
```

Ne jamais dupliquer ce contenu ailleurs.

---

## .stellarnest/

Dossier local, propre à l'éditeur, qui accompagne le projet sans le remplacer.

Contient uniquement ce que le code seul ne peut pas exprimer.

```txt
.stellarnest/
→ mémoire d'édition, pas de code
```

---

## canvas.json

Contient l'état visuel du canvas.

Exemples de ce qu'il conserve :

```txt
position des components sur le canvas
zoom
disposition des calques
sélection active
```

Ne contient jamais :

```txt
le code des components
la logique métier
```

### Structure de référence

```ts
type CanvasState = {
  projectId: string;
  elements: {
    id: string;
    componentRef: string;   // lien vers le component réel
    sourceLocation: string; // fichier + scope, voir architecture.md
    x: number;
    y: number;
  }[];
};
```

---

## library.json

Contient la liste des components disponibles pour ce projet et leurs métadonnées d'affichage (icône, nom, catégorie).

Ne contient jamais :

```txt
le code des components (voir components.md)
```

---

## Cycle de vie d'une donnée

```txt
Action utilisateur sur le canvas
↓
Rust
↓
Component Engine
↓
Écriture dans src/ (code réel)
↓
Mise à jour de canvas.json (état visuel seulement)
```

---

## Règles strictes

### Règle 1

Le code source reste la seule vérité pour la logique et le rendu.

### Règle 2

`.stellarnest/` ne stocke jamais de code dupliqué.

### Règle 3

Une modification visuelle n'est jamais définitive sans écriture dans le vrai fichier source.

### Règle 4

Storage ne prend aucune décision.

### Règle 5

Le projet reste utilisable même sans Stell▲rNest — le code exporté n'a aucune dépendance à l'éditeur.

---

## À éviter

Ne pas mettre dans `.stellarnest/` :

```txt
logique UI
logique Rust
logique du Component Engine
copie du code source
```

`.stellarnest/` conserve uniquement l'état d'édition.

---

## Phrase simple

```txt
Le code est la vérité.
.stellarnest/ retient seulement ce que le code ne dit pas.
Storage ne décide rien.
```
