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

### Direction visuelle MVP — "Nid Stellaire"

Fond bleu nuit profond — pas de noir pur. Accents violet et cyan hérités de l'identité cosmique de départ (logo enclume/cristal), saturés et lumineux pour ressortir sur fond sombre. Remplace l'ancienne direction claire "Nébuleuse Claire".

```css
:root {
  /* Fonds */
  --bg-app: #0b0e1a;
  --bg-card: #141830;
  --bg-card-subtle: #1b2040;

  /* Texte */
  --text-primary: #f2f1f8;
  --text-secondary: #8d8ab0;

  /* Accents */
  --accent-violet: #7c5cff;
  --accent-cyan: #4de3f0;

  /* Bordures */
  --border-subtle: #2a2f52;
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

Le cyan doit toujours rester lisible sur `--bg-app` — version assombrie sur fond clair, version lumineuse (`--accent-cyan: #4de3f0`) sur fond sombre. Toujours vérifier le contraste après un changement de direction visuelle.

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

Idée notée mais non implémentée au MVP : permettre à l'utilisateur de choisir entre plusieurs directions visuelles (dont l'ancienne version claire "Nébuleuse Claire") dans les paramètres. Au MVP, une seule direction visuelle est active à la fois — actuellement "Nid Stellaire".

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
