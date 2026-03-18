<div align="center">

```
  ██████╗ ███████╗████████╗    ██╗   ██╗ ██████╗ ██╗   ██╗
  ██╔══██╗██╔════╝╚══██╔══╝    ╚██╗ ██╔╝██╔═══██╗██║   ██║
  ██████╔╝█████╗     ██║        ╚████╔╝ ██║   ██║██║   ██║
  ██╔══██╗██╔══╝     ██║         ╚██╔╝  ██║   ██║██║   ██║
  ██████╔╝███████╗   ██║          ██║   ╚██████╔╝╚██████╔╝
  ╚═════╝ ╚══════╝   ╚═╝          ╚═╝    ╚═════╝  ╚═════╝
                       ██████╗ █████╗ ███╗  ██╗████████╗
                      ██╔════╝██╔══██╗████╗ ██║╚══██╔══╝
                      ██║     ███████║██╔██╗██║   ██║
                      ██║     ██╔══██║██║╚████║   ██║
                      ╚██████╗██║  ██║██║ ╚███║   ██║
                       ╚═════╝╚═╝  ╚═╝╚═╝  ╚══╝   ╚═╝
```

**A social game hub for friends — challenge, dare, and win.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://bet-you-cant.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Tsarles-181717?style=for-the-badge&logo=github)](https://github.com/Tsarles)
[![Built with React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com)

</div>

---

## What is Bet You Can't?

**Bet You Can't** is a real-time multiplayer social game hub built for friends.
Pick a game, generate a code, share it with your friend, add a dare or a bet — and play.

No accounts. No downloads. Just a link and a code.

---

## Features

- **4 playable games** — all with chaotic twists
- **Real-time multiplayer** via Firebase Firestore — works across devices and networks
- **Unique join codes** — 6-character codes to invite friends instantly
- **Dare & Bet system** — add a dare, a bet, or a truth challenge before playing
- **Win series** — first to 1–5 wins takes the series
- **Side switching** — loser becomes X (goes first) next round, keeping it fair
- **Player names & colors** — pick your token color and name before playing
- **End game screen** — confetti, winner announcement, final scores
- **Suggest a game** — submit your own game idea directly to the creator
- **Like counter** — show some love, no account needed
- **Sticky note** — responsible gaming reminder pinned to the page
- **Privacy modal** — full privacy & ownership info

---

## Games

### ⚡ Three Tac Toe
Classic Tic-Tac-Toe with a sneaky twist.

> On your **4th move**, your oldest mark disappears from the board. Each player always has at most 3 marks visible. The board keeps shifting — stay sharp.

---

### 💥 Connect or Sink the 4
Standard Connect 4 — but the board fights back.

> Drop tokens into a 7×6 grid to connect 4 in a row. **Every 3rd move**, a random column shifts up or down by one row, potentially destroying your winning line. A chaos countdown tells you exactly when the next shift hits.

---

### 🐍 Ekans
Solo snake — score battle format.

> Both players play separately and submit their scores. The higher score wins the round. Chaos twists:
> - **Every 5th apple** randomly shuffles your controls (↑ might now go right, ← might go down, etc.)
> - **Void tiles** teleport your snake to a random position
> - **Forgiveness moves** — collide and the game rewinds your last 3 moves instead of ending

---

### 🃏 Pass the Chaos
Tile-picking mayhem.

> 16 numbered tiles, all face-down. Players take turns picking one. Each tile hides a secret effect:
>
> | Effect | What happens |
> |--------|-------------|
> | Normal | +1 point |
> | Reverse | Turn order flips |
> | Skip | Next player loses their turn |
> | Repeat | Same player picks again |
> | Snake Jump | Claim a second random tile |
> | Dare Tile | Current player must do a dare |
> | Bonus | +3 points total |
>
> Most points when all tiles are claimed wins the round.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with Firestore enabled

### 1. Clone the repo

```bash
git clone https://github.com/Tsarles/bet-you-cant.git
cd bet-you-cant
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Firebase

1. Go to [firebase.google.com](https://firebase.google.com) and create a project
2. Enable **Firestore Database** — choose region `asia-southeast1` (Singapore) for best performance in Southeast Asia
3. Set Firestore rules to:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read, write: if true;
    }
    match /meta/{docId} {
      allow read, write: if true;
    }
  }
}
```

4. Go to **Project Settings → Your Apps** and copy your Firebase config

### 4. Create your environment file

Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Never commit this file.** It's already in `.gitignore`.

### 5. (Optional) Set up game suggestions

1. Create a free account at [formspree.io](https://formspree.io)
2. Create a new form — copy your Form ID
3. Add to `.env.local`:

```env
VITE_FORMSPREE_ID=your_form_id
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploying to Vercel

### Option A — From GitHub (recommended, auto-deploys on push)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. Vercel auto-detects Vite — no config needed
4. Add all `VITE_*` environment variables in **Settings → Environment Variables**
5. Click **Deploy**

### Option B — Drag & drop

```bash
npm run build
```

Drag the `dist/` folder to [vercel.com/new](https://vercel.com/new).

### Fix page refresh (required for React Router)

Create a `vercel.json` in the project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Project Structure

```
bet-you-cant/
├── public/
│   └── favicon.svg
├── src/
│   ├── games/
│   │   ├── index.js                    ← Game registry
│   │   ├── TicTacToeWeird/
│   │   │   ├── TicTacToeWeird.jsx
│   │   │   └── TicTacToeWeird.css
│   │   ├── ConnectSink4/
│   │   │   ├── ConnectSink4.jsx
│   │   │   └── ConnectSink4.css
│   │   ├── Ekans/
│   │   │   ├── Ekans.jsx
│   │   │   └── Ekans.css
│   │   └── PassTheChaos/
│   │       ├── PassTheChaos.jsx
│   │       └── PassTheChaos.css
│   ├── pages/
│   │   ├── Landing.jsx + .css          ← Splash / home screen
│   │   ├── Home.jsx + .css             ← Game picker + join panel
│   │   ├── GameLobby.jsx + .css        ← Pre-game waiting room
│   │   └── GameRoom.jsx + .css         ← Active game session
│   ├── components/
│   │   ├── GameCard.jsx                ← Game tile with expandable description
│   │   ├── GameCode.jsx                ← Join code display + copy button
│   │   ├── DareBet.jsx                 ← Dare/bet callout banner
│   │   ├── PlayerSetup.jsx             ← Name + color picker
│   │   ├── GameOver.jsx                ← End-game celebration screen
│   │   └── SuggestGame.jsx             ← Game suggestion form (Formspree)
│   ├── hooks/
│   │   └── useGameSession.js           ← Firebase real-time session listener
│   ├── utils/
│   │   ├── firebase.js                 ← Firebase app init
│   │   └── sessionStore.js             ← Firestore CRUD + like counter
│   ├── App.jsx                         ← Route definitions
│   ├── main.jsx
│   └── index.css                       ← Global design system (CSS variables)
├── vercel.json                         ← SPA routing fix
├── .env.local                          ← Your Firebase keys (not committed)
└── package.json
```

---

## Adding a New Game

Adding a game takes 2 steps — no other files need to change.

### Step 1 — Create your game component

```
src/games/YourGame/
├── YourGame.jsx
└── YourGame.css
```

Your component receives these props:

```jsx
function YourGame({ gameState, onMove, playerRole, players, onRoundWin }) {
  // gameState        — current shared state (synced via Firebase)
  // onMove(newState) — call this to commit a move (writes to Firestore)
  // playerRole       — 'X' (host) or 'O' (guest)
  // players          — { X: { name, color }, O: { name, color } }
  // onRoundWin(role) — call with 'X' or 'O' when a round ends
}
```

### Step 2 — Register it in `src/games/index.js`

```js
import YourGame from './YourGame/YourGame'

{
  id:   'your-game',
  name: 'Your Game',
  bxIcon: 'bx-joystick',       // any Boxicons class
  tagline: 'Short tagline',
  description: 'Description shown in lobby and game info panel.',
  minPlayers: 2,
  maxPlayers: 2,
  component: YourGame,
  createInitialState: () => ({
    // return your game's starting state here
  }),
}
```

The game immediately appears in the home page grid and is fully playable.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 5 |
| Routing | React Router v6 |
| Real-time DB | Firebase Firestore |
| Icons | Boxicons 2.1 |
| Fonts | Kalam · Schoolbell (Google Fonts) |
| Styling | CSS custom properties — no UI framework |
| Deployment | Vercel |
| Suggestions | Formspree |

---

## Environment Variables Reference

| Variable | Where to get it |
|----------|----------------|
| `VITE_FIREBASE_API_KEY` | Firebase → Project Settings → Your Apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase → Project Settings → Your Apps |
| `VITE_FIREBASE_PROJECT_ID` | Firebase → Project Settings → Your Apps |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase → Project Settings → Your Apps |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase → Project Settings → Your Apps |
| `VITE_FIREBASE_APP_ID` | Firebase → Project Settings → Your Apps |
| `VITE_FORMSPREE_ID` | Formspree → Your Form → Form ID |

---

## How Multiplayer Works

```
Player 1 (Host)                    Firebase Firestore                 Player 2 (Guest)
      │                                    │                                 │
      │── saveSession(code, data) ────────►│                                 │
      │                                    │◄──── joinSession(code, info) ───│
      │◄─── watchSession (onSnapshot) ─────│──── watchSession (onSnapshot) ─►│
      │                                    │                                 │
      │── updateGameState(move) ──────────►│                                 │
      │                                    │──── onSnapshot fires ──────────►│
      │◄─── onSnapshot fires ──────────────│                                 │
```

Every write to Firestore triggers `onSnapshot` on both clients instantly — no polling, no WebSocket setup required.

---

## Privacy & Data

- Game sessions are stored in Firestore temporarily — they are **not deleted automatically** yet (future improvement)
- The **like counter** stores only a single number — no names, emails, or identifiers
- **No user accounts** are required or created
- No analytics or tracking is used

---

## Responsible Gaming

> Always bet responsibly and have fun doing things you like :)

This app is designed for fun between friends. Any dares or bets are entirely voluntary. Never pressure anyone into a dare they don't want to do.

---

## Credits & Contact

**Created by [@Tsarles](https://github.com/Tsarles)**

Got a game idea? Use the **Suggest a Game** button on the landing page — or open an issue on GitHub.

---

<div align="center">

© 2026 Bet You Can't · Built with React + Firebase · Deployed on Vercel

</div>
