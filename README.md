# Bet You Can't

A social game hub for friends. Pick a game, share a code, add a dare — and play.

Built by [@Tsarles](https://github.com/Tsarles)

---

## Games

- **Three Tac Toe** — Tic-Tac-Toe but your oldest mark disappears on your 4th move
- **Connect or Sink the 4** — Connect 4 but every 3rd move shifts a random column
- **Ekans** — Solo snake score battle with randomly shuffled controls
- **Pass the Chaos** — Pick tiles with hidden effects like Reverse, Skip, Snake Jump, and more

---

## Setup

```bash
git clone https://github.com/Tsarles/bet-you-cant.git
cd bet-you-cant
npm install
```

Create a `.env.local` file with your Firebase keys:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FORMSPREE_ID=        ← optional, for game suggestions
```

Then run:

```bash
npm run dev
```

---

## Deploying to Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add your `VITE_*` environment variables in Vercel → Settings → Environment Variables
4. Deploy

Make sure you have a `vercel.json` in the root so page refresh works:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Firebase Setup

1. Create a project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore — pick region `asia-southeast1` for best speed in Southeast Asia
3. Set rules to allow read/write on `sessions` and `meta` collections
4. Copy your config into `.env.local`

---

## Adding a New Game

1. Create `src/games/YourGame/YourGame.jsx`
2. Your component gets these props: `gameState`, `onMove`, `playerRole`, `players`, `onRoundWin`
3. Register it in `src/games/index.js` — it shows up automatically

---

## Tech

- React 18 + Vite
- Firebase Firestore (real-time multiplayer)
- React Router v6
- Boxicons + Google Fonts (Kalam, Schoolbell)
- No UI library — pure CSS

---

© 2026 Bet You Can't
