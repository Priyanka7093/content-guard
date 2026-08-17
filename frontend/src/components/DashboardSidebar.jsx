import { NavLink } from 'react-router-dom'

const sidebarSections = [
  {
    heading: 'OVERVIEW',
    items: [{ label: 'Overview', icon: '▦', path: '/dashboard' }],
  },
  {
    heading: 'MODERATION',
    items: [
      { label: 'Text Moderation', icon: '💬', path: '/dashboard/text' },
      { label: 'Image Moderation', icon: '▧', path: '/dashboard/image' },
    ],
  },
  {
    heading: 'ANALYTICS',
    items: [
      { label: 'Model Insights', icon: '◉', path: '/dashboard/models' },
    ],
  },
  {
    heading: 'SYSTEM',
    items: [{ label: 'System Health', icon: '⚙', path: '/dashboard/health' }],
  },
]

function DashboardSidebar() {
  return (
    <div style={{
      width: 230,
      minHeight: '100vh',
      background: 'rgba(5, 20, 38, 0.6)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(120,220,255,0.1)',
      padding: '20px 16px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: 'white',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div>
        {sidebarSections.map((section) => (
          <div key={section.heading} style={{ marginBottom: 22 }}>
            <div style={{
              fontSize: 11,
              letterSpacing: 1,
              color: 'rgba(255,255,255,0.4)',
              marginBottom: 8,
              paddingLeft: 8,
            }}>
              {section.heading}
            </div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  marginBottom: 4,
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontSize: 14,
                  color: isActive ? '#5ee6ff' : 'rgba(255,255,255,0.8)',
                  background: isActive ? 'linear-gradient(90deg, rgba(56,189,248,0.15), rgba(56,189,248,0.05))' : 'transparent',
                  border: isActive ? '1px solid rgba(94,230,255,0.3)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 12px rgba(56,189,248,0.2)' : 'none',
                })}
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div style={{
        padding: 14,
        borderRadius: 12,
        background: 'rgba(10,30,55,0.6)',
        border: '1px solid rgba(120,220,255,0.15)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>🛡 System Status</div>
        <div style={{ fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
          All systems operational
        </div>
      </div>
    </div>
  )
}

export default DashboardSidebar
