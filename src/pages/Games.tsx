import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import GameTile from '../components/GameTile'
import GameCard from '../components/GameCard'
import './Games.css'

interface Game {
  id: string
  name: string
  cover?: string
  icon?: string
  synopsis?: string
  tags?: string[]
}

interface Tag {
  id: string
  name: string
}

export default function Games() {
  const [games, setGames] = useState<Game[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [searchParams, setSearchParams] = useSearchParams()
  type View = 'list' | 'grid'
  // prefer URL param, fallback to localStorage, default to 'list'
  const param = (searchParams.get('view') as View) || undefined
  const stored = typeof window !== 'undefined' ? (localStorage.getItem('mjda.view') as View | null) : null
  const view = (param ?? stored ?? 'list') as View

  useEffect(() => {
    fetch('/data/games.json')
      .then((r) => r.json())
      .then(setGames)
    fetch('/data/tags.json')
      .then((r) => r.json())
      .then(setTags)
  }, [])

  // store current view into localStorage whenever search param is not set (i.e. button clicks)

  const tagName = (id?: string) => tags.find((t) => t.id === id)?.name || id

  // No additional effect needed: view is derived from search params

  return (
    <main>
      <h1>Todos los Juegos</h1>
      <p className="muted">Listado provisional de juegos almacenados en JSON en /data.</p>

      <div className="games-controls">
        <div className="view-toggle">
          <button
            className={`toggle ${view === 'list' ? 'active' : ''}`}
            onClick={() => {
              setSearchParams({ view: 'list' })
              try { localStorage.setItem('mjda.view', 'list') } catch (err) { void err }
            }}
          >Lista</button>
          <button
            className={`toggle ${view === 'grid' ? 'active' : ''}`}
            onClick={() => {
              setSearchParams({ view: 'grid' })
              try { localStorage.setItem('mjda.view', 'grid') } catch (err) { void err }
            }}
          >Grid</button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="games-grid list">
          {games.map((g) => (
            <div key={g.id} className="game-wrapper">
              <GameCard {...g} tags={(g.tags || []).map((t) => tagName(t)).filter(Boolean) as string[]} />
            </div>
          ))}
        </div>
      ) : (
        <div className="games-grid grid">
          {games.map((g) => (
            <div key={g.id} className="game-wrapper">
              <GameTile id={g.id} name={g.name} cover={g.cover} />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
