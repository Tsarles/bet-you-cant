import { Routes, Route } from 'react-router-dom'
import Landing    from './pages/Landing'
import Home       from './pages/Home'
import GameLobby  from './pages/GameLobby'
import GameRoom   from './pages/GameRoom'

export default function App() {
  return (
    <Routes>
      <Route path="/"             element={<Landing />} />
      <Route path="/home"         element={<Home />} />
      <Route path="/lobby/:gameId" element={<GameLobby />} />
      <Route path="/room/:gameId"  element={<GameRoom />} />
    </Routes>
  )
}
