import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ThemeSelector from '../ThemeToggle/ThemeSelector'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon" aria-hidden="true">★</span>
        Smart Task
      </Link>
      {user ? (
        <div className="nav-links">
          <ThemeSelector />
          <div className="navbar-user">
            <span className="navbar-user-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </span>
            {displayName}
          </div>
        </div>
      ) : (
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </nav>
  )
}
