// No imports: top-level doesn't need to import React in modern JSX runtime
// import Link not used on home page any more
import { useEffect, useState } from 'react'
// Reintroduce data fetching to show a featured game in the hero
import './Home.css'
import HomeCarousel from '../components/HomeCarousel'

// Home page doesn't fetch content; it only shows action buttons.

interface Game { id: string; name: string; cover?: string; synopsis?: string }
interface Award { id: string; name?: string; title?: string; description?: string; nominees?: string[]; cover?: string; icon?: string; trophy?: string }

export default function Home() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [awards, setAwards] = useState<Award[]>([])
  const [carouselItems, setCarouselItems] = useState<{ type: 'game'; id: string; title: string; cover?: string; synopsis?: string; icon?: string; trophy?: string; nominations?: { id: string; name?: string; icon?: string; trophy?: string }[] }[]>([])

  useEffect(() => {
    fetch('/data/games.json')
      .then((r) => r.json())
      .then((g) => setGames(g))
      .finally(() => setLoading(false))
    fetch('/data/awards.json')
      .then((r) => r.json())
      .then(setAwards)
      .catch(() => setAwards([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    // Build carousel items when games or awards change and shuffle once
    const items: { type: 'game'; id: string; title: string; cover?: string; synopsis?: string; icon?: string; trophy?: string; nominations?: { id: string; name?: string; icon?: string; trophy?: string }[] }[] = []
    // Only include games that are nominated in at least one award
    const nominatedGameIds = new Set<string>()
    for (const a of awards) {
      for (const n of (a.nominees || [])) nominatedGameIds.add(n)
    }
    const nominatedGames = games.filter((g) => nominatedGameIds.has(g.id))
    for (let i = 0; i < Math.min(12, nominatedGames.length); i++) {
      const g = nominatedGames[i]
      const nominations = awards.filter(a => (a.nominees || []).includes(g.id)).map(a => ({ id: a.id || '', name: a.name, icon: a.icon, trophy: a.trophy }))
      items.push({ type: 'game', id: g.id, title: g.name, cover: g.cover, synopsis: g.synopsis, nominations })
    }
    // Do not include awards in the carousel; only games that are nominated are shown.
    // fisher-yates shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = items[i]
      items[i] = items[j]
      items[j] = tmp
    }
    // Schedule the state update to next tick to avoid synchronous state updates during effect
    setTimeout(() => setCarouselItems(items), 0)
  }, [games, awards])

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <h1>MJDA — Melhores Jogos Do Ano</h1>
          <p>Premios de Videojuegos. Celebramos innovación, arte y diseño — descubre los mejores juegos nominados este año.</p>
        </div>
      </section>

      <section className="home-cta">
        <div className="hero-featured"></div>
      </section>

      <section className="home-carousel-wrap">
        {loading ? (
          <div className="hero-placeholder">Cargando carousel...</div>
        ) : (
          <HomeCarousel items={carouselItems} />
        )}
      </section>
    </main>
  )
}
