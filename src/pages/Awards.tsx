import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import './Awards.css'
import AwardTile from '../components/AwardTile'
import AwardCard from '../components/AwardCard'

interface Award { id: string; name: string; description?: string; nominees: string[]; cover?: string; icon?: string; trophy?: string }
interface Game { id: string; name: string }

export default function Awards() {
  const [awards, setAwards] = useState<Award[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'none' | 'alpha-asc' | 'alpha-desc'>('alpha-asc')
  const [searchParams, setSearchParams] = useSearchParams()
  type View = 'list' | 'grid'
  const param = (searchParams.get('view') as View) || undefined
  const stored = typeof window !== 'undefined' ? (localStorage.getItem('mjda.awards.view') as View | null) : null
  const view = (param ?? stored ?? 'list') as View

  useEffect(() => {
    fetch('/data/awards.json').then(r => r.json()).then(setAwards)
    fetch('/data/games.json').then(r => r.json()).then(setGames)
  }, [])

  // helper
  const arraysEqual = (a: string[], b: string[]) => {
    if (a === b) return true
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
    return true
  }

  // initialize filters from URL params; update state only when values differ
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const sortParam = (searchParams.get('sort') as 'none' | 'alpha-asc' | 'alpha-desc' | null) || 'alpha-asc'
    if (q !== query) setQuery(q)
    if (sortParam !== sort) setSort(sortParam)
  }, [searchParams, query, sort])

  const findGame = (id: string) => games.find(g => g.id === id)

  // When filter/sort change update URL so the page is bookmarkable
  useEffect(() => {
    const params: Record<string, string> = {}
    if (query) params.q = query
    if (sort && sort !== 'none') params.sort = sort
    const currentViewParam = view
    if (currentViewParam) params.view = currentViewParam
    const currentParams: Record<string, string> = {}
    for (const [k, v] of searchParams.entries()) currentParams[k] = v
    const same = Object.keys(params).length === Object.keys(currentParams).length && Object.keys(params).every(k => currentParams[k] === params[k])
    if (!same) {
      if (Object.keys(params).length) setSearchParams(params)
      else setSearchParams({})
    }
  }, [query, sort, setSearchParams, view, searchParams])

  const displayedAwards = useMemo(() => {
    const ql = query.trim().toLowerCase()
    let result = (awards || []).filter(a => {
      const name = a.name?.toLowerCase() || ''
      const description = a.description?.toLowerCase() || ''
      return !ql || name.includes(ql) || description.includes(ql)
    })
    if (sort === 'alpha-asc') result = result.slice().sort((a,b) => a.name.localeCompare(b.name))
    else if (sort === 'alpha-desc') result = result.slice().sort((a,b) => b.name.localeCompare(a.name))
    return result
  }, [awards, query, sort])

  return (
    <main>
      <h1>Premios</h1>
      <p className="muted">Listado de categorías de premios — cambie entre vista en lista y grid.</p>
      <div className="awards-controls">
        <div className="search-sort-row">
          <input aria-label="Buscar premios" className="search-input" value={query} placeholder="Buscar premios..." onChange={(e) => setQuery(e.target.value)} />
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value as 'none' | 'alpha-asc' | 'alpha-desc')}>
            <option value="alpha-asc">Alfabético (A → Z)</option>
            <option value="alpha-desc">Alfabético (Z → A)</option>
          </select>
          <button className="clear-filters" onClick={() => { setQuery(''); setSort('alpha-asc'); setSearchParams({}); }}>Limpiar</button>
        </div>
        <div className="view-toggle">
          <button className={`toggle ${view === 'list' ? 'active' : ''}`} onClick={() => { const next: Record<string, string> = {}; for (const [k, v] of searchParams.entries()) next[k] = v; next.view = 'list'; setSearchParams(next); try { localStorage.setItem('mjda.awards.view', 'list') } catch (err) { void err } }}>Lista</button>
          <button className={`toggle ${view === 'grid' ? 'active' : ''}`} onClick={() => { const next: Record<string, string> = {}; for (const [k, v] of searchParams.entries()) next[k] = v; next.view = 'grid'; setSearchParams(next); try { localStorage.setItem('mjda.awards.view', 'grid') } catch (err) { void err } }}>Grid</button>
        </div>
      </div>
      {view === 'grid' ? (
        <div className="awards-grid grid">
          {displayedAwards.map(a => (
            <div key={a.id} className="game-wrapper">
              <AwardTile id={a.id} name={a.name} cover={a.cover} icon={a.icon} />
            </div>
          ))}
        </div>
      ) : (
        <div className="awards-grid list">
          {displayedAwards.map(a => (
            <div key={a.id} className="award-wrapper">
              <AwardCard id={a.id} name={a.name} cover={a.cover} description={a.description} icon={a.icon} trophy={a.trophy} nominees={(a.nominees || []).map(n => ({ id: n, name: findGame(n)?.name }))} />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
