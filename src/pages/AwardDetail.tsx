import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './GameDetail.css'
import GameTile from '../components/GameTile'
import { resolveImageSrc } from '../utils/images'

interface Game { id: string; name: string; cover?: string; icon?: string; synopsis?: string }
interface Award { id: string; name: string; description?: string; nominees: string[]; cover?: string; icon?: string; trophy?: string }

export default function AwardDetail() {
  const { id } = useParams()
  const [award, setAward] = useState<Award | null>(null)
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    fetch('/data/awards.json').then(r => r.json()).then((all: Award[]) => setAward(all.find(a => a.id === id) ?? null))
    fetch('/data/games.json').then(r => r.json()).then((g) => setGames(g))
  }, [id])

  if (!award) return <main><p>Premio no encontrado.</p></main>

  const coverSrc = resolveImageSrc(award.cover || award.icon)
  const nominees = (award.nominees || []).map(n => games.find(g => g.id === n)).filter(Boolean) as Game[]

  return (
    <main className="game-detail">
      <div className="detail-hero">
        <div className="detail-cover" style={coverSrc ? { backgroundImage: `url(${coverSrc})`} : undefined}>
          <div className="detail-title-box">
            {award.icon ? <img src={resolveImageSrc(award.icon)} alt={`Icono de ${award.name}`} className="detail-icon" /> : null}
            <h1>{award.name}</h1>
          </div>
          {award.trophy ? <div className="award-trophy" style={{ backgroundImage: `url(${resolveImageSrc(award.trophy)})` }} aria-hidden></div> : null}
        </div>
      </div>

      <div className="detail-body">
        {award.description && <p className="synopsis">{award.description}</p>}

        <section className="awards-section">
          <h2>Nominados</h2>
          <div className="games-grid grid">
            {nominees.map(g => (
              <div key={g.id} className="game-wrapper">
                <GameTile id={g.id} name={g.name} cover={g.cover} />
              </div>
            ))}
          </div>
          {nominees.length === 0 && <p className="muted">No hay juegos nominados para este premio.</p>}
        </section>
      </div>
    </main>
  )
}
