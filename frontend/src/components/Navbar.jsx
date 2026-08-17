import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

  const linkStyle = (path) => ({
    marginLeft: 28,
    textDecoration: 'none',
    color: location.pathname === path ? '#5ee6ff' : 'rgba(255,255,255,0.85)',
    fontWeight: 500,
    fontSize: 15,
    letterSpacing: 0.3,
    paddingBottom: 4,
    borderBottom: location.pathname === path ? '2px solid #5ee6ff' : '2px solid transparent',
    transition: 'all 0.2s ease',
  })

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 40px',
      borderRadius: 0,
      background: 'rgba(5, 20, 38, 0.65)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(120, 220, 255, 0.12)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      boxSizing: 'border-box',
    }}>
      <span style={{
        fontWeight: 700,
        fontSize: 18,
        color: 'white',
        letterSpacing: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ filter: 'drop-shadow(0 0 6px #5ee6ff)' }}>🛡</span>
        CONTENT GUARD
      </span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={linkStyle('/')}>Home</Link>
        <Link to="/about" style={linkStyle('/about')}>About</Link>
        <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>
        <Link to="/history" style={linkStyle('/history')}>History</Link>
      </div>
    </div>
  )
}

export default Navbar
