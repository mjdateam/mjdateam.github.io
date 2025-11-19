import { useEffect, useState, useMemo, useReducer } from 'react'
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
  type Action =
    | { type: 'setAll'; payload: Filters }
    | { type: 'setQuery'; payload: string }
    | { type: 'setTags'; payload: string[] }
    | { type: 'toggleTag'; payload: string }
    | { type: 'setSort'; payload: Filters['sort'] }
    | { type: 'clear' }
  const filtersReducer = (state: Filters, action: Action) => {
    switch (action.type) {
      case 'setAll':
        return action.payload as Filters
      case 'setQuery':
        return { ...state, query: action.payload }
      case 'setTags':
        return { ...state, tags: action.payload }
      case 'toggleTag':
        return { ...state, tags: state.tags.includes(action.payload) ? state.tags.filter(x => x !== action.payload) : [...state.tags, action.payload] }
      case 'setSort':
        return { ...state, sort: action.payload }
      case 'clear':
        return { query: '', tags: [], sort: 'alpha-asc' as const }
      default:
        return state
    }
  }
  const [filters, dispatch] = useReducer(filtersReducer, { query: '', tags: [], sort: 'alpha-asc' } as Filters)
  const [searchParams, setSearchParams] = useSearchParams()
  type View = 'list' | 'grid'
  // prefer URL param, fallback to localStorage, default to 'list'
  const param = (searchParams.get('view') as View) || undefined
  const stored = typeof window !== 'undefined' ? (localStorage.getItem('mjda.view') as View | null) : null
  const view = (param ?? stored ?? 'list') as View

  useEffect(() => {
    fetch('/data/games.json')
      .then((r) => r.json())
      .then(setGames)
    fetch('/data/tags.json')
      .then((r) => r.json())
      .then(setTags)
  }, [])

  // initialize filters from URL params
  // helper to compare arrays shallowly
  // initialize filters from URL params; only when they differ from current state so we don't overwrite
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const tagParam = searchParams.get('tags') || ''
    const tagsArr = tagParam ? tagParam.split(',').filter(Boolean) : []
    const sortParam = (searchParams.get('sort') as 'none' | 'alpha-asc' | 'alpha-desc' | null) || 'alpha-asc'
    dispatch({ type: 'setAll', payload: { query: q, tags: tagsArr, sort: sortParam } })
  }, [searchParams])

  // store current view into localStorage whenever search param is not set (i.e. button clicks)

  const tagName = (id?: string) => tags.find((t) => t.id === id)?.name || id

  // When filter/sort changes update URL to allow bookmarking
  useEffect(() => {
    const params: Record<string, string> = {}
    if (filters.query) params.q = filters.query
    if (filters.tags.length) params.tags = filters.tags.join(',')
    if (filters.sort && filters.sort !== 'none') params.sort = filters.sort
    const currentViewParam = view
    if (currentViewParam) params.view = currentViewParam
    // compare currently applied searchParams to avoid issuing an update and causing cycles
    const currentParams: Record<string, string> = {}
    for (const [k, v] of searchParams.entries()) currentParams[k] = v
    const same = Object.keys(params).length === Object.keys(currentParams).length && Object.keys(params).every(k => currentParams[k] === params[k])
    if (!same) {
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
          <input aria-label="Buscar juegos" className="search-input" value={filters.query} placeholder="Buscar juegos..." onChange={(e) => dispatch({ type: 'setQuery', payload: e.target.value })} />
          <select className="sort-select" value={filters.sort} onChange={(e) => dispatch({ type: 'setSort', payload: e.target.value as 'none' | 'alpha-asc' | 'alpha-desc' })}>
            <option value="alpha-asc">Alfabético (A → Z)</option>
            <option value="alpha-desc">Alfabético (Z → A)</option>
          </select>
          <button className="clear-filters" onClick={() => { dispatch({ type: 'clear' }); setSearchParams({}); }}>Limpiar</button>
        </div>
        <div className="tags-filter">
          {tags.map((t) => (
            <button key={t.id} aria-pressed={filters.tags.includes(t.id)} className={`tag-filter ${filters.tags.includes(t.id) ? 'active' : ''}`} onClick={() => {
              dispatch({ type: 'toggleTag', payload: t.id })
            }}>{t.name}</button>
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
              try { localStorage.setItem('mjda.view', 'list') } catch (err) { void err }
            }}
          >Lista</button>
          <button
            className={`toggle ${view === 'grid' ? 'active' : ''}`}
            onClick={() => {
              const next: Record<string, string> = {}
              for (const [k, v] of searchParams.entries()) next[k] = v
              next.view = 'grid'
              setSearchParams(next)
              try { localStorage.setItem('mjda.view', 'grid') } catch (err) { void err }
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
