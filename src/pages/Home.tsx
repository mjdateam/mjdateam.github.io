// No imports: top-level doesn't need to import React in modern JSX runtime
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
// Reintroduce data fetching to show a featured game in the hero
import './Home.css'

// Home page doesn't fetch content; it only shows action buttons.

interface Game { id: string; name: string; cover?: string; synopsis?: string }

export default function Home() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/games.json')
      .then((r) => r.json())
      .then((g) => setGames(g))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <h1>MJDA — Melhores Jogos Do Ano</h1>
          <p>Premios de Videojuegos. Celebramos innovación, arte y diseño — descubre los mejores juegos nominados este año.</p>
        </div>
      </section>

      <section className="home-cta">
        <div className="hero-ctas">
          <Link to="/games?view=grid" className="btn primary large">Explorar Juegos</Link>
          <Link to="/awards" className="btn outline small">Ver Categorías y Premios</Link>
        </div>
        <div className="hero-featured">
          {loading ? (
            <div className="hero-placeholder">Cargando destacado...</div>
          ) : (
            games && games.length > 0 ? (
              <div className="featured-card">
                <Link to={`/games/${games[0].id}`} className="featured-link">
                  <div className="featured-cover" style={{ backgroundImage: `url(${games[0].cover})` }} />
                  <div className="featured-meta">
                    <h3>{games[0].name}</h3>
                    <p className="muted">{games[0].synopsis}</p>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="hero-placeholder">Sin juegos disponibles</div>
            )
          )}
        </div>
      </section>
    </main>
  )
}
