import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Awards.css'

interface Award { id: string; name: string; description?: string; nominees: string[] }
interface Game { id: string; name: string }

export default function Awards() {
  const [awards, setAwards] = useState<Award[]>([])
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    fetch('/data/awards.json').then(r => r.json()).then(setAwards)
    fetch('/data/games.json').then(r => r.json()).then(setGames)
  }, [])

  const findGame = (id: string) => games.find(g => g.id === id)

  return (
    <main>
      <h1>Premios</h1>
      <div className="awards-list">
        {awards.map(a => (
          <div key={a.id} className="award-card">
            <h2>{a.name}</h2>
            <p className="muted">{a.description}</p>
            <div className="nominees">
              {a.nominees.map(n => <div key={n} className="nominee"><Link to={`/games/${n}`}>{findGame(n)?.name || n}</Link></div>)}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
