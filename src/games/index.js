// games/index.js — Game Registry

import TicTacToeWeird  from './TicTacToeWeird/TicTacToeWeird'
import ConnectSink4    from './ConnectSink4/ConnectSink4'
import Ekans           from './Ekans/Ekans'
import PassTheChaos    from './PassTheChaos/PassTheChaos'

const GAMES = [
  {
    id: 'three-tac-toe',
    name: 'Three Tac Toe',
    bxIcon: 'bx-grid-alt',
    tagline: 'Classic grid, sneaky twist',
    description: 'Standard Tic-Tac-Toe — but on your 4th move, your oldest mark vanishes from the board. Stay sharp!',
    minPlayers:2, maxPlayers:2,
    component: TicTacToeWeird,
    createInitialState: () => ({
      board:Array(9).fill(null), xMoves:[], oMoves:[],
      currentTurn:'X', winner:null, winLine:[],
    }),
  },
  {
    id: 'connect-sink-4',
    name: 'Connect or Sink the 4',
    bxIcon: 'bx-dots-horizontal-rounded',
    tagline: 'Chaotic Connect 4',
    description: 'Drop tokens to connect 4 in a row. But every 3rd move, a random column shifts up or down — sinking your winning line!',
    minPlayers:2, maxPlayers:2,
    component: ConnectSink4,
    createInitialState: () => ({
      board:Array(6*7).fill(null), xMoveCount:0, oMoveCount:0,
      currentTurn:'X', winner:null, winLine:[], lastShiftCol:null,
    }),
  },
  {
    id: 'ekans',
    name: 'Ekans',
    bxIcon: 'bx-cycling',
    tagline: 'Chaotic Snake — score battle',
    description: 'Solo snake with chaos twists. Every 5th apple permanently reverses your controls. Void tiles teleport you. Collisions rewind 3 moves. Highest score wins!',
    minPlayers:2, maxPlayers:2,
    component: Ekans,
    createInitialState: () => ({
      scoreX:null, scoreO:null, submittedX:false, submittedO:false,
    }),
  },
  {
    id: 'pass-the-chaos',
    name: 'Pass the Chaos',
    bxIcon: 'bx-shuffle',
    tagline: 'Tile picking mayhem',
    description: 'Players take turns picking numbered tiles. Each tile hides a secret effect — Reverse turns, Skip, Repeat, Snake Jump, Dare Tile, or Bonus points. Most points wins!',
    minPlayers:2, maxPlayers:2,
    component: PassTheChaos,
    createInitialState: () => ({
      tiles: null, // built fresh on first render
      scores:{X:0,O:0}, currentTurn:'X', order:['X','O'],
      message:'Pick a tile to start!', winner:null, extraPick:false, log:[],
    }),
  },
]

export default GAMES
export function getGame(id) { return GAMES.find(g=>g.id===id) || null }
