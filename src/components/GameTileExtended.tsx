import { Link } from 'react-router-dom'
import './GameTileExtended.css'
import { resolveImageSrc } from '../utils/images'

interface GameTileExtendedProps {
  id?: string
  name: string
  cover?: string
  synopsis?: string
  isAward?: boolean
  icon?: string
  trophy?: string
  nominations?: { id: string; name?: string; icon?: string; trophy?: string }[]
}

export default function GameTileExtended({ id, name, cover, synopsis, isAward = false, icon, trophy, nominations = [] }: GameTileExtendedProps) {
  const displayCover = cover || icon || trophy
  const coverStyle = displayCover ? { backgroundImage: `url(${resolveImageSrc(displayCover)})` } : undefined
  const iconStyle = icon ? { backgroundImage: `url(${resolveImageSrc(icon)})` } : undefined
  const trophyStyle = trophy ? { backgroundImage: `url(${resolveImageSrc(trophy)})` } : undefined

  const inner = (
    <article className={`game-tile-extended ${isAward ? 'is-award' : ''}`} aria-labelledby={`gtex-${id}`}>
      <div className="gtex-left">
        <div className={`gtex-cover ${isAward ? 'is-award' : ''}`} style={coverStyle}></div>
        {icon ? <div className="gtex-icon" style={iconStyle} role="img" aria-label={`Icono de ${name}`}></div> : null}
        {isAward && trophy ? <div className="gtex-trophy" style={trophyStyle} aria-hidden></div> : null}
          {/* nominations moved to bottom-right of tile */}
      </div>
      <div className="gtex-right">
        <h3 id={`gtex-${id}`}>{name}</h3>
        {synopsis ? <p className="gtex-synopsis">{synopsis}</p> : null}
        {nominations.length > 0 ? (
          <div className="gtex-nominees">
            {nominations.slice(0, 4).map((aw) => {
              const src = aw.icon || aw.trophy
              const bg = src ? { backgroundImage: `url(${resolveImageSrc(src)})` } : undefined
              return (
                <Link key={aw.id} to={`/awards/${aw.id}`} className="gtex-nominee" title={aw.name} aria-label={`Nominado a ${aw.name}`}>
                  <span style={bg} />
                </Link>
              )
            })}
          </div>
        ) : null}
      </div>
    </article>
  )

  if (id && !isAward) {
    return <Link to={`/games/${id}`} className="gtex-link">{inner}</Link>
  }
  return <div className="gtex-link">{inner}</div>
}
