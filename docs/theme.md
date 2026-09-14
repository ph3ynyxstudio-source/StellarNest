# THEME — Stell▲rNest

## Objectif

Ce document définit où se trouvent les éléments liés au thème visuel et aux textes d'interface.

Il sert à savoir où aller pour modifier :

```txt
couleurs
tokens
textes visibles
configuration UI
variables globales
```

---

## Fichiers concernés

```txt
src/theme/config.ts
src/theme/design_tokens.ts
src/theme/UI_TERMS.ts
src/App.css
```

---

## Rôle des fichiers

### config.ts

```txt
configuration générale de l'application
```

### design_tokens.ts

```txt
valeurs visuelles partagées
```

### UI_TERMS.ts

```txt
textes visibles dans l'interface
```

### App.css

```txt
variables CSS globales et styles globaux
```

---

## config.ts

Contient les réglages globaux simples.

Exemples :

```txt
flags
mode local
activation/désactivation de comportements
configuration MVP
```

---

## design_tokens.ts

Contient les valeurs visuelles utilisées par les composants.

Exemples :

```txt
couleurs
fonds
accents
textes
espacements
rayons
ombres
```

Règle :

```txt
Toute valeur visuelle réutilisée doit aller ici.
```

---

## UI_TERMS.ts

Contient les textes visibles dans l'application.

Exemples :

```txt
titres
boutons
labels
messages courts
textes d'état
```

Règle :

```txt
Un texte visible réutilisé ne doit pas être dispersé dans App.tsx.
```

---

## App.css

Contient les variables CSS globales et les styles globaux.

### Direction visuelle MVP — "Nébuleuse Claire"

Fond blanc perle, doux et chaleureux — pas de noir pur, pas de blanc pur. Accents violet et cyan hérités de l'identité cosmique de départ (logo enclume/cristal), mais assombris pour rester lisibles sur fond clair.

```css
:root {
  /* Fonds */
  --bg-app: #f4f3f0;
  --bg-card: #ffffff;
  --bg-card-subtle: #faf9f6;

  /* Texte */
  --text-primary: #2a2840;
  --text-secondary: #8a869c;

  /* Accents */
  --accent-violet: #5b4fd6;
  --accent-cyan: #38c9dc;

  /* Bordures */
  --border-subtle: #e0ddf2;
}
```

---

## Règles strictes

### Règle 1

Les couleurs principales doivent être centralisées.

### Règle 2

Les textes réutilisés doivent être centralisés.

### Règle 3

Ne pas créer plusieurs sources pour la même valeur.

### Règle 4

Ne pas mettre de logique métier dans `theme/`.

### Règle 5

Ne pas mettre de style de composant dans `theme/`.

### Règle 6

Ne pas mettre de textes UI importants directement dans `App.tsx` si ces textes sont réutilisables.

### Règle 7

Les textes réutilisables vont dans `UI_TERMS.ts`.

### Règle 8

Les textes propres à un écran ou à un composant peuvent rester locaux tant qu'ils ne sont pas mutualisés.

### Règle 9

Le cyan doit toujours être la version assombrie (`--accent-cyan: #38c9dc`) sur fond clair — la version pâle testée dans les premières directions visuelles devient illisible sur `--bg-app`.

---

## Source de vérité recommandée

```txt
design_tokens.ts
→ source principale des valeurs visuelles

UI_TERMS.ts
→ source principale des textes visibles

config.ts
→ source principale de la configuration simple

App.css
→ application CSS globale des variables et des styles globaux
```

---

## À éviter

Éviter :

```txt
couleurs dupliquées partout
textes dispersés dans plusieurs composants
tokens non utilisés
variables CSS et design_tokens.ts contradictoires
```

---

## V2+ — Sélecteur de thème

Idée notée mais non implémentée au MVP : permettre à l'utilisateur de choisir entre plusieurs directions visuelles (dont une version sombre "Nid Stellaire") dans les paramètres.

```txt
À classer et scoper formellement avant implémentation (voir governance.md).
```

---

## Phrase simple

```txt
theme/ définit les valeurs.
App.css applique le style global.
Les composants consomment les tokens.
```
