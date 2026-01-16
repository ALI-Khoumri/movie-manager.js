# MovieManager (Projet JS)

## Identifiants

- **Utilisateur**: `admin`
- **Mot de passe**: `admin`

## Fonctionnalités (alignées avec l’évaluation)

- **CRUD (LocalStorage)**:
  - Créer / modifier / supprimer des films “custom” (non-TMDB) depuis `movies.html`.
  - Archiver / désarchiver un film.
  - Ajouter / retirer des favoris.
- **Dashboard (stats + graphiques)**:
  - Compteurs (total, populaires, archivés, favoris, note moyenne).
  - Graphiques via **Chart.js** (films par année, langues, évolution, favoris vs archivés, distribution des notes).
- **Qualité du code / organisation**:
  - `app.js` refactorisé en classes: `I18n`, `Store`, `TmdbApi`, `DashboardController`, `MoviesController`.
  - Gestion du DOM via **event delegation** (pas de `onclick` inline).
  - Async/await utilisé pour l’API TMDB.
- **i18n**:
  - Langues: **FR / EN / AR** (avec support RTL).
  - Textes via attributs `data-i18n` + placeholders via `data-i18n-placeholder`.

## Structure

- `index.html`: page de connexion.
- `movies.html`: liste + recherche + CRUD + favoris + archives + export PDF.
- `dashboard.html`: statistiques + graphiques.
- `style.css`: styles.
- `app.js`: logique applicative.

## Lancement

Comme c’est un projet statique, lancez-le avec un serveur local (recommandé):

- VS Code / Cursor: extension **Live Server** → ouvrir `index.html`.

> Remarque: ouvrir directement les fichiers en `file://` peut bloquer certains appels `fetch` selon le navigateur.

