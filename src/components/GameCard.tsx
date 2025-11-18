import { Link } from 'react-router-dom'
import './GameCard.css'
import { resolveImageSrc } from '../utils/images'

interface GameCardProps {
  id: string
  name: string
  cover?: string
  icon?: string
  synopsis?: string
  tags?: string[]
}

export default function GameCard({ id, name, cover, icon, synopsis, tags = [] }: GameCardProps) {
  const coverSrc = resolveImageSrc(cover)
  const iconSrc = resolveImageSrc(icon)
  return (
    <Link to={`/games/${id}`} className="game-card-link">
      <article className="game-card" aria-labelledby={`title-${id}`}>
        <div className="cover" style={coverSrc ? { backgroundImage: `url(${coverSrc})` } : undefined}></div>
        <div className="game-card-body">
        <div className="game-card-title">
          {iconSrc ? (
            <img src={iconSrc} className="game-icon" alt={`${name} icon`} />
          ) : null}
          <h3 id={`title-${id}`}>{name}</h3>
        </div>
        <p className="synopsis">{synopsis}</p>
        <div className="tags">
          {tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        </div>
      </article>
    </Link>
  )
}
