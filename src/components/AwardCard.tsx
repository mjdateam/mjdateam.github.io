import { Link } from 'react-router-dom'
import './AwardCard.css'
import { resolveImageSrc } from '../utils/images'

interface AwardCardProps {
  id: string
  name: string
  cover?: string
  icon?: string
  trophy?: string
  description?: string
  nominees?: { id: string; name?: string }[]
}

export default function AwardCard({ id, name, cover, icon, trophy, description, nominees = [] }: AwardCardProps) {
  const coverSrc = resolveImageSrc(cover)
  const iconSrc = resolveImageSrc(icon)
  return (
    <Link to={`/awards/${id}`} className="award-card-link">
      <article className="award-card" aria-labelledby={`award-title-${id}`}>
        <div className="award-card-left">
          {coverSrc ? <div className="award-cover" style={{ backgroundImage: `url(${coverSrc})` }} /> : null}
          {iconSrc ? <div className="award-icon" style={{ backgroundImage: `url(${iconSrc})` }} aria-hidden /> : null}
          {trophy ? <div className="award-trophy" style={{ backgroundImage: `url(${resolveImageSrc(trophy)})` }} aria-hidden /> : null}
        </div>
        <div className="award-card-right">
          <h3 id={`award-title-${id}`}>{name}</h3>
          {description ? <p className="muted">{description}</p> : null}
          <div className="nominees">
            {nominees.map(n => <div key={n.id} className="nominee"><Link to={`/games/${n.id}`}>{n.name || n.id}</Link></div>)}
          </div>
        </div>
      </article>
    </Link>
  )
}
