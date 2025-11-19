import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './GameDetail.css'
import AwardTile from '../components/AwardTile'
import { resolveImageSrc } from '../utils/images'

interface Game {
  id: string
  name: string
  cover?: string
  icon?: string
  synopsis?: string
  tags?: string[]
  images?: string[]
}

interface Tag { id: string; name: string }
interface Award { id: string; name: string; description?: string; nominees: string[]; cover?: string; icon?: string; trophy?: string }

export default function GameDetail() {
  const { id } = useParams()
  const [game, setGame] = useState<Game | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [awards, setAwards] = useState<Award[]>([])

  useEffect(() => {
    fetch('/data/games.json').then(r => r.json()).then((all: Game[]) => setGame(all.find(g => g.id === id) ?? null))
    fetch('/data/tags.json').then(r => r.json()).then(setTags)
    fetch('/data/awards.json').then(r => r.json()).then(setAwards)
  }, [id])

  if (!game) return <main><p>Juego no encontrado.</p></main>

  const gameTags = (game.tags || []).map(t => tags.find(tag => tag.id === t)?.name || t)
  const nominatedAwards = awards.filter(a => a.nominees.includes(game.id))
  const coverSrc = resolveImageSrc(game.cover || game.icon)

  return (
    <main className="game-detail">
      <div className="detail-hero">
        <div className="detail-cover" style={coverSrc ? { backgroundImage: `url(${coverSrc})`} : undefined}>
          <div className="detail-title-box">
            {game.icon ? <img src={resolveImageSrc(game.icon)} alt={`Icono de ${game.name}`} className="detail-icon" /> : null}
            <h1>{game.name}</h1>
          </div>
        </div>
      </div>

      <div className="detail-body">
        {game.synopsis && <p className="synopsis">{game.synopsis}</p>}

        <div className="tags-row">
          {gameTags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>

        <div className="detail-gallery">
          {(game.images || []).map((img, i) => {
            const src = resolveImageSrc(img)
            return <div key={i} className="gallery-item" style={src ? { backgroundImage: `url(${src})` } : undefined} />
          })}
        </div>

        <section className="awards-section">
          <h2>Premios en los que está nominado</h2>
          {nominatedAwards.length ? (
            <div className="games-grid grid">
              {nominatedAwards.map((a) => (
                <div key={a.id} className="game-wrapper">
                  <AwardTile id={a.id} name={a.name} cover={a.cover} icon={a.icon} trophy={a.trophy} />
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No está nominado en ninguna categoría.</p>
          )}
        </section>
      </div>
    </main>
  )
}
