import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Games from './pages/Games'
import Awards from './pages/Awards'
import GameDetail from './pages/GameDetail'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <NavBar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:id" element={<GameDetail />} />
            <Route path="/awards" element={<Awards />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
