import { NavLink, Link } from 'react-router-dom'
import './NavBar.css'

export default function NavBar() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="brand">
          <Link to="/" className="brand-link">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="5" fill="#1b2b3a" stroke="#3aa0ff" strokeWidth="0.5" />
              <path d="M6 15c1.5-3 6-6 12-3" stroke="#3aa0ff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="brand-text">
              <span className="brand-title">MJDA</span>
              <span className="brand-subtitle">Melhores Jogos Do Ano</span>
            </div>
          </Link>
        </div>
        <nav className="nav-links">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/games">Todos los Juegos</NavLink>
          <NavLink to="/awards">Premios</NavLink>
        </nav>
      </div>
    </header>
  )
}
