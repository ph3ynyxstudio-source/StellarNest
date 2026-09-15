# CLAUDE.md — Stell▲rNest

## Objectif

Stell▲rNest est un éditeur visuel local-first pour créer des sites web et des applications par drag-and-drop, où chaque élément déposé sur le canvas est directement lié à un vrai component React — pas une maquette à recréer en code après coup.

L'utilisateur reste toujours le décideur final.

L'application ne prend aucune décision autonome.

---

# MVP ACTUEL

Le MVP est centré sur :

```txt
Canvas d'assemblage visuel
→ Librairie de components de base (Card, Button, Section, Text)

Component Engine
→ Lien canvas ↔ code source réel

Export
→ Code React propre, sans dépendance à l'éditeur
```

Toute nouvelle proposition doit respecter ce périmètre.

---

# Philosophie du projet

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

# Architecture générale

Flux officiel :

```txt
UI
→ Rust
→ Component Engine
→ Filesystem
→ UI
```

Rôles :

```txt
UI
→ affichage, interaction humaine

Rust
→ orchestration

Component Engine
→ résolution canvas ↔ code, parsing AST, transformation

Filesystem
→ le projet de l'utilisateur reste la source de vérité
```

Voir `docs/architecture.md` pour le détail complet.

---

# Structure du repo

## UI

```txt
src/
```

### Layout principal

```txt
src/App.tsx
src/App.css
src/screens/Editor/
```

### Theme

```txt
src/theme/
```

Contient :

```txt
config.ts
design_tokens.ts
UI_TERMS.ts
```

### Components (librairie réutilisable)

```txt
src/components/library/
```

Components React réutilisables et exportables — voir `docs/components.md`.

### Assets

```txt
src/assets/
```

## Rust / Tauri

```txt
src-tauri/
src-tauri/engine/  (Component Engine, à venir)
```

## Stockage d'édition

```txt
.stellarnest/
├─ canvas.json    → état visuel du canvas
├─ library.json   → métadonnées d'affichage de la librairie
└─ launcher.json  → référence au dernier projet ouvert (écran Launcher)
```

Ne contient jamais de code dupliqué — voir `docs/storage.md`.

---

# Documentation

```txt
docs/
  architecture.md   → qui parle à qui
  governance.md      → règles du projet
  components.md       → structure de la librairie de components
  storage.md          → où vivent les données
  layout.md           → structure visuelle de l'écran
  theme.md            → couleurs, tokens, textes UI
```

---

# Vérification visuelle

Un outil de capture d'écran est disponible pour valider visuellement l'état de l'app pendant le développement.

**Important** : `NyxCapture.exe` est bloqué par le Contrôle intelligent des applications de Windows (exécutable non signé). Appeler le script PowerShell directement plutôt que le `.exe` — ça contourne le blocage sans désactiver la protection système.

Outil : `C:\Ph3yNyx.OS\Devs\NyxCapture\src\NyxCapture.ps1`

Utilisation type :

```powershell
# Lancer l'app en arrière-plan
Start-Process -FilePath "npx.cmd" -ArgumentList "tauri", "dev" -WorkingDirectory (Get-Location)

# Capturer une fois la fenêtre prête (via le script, jamais via NyxCapture.exe)
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Ph3yNyx.OS\Devs\NyxCapture\src\NyxCapture.ps1" --title "stellarnest" --wait 30 --delay 2 --output "C:\Ph3yNyx.OS\Devs\StellarNest\.screenshots"
```

L'outil retourne le chemin du PNG généré sur la sortie standard — l'ouvrir pour inspection visuelle avant de rapporter un état à l'utilisateur.

---

# Règles importantes

## Simplicité avant complexité

Toujours privilégier :

```txt
simple
lisible
maintenable
```

Éviter :

```txt
abstractions inutiles
sur-ingénierie
multiplication de couches
```

---

## Séparation des responsabilités

UI :

```txt
affiche
déclenche
```

Rust :

```txt
orchestre
```

Component Engine :

```txt
résout le lien canvas ↔ code
transforme
```

Filesystem :

```txt
stocke (le projet lui-même, pas de copie séparée)
```

Ne jamais mélanger ces responsabilités.

---

## Documentation

Avant de créer un nouveau document :

se demander :

```txt
L'information existe-t-elle déjà ?
```

Si oui :

mettre à jour le document existant.

Ne pas créer plusieurs documents pour expliquer la même chose.

---

# Ce qu'il faut éviter

Ne pas :

```txt
inventer de nouvelles fonctionnalités
modifier l'architecture sans demande
ajouter des automatisations décisionnelles
créer des systèmes parallèles
publier ou committer sans validation humaine explicite
```

Ne pas supposer des besoins futurs non demandés.

Ne pas ajouter de nouveau component à la librairie sans le classer MVP ou V2+ au préalable.

---

# Comment travailler sur le projet

Quand une modification est demandée :

1. Identifier la zone concernée.
2. Trouver le fichier réel dans `src/` ou `src-tauri/`.
3. Vérifier la documentation associée dans `docs/`.
4. Proposer un changement minimal.
5. Attendre validation si le changement impacte la structure.

---

# Référence rapide

Changer le thème :

```txt
src/theme/
```

Changer le layout :

```txt
src/App.tsx
src/screens/Editor/
```

Ajouter/modifier un component de la librairie :

```txt
src/components/library/
```

Comprendre l'architecture :

```txt
docs/architecture.md
```

Comprendre les règles :

```txt
docs/governance.md
```

---

# Stack technique

```txt
Tauri 2
Rust
React
TypeScript
Vite
```

---

# Phrase finale

Stell▲rNest est un système simple :

```txt
L'humain décide.
Le système organise.
Le visuel reste lié au code.
```
