import { useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import GameTile from '../components/GameTile'
import GameCard from '../components/GameCard'
import './Games.css'

interface Game {
  id: string
  name: string
  cover?: string
  icon?: string
  synopsis?: string
  tags?: string[]
}

interface Tag {
  id: string
  name: string
}

export default function Games() {
  const [games, setGames] = useState<Game[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  type Filters = { query: string; tags: string[]; sort: 'none' | 'alpha-asc' | 'alpha-desc' }
  const [filters, setFilters] = useState<Filters>({ query: '', tags: [], sort: 'alpha-asc' })
  const filtersRef = useRef<Filters>(filters)
  useEffect(() => { filtersRef.current = filters }, [filters])

  const setQuery = (q: string) => setFilters((s) => ({ ...s, query: q }))
  const toggleTag = (id: string) => setFilters((s) => (s.tags.includes(id) ? { ...s, tags: s.tags.filter((t) => t !== id) } : { ...s, tags: [...s.tags, id] }))
  const setSort = (s: Filters['sort']) => setFilters((st) => ({ ...st, sort: s }))
  const clearFilters = () => setFilters({ query: '', tags: [], sort: 'alpha-asc' })
  const [searchParams, setSearchParams] = useSearchParams()
  type View = 'list' | 'grid'
  // prefer URL param, default to 'list' (do not use localStorage)
  const param = (searchParams.get('view') as View) || undefined
  const view = (param ?? 'list') as View

  useEffect(() => {
    fetch('/data/games.json')
      .then((r) => r.json())
      .then(setGames)
    fetch('/data/tags.json')
      .then((r) => r.json())
      .then(setTags)
  }, [])

  // initialize filters from URL params, but only set when they differ from current filters
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const tagParam = searchParams.get('tags') || ''
    const tagsArr = tagParam ? tagParam.split(',').filter(Boolean) : []
    const sortParam = (searchParams.get('sort') as 'none' | 'alpha-asc' | 'alpha-desc' | null) || 'alpha-asc'
    const candidate: Filters = { query: q, tags: tagsArr, sort: sortParam }

    const current = filtersRef.current
    const tagsEqual = candidate.tags.length === current.tags.length && candidate.tags.every((t) => current.tags.includes(t))
    const same = candidate.query === current.query && candidate.sort === current.sort && tagsEqual
    if (!same) {
      // schedule update on next tick to avoid synchronous setState inside effect
      setTimeout(() => setFilters(candidate), 0)
    }
  }, [searchParams])

  const tagName = (id?: string) => tags.find((t) => t.id === id)?.name || id

  // When filter/sort changes update URL to allow bookmarking
  useEffect(() => {
    const params: Record<string, string> = {}
    if (filters.query) params.q = filters.query
    if (filters.tags.length) params.tags = filters.tags.join(',')
    if (filters.sort && filters.sort !== 'none') params.sort = filters.sort
    const currentViewParam = view
    if (currentViewParam) params.view = currentViewParam

    // compare via query string to avoid constructing objects and reduce chance of cycles
    const newQs = new URLSearchParams(params).toString()
    const currentQs = searchParams.toString()
    if (newQs !== currentQs) {
      if (Object.keys(params).length) setSearchParams(params)
      else setSearchParams({})
    }
  }, [filters, setSearchParams, view, searchParams])

  const displayedGames = useMemo(() => {
    const ql = filters.query.trim().toLowerCase()
    let result = (games || []).filter((g) => {
      const name = g.name?.toLowerCase() || ''
      const synopsis = g.synopsis?.toLowerCase() || ''
      const matchesQuery = !ql || name.includes(ql) || synopsis.includes(ql)
      const matchesTag = !filters.tags.length || (g.tags || []).some((tg) => filters.tags.includes(tg))
      return matchesQuery && matchesTag
    })
    if (filters.sort === 'alpha-asc') result = result.slice().sort((a, b) => a.name.localeCompare(b.name))
    else if (filters.sort === 'alpha-desc') result = result.slice().sort((a, b) => b.name.localeCompare(a.name))
    return result
  }, [games, filters.query, filters.tags, filters.sort])

  return (
    <main>
      <h1>Todos los Juegos</h1>
      <p className="muted">Listado provisional de juegos almacenados en JSON en /data.</p>

      <div className="games-controls">
        <div className="search-sort-row">
          <input aria-label="Buscar juegos" className="search-input" value={filters.query} placeholder="Buscar juegos..." onChange={(e) => setQuery(e.target.value)} />
          <select className="sort-select" value={filters.sort} onChange={(e) => setSort(e.target.value as 'none' | 'alpha-asc' | 'alpha-desc')}>
            <option value="alpha-asc">Alfabético (A → Z)</option>
            <option value="alpha-desc">Alfabético (Z → A)</option>
          </select>
          <button className="clear-filters" onClick={() => { clearFilters(); setSearchParams({}); }}>Limpiar</button>
        </div>
        <div className="tags-filter">
          {tags.map((t) => (
            <button key={t.id} aria-pressed={filters.tags.includes(t.id)} className={`tag-filter ${filters.tags.includes(t.id) ? 'active' : ''}`} onClick={() => { toggleTag(t.id) }}>{t.name}</button>
          ))}
        </div>
        <div className="view-toggle">
          <button
            className={`toggle ${view === 'list' ? 'active' : ''}`}
            onClick={() => {
              const next: Record<string, string> = {}
              for (const [k, v] of searchParams.entries()) next[k] = v
              next.view = 'list'
              setSearchParams(next)
            }}
          >Lista</button>
          <button
            className={`toggle ${view === 'grid' ? 'active' : ''}`}
            onClick={() => {
              const next: Record<string, string> = {}
              for (const [k, v] of searchParams.entries()) next[k] = v
              next.view = 'grid'
              setSearchParams(next)
            }}
          >Grid</button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="games-grid list">
          {displayedGames.map((g) => (
            <div key={g.id} className="game-wrapper">
              <GameCard {...g} tags={(g.tags || []).map((t) => tagName(t)).filter(Boolean) as string[]} />
            </div>
          ))}
        </div>
      ) : (
        <div className="games-grid grid">
          {displayedGames.map((g) => (
            <div key={g.id} className="game-wrapper">
              <GameTile id={g.id} name={g.name} cover={g.cover} />
            </div>
          ))}
        </div>
      )}
      {displayedGames.length === 0 && (
        <p className="muted">No se encontraron juegos que coincidan con los filtros seleccionados.</p>
      )}
    </main>
  )
}
