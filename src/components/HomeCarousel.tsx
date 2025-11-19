import { useEffect, useMemo, useState } from 'react'
import type { TouchEvent } from 'react'
import GameTileExtended from './GameTileExtended'
import './HomeCarousel.css'

interface CarouselItem {
  type: 'game'
  id: string
  title: string
  cover?: string
  synopsis?: string
  icon?: string
  trophy?: string
  nominations?: { id: string; name?: string; icon?: string; trophy?: string }[]
}

interface HomeCarouselProps {
  items: CarouselItem[]
}

// Simple responsive carousel that organizes items into slides of N cards.
export default function HomeCarousel({ items }: HomeCarouselProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const slides = useMemo(() => items.map((it) => [it]), [items])
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const onTouchStart = (e: TouchEvent) => setTouchStart(e.touches?.[0]?.clientX ?? null)
  const onTouchEnd = (e: TouchEvent) => {
    const end = e.changedTouches?.[0]?.clientX ?? null
    if (touchStart == null || end == null) return
    const delta = end - touchStart
    if (Math.abs(delta) > 40) {
      if (delta < 0) setIndex((i) => (i + 1) % slides.length)
      else setIndex((i) => (i - 1 + slides.length) % slides.length)
    }
    setTouchStart(null)
  }

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % Math.max(1, slides.length)), 4500)
    return () => clearInterval(t)
  }, [slides, paused])

  // Ensure index is valid when slides count changes
  useEffect(() => {
    if (index >= slides.length) setIndex(0)
  }, [slides])

  // Set a random start index when slides are first created
  useEffect(() => {
    if (slides.length > 0) setIndex(Math.floor(Math.random() * slides.length))
  }, [slides.length])

  if (!items || items.length === 0) return null

  const goPrev = (e?: React.MouseEvent) => { e?.stopPropagation(); setIndex((i) => { const ni = (i - 1 + slides.length) % slides.length; console.debug('HomeCarousel.goPrev ->', ni); return ni }) }
  const goNext = (e?: React.MouseEvent) => { e?.stopPropagation(); setIndex((i) => { const ni = (i + 1) % slides.length; console.debug('HomeCarousel.goNext ->', ni); return ni }) }

  const onKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
    if (e.key === 'ArrowRight') { e.preventDefault(); goNext() }
  }

  const slideFraction = slides.length > 0 ? 100 / slides.length : 100
  return (
    <div className="home-carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onKeyDown={onKeyNav} tabIndex={0}>
      <div className="carousel-controls">
        <button aria-label="Prev" aria-controls="home-carousel-slides" className="carousel-btn prev" onClick={goPrev} type="button" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goPrev() } }}>‹</button>
        <button aria-label="Next" aria-controls="home-carousel-slides" className="carousel-btn next" onClick={goNext} type="button" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goNext() } }}>›</button>
      </div>
      <div id="home-carousel-slides" className="slides" role="region" aria-roledescription="carousel" aria-label="Juegos destacados">
        <div className="slides-inner" style={{ width: `${slides.length * 100}%`, transform: `translateX(${ -index * slideFraction }%)`, transition: 'transform 450ms cubic-bezier(.2,.9,.2,1)', ['--slides' as any]: slides.length }}>
          {slides.map((slide, sidx) => (
            <div key={sidx} className="slide" aria-hidden={sidx !== index}>
              <div className="slide-content">
                {slide.map((it) => (
                  <div key={it.type + it.id} className="slide-item">
                                <GameTileExtended id={it.id} name={it.title} cover={it.cover} synopsis={it.synopsis} nominations={it.nominations} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
