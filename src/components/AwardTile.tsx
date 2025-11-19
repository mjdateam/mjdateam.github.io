import { Link } from 'react-router-dom'
import './AwardTile.css'
import { resolveImageSrc } from '../utils/images'

interface AwardTileProps {
  id: string
  name: string
  cover?: string
  icon?: string
  trophy?: string
  synopsis?: string
}

export default function AwardTile({ id, name, cover, icon, trophy }: AwardTileProps) {
  const coverSrc = resolveImageSrc(cover || icon || trophy)
  return (
    <Link to={`/awards/${id}`} className="game-tile-link award-tile-link">
      <article className="award-tile game-tile" aria-labelledby={`award-title-${id}`}>
        <div className="tile-cover award-cover" style={coverSrc ? { backgroundImage: `url(${coverSrc})` } : undefined}>
          <div className="tile-label award-label" id={`award-title-${id}`}>{name}</div>
        </div>
      </article>
    </Link>
  )
}
