import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'M3 13h4v-2H3v2zm0 4h4v-2H3v2zm6-4h12v-2H9v2zm0 4h12v-2H9v2zm0-8h12V7H9v2zm-6 0h4V7H3v2z' },
  { to: '/projects', label: 'Projects', icon: 'M4 4h16v4H4V4zm0 6h7v10H4V10zm9 0h7v10h-7V10z' },
  { to: '/sprint-planning', label: 'Sprint Planning', icon: 'M4 5h16v2H4V5zm0 4h10v2H4V9zm0 4h16v2H4v-2zm0 4h10v2H4v-2z' },
  { to: '/task-estimation', label: 'Task Estimation', icon: 'M5 13l4 4L19 7l-2-2-8 8-3-3-2 2z' },
  { to: '/tasks', label: 'Task Management', icon: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 3v2h10V6H7zm0 4v2h6v-2H7zm0 4v2h10v-2H7z' },
  { to: '/risks', label: 'Risk Analysis', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' },
  { to: '/workload', label: 'Workload Distribution', icon: 'M4 17h16v2H4v-2zm3-7h3v7H7v-7zm5-5h3v12h-3V5zm5 9h3v3h-3v-3z' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <aside className="sidebar">
      <ul>
        {navItems.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="sidebar-link">
              <span className="sidebar-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={item.icon} />
                </svg>
              </span>
              {item.label}
            </Link>
          </li>
        ))}
        <li className="sidebar-signout-row">
          <button type="button" onClick={handleSignOut} className="sidebar-logout-button">
            <span aria-hidden="true">🚪</span>
            Sign Out
          </button>
          <span className="sidebar-user-name">Signed in as {displayName}</span>
        </li>
      </ul>
    </aside>
  )
}
