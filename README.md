# 🎲 Bet You Can't

A social game hub where friends challenge each other, play mini-games, and settle it with a dare.

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

---

## How It Works

1. **Pick a game** on the home page
2. Click **"Generate Code & Start"** — you'll land in a lobby with a unique join code (e.g. `XK7-92M`)
3. Optionally type in a **dare or bet**
4. Share the code with your friend — they go to the home page, enter the code under "Join Game"
5. Once both players are in the lobby, the host clicks **Start Game**
6. Play! Both players see the same board updating in real-time (via localStorage polling)

---

## Project Structure

```
src/
├── games/
│   ├── index.js              ← Game registry (add new games here!)
│   └── TicTacToeWeird/
│       ├── TicTacToeWeird.jsx
│       └── TicTacToeWeird.css
├── pages/
│   ├── Home.jsx + .css       ← Landing page
│   ├── GameLobby.jsx + .css  ← Waiting room + dare/bet setup
│   └── GameRoom.jsx + .css   ← Active game session
├── components/
│   ├── GameCard.jsx          ← Game tile in the home grid
│   ├── GameCode.jsx          ← Join code display + copy
│   └── DareBet.jsx           ← Dare/bet display banner
├── hooks/
│   └── useGameSession.js     ← Session polling hook
├── utils/
│   └── sessionStore.js       ← localStorage session helpers
├── App.jsx                   ← Router
├── main.jsx
└── index.css                 ← Design system & globals
```

---

## Adding a New Game

1. Create `src/games/YourGame/YourGame.jsx`

Your component receives these props:

```jsx
function YourGame({ gameState, onMove, playerRole }) {
  // gameState  — the current shared state object
  // onMove(newState) — call this to commit a move
  // playerRole — 'X' (host/P1) or 'O' (guest/P2)
}
```

2. Register it in `src/games/index.js`:

```js
import YourGame from './YourGame/YourGame'

{
  id: 'your-game',
  name: 'Your Game',
  emoji: '🎯',
  tagline: 'Short tagline',
  description: 'Full description shown in lobby.',
  minPlayers: 2,
  maxPlayers: 2,
  component: YourGame,
  createInitialState: () => ({
    // whatever state your game needs
  }),
}
```

That's it — the game appears in the home page grid automatically!

---

## Weird Tic-Tac-Toe Rules

- Standard 3×3 grid, X goes first
- **On your 4th move**, your *oldest* mark vanishes before your new one is placed
- Each player always has at most **3 marks** on the board
- Marks about to disappear are shown with a warning indicator
- Standard win detection on rows, columns, diagonals

---

## Going Real-Time (Production)

Currently uses `localStorage` + 500ms polling for simplicity.
To upgrade to real multiplayer:

1. Replace `src/utils/sessionStore.js` with Supabase Realtime / Firebase / WebSocket calls
2. Update `src/hooks/useGameSession.js` to subscribe instead of poll
3. The page components need **zero changes** — they use the hook's API

---

## Tech Stack

- **React 18** + **Vite 5**
- **React Router v6** for client-side routing
- **CSS custom properties** for the design system (no UI library)
- **Google Fonts**: Archivo Black · DM Mono · Nunito
