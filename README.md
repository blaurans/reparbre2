# Réparbre 🌳

**Se réparer en câlinant les arbres.** Une application qui invite à sortir, trouver un arbre, et lui faire un vrai câlin — cinq minutes minimum.

## Le concept

Chaque semaine, un arbre est à l'honneur. Pour participer :

1. Va jusqu'à l'arbre (à moins de 50 mètres)
2. Câline-le pendant au moins 5 minutes
3. Gagne des points de bonheur

Les points se cumulent semaine après semaine. Ils ne servent à rien d'autre qu'à te rappeler que tu as pris ce temps.

## Stack technique

- **SvelteKit 2** + Svelte 5
- **SQLite** (better-sqlite3) via Drizzle ORM
- **Tailwind CSS 4**
- **Arctic** pour l'OAuth Google
- Déploiement : Docker + Caddy

## Développement local

```bash
npm install
npm run dev
```

Variables d'environnement nécessaires (voir `.env.example`) :

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
DATA_DIR=./data
```

## Déploiement

```bash
docker compose up -d --build
```

L'app tourne sur le port 3000. Le reverse proxy Caddy (sur le réseau `headscale_default`) route `reparbre2.laurans.org` vers le conteneur.

## Structure

```
src/
├── lib/server/      # logique métier (game.ts, auth.ts, db/)
├── routes/
│   ├── +page.svelte           # accueil
│   ├── calin/                 # check-in GPS + timer
│   ├── intentions/            # dépenser ses points
│   └── profil/                # historique
└── app.css                    # thème forêt
```
