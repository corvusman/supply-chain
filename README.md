# Agri Supply Chain Prototype

React + Vite + Tailwind prototype with static data for beef supply chain.
- Search screen → Results with tabs: **Flow / Graph / List**
- Clicking any card/node/row opens a **Details** side panel
- Ready to deploy to **GitHub Pages** via Actions

## Local Dev
```bash
npm ci
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages
- Set `base` in `vite.config.ts` to `/<your-repo-name>/`
- Push to `main` branch. GitHub Action will build and publish to Pages.