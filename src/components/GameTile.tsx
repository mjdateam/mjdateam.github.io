import './GameTile.css'
import { Link } from 'react-router-dom'
import { resolveImageSrc } from '../utils/images'

interface GameTileProps {
  id: string
  name: string
  cover?: string
}

export default function GameTile({ id, name, cover }: GameTileProps) {
  const coverSrc = resolveImageSrc(cover)
  return (
    <Link to={`/games/${id}`} className="game-tile-link">
      <div className="game-tile" aria-labelledby={`title-${id}`}>
        <div className="tile-cover" style={coverSrc ? { backgroundImage: `url(${coverSrc})` } : undefined }>
          <div className="tile-label" id={`title-${id}`}>{name}</div>
        </div>
      </div>
    </Link>
  )
}
