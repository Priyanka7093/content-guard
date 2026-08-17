import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import StatCard from '../components/StatCard'

const API_URL = 'http://127.0.0.1:8000'

function DashboardOverview() {
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          fetch(`${API_URL}/statistics`),
          fetch(`${API_URL}/logs`),
        ])
        const statsData = await statsRes.json()
        const logsData = await logsRes.json()
        setStats(statsData)
        setLogs(logsData.logs || [])
      } catch (err) {
        setError('Could not reach the API Gateway. Is it running on port 8000?')
      }
    }
    fetchData()
  }, [])

  if (error) {
    return <div style={{ color: '#f87171', padding: 20 }}>{error}</div>
  }

  if (!stats) {
    return <div style={{ color: 'white', padding: 20 }}>Loading dashboard...</div>
  }

  const pieData = [
    { name: 'Allowed', value: stats.allowed, color: '#4ade80' },
    { name: 'Blocked', value: stats.blocked, color: '#f87171' },
  ]

  // Build a simple activity dataset from the logs (grouped loosely by recency)
  const activityData = buildActivityData(logs)

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Dashboard Overview</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            Real-time content moderation insights and analytics
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 20,
          background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
          fontSize: 13, color: '#4ade80',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
          Live Monitoring
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Total Analyzed" value={stats.total_checks} icon="📊" color="#5ee6ff" />
        <StatCard label="Safe Content" value={stats.allowed} icon="🛡" color="#4ade80" />
        <StatCard label="Flagged Content" value={stats.blocked} icon="⚠" color="#fb923c" />
        <StatCard
          label="Text vs Image"
          value={`${stats.text_checks} / ${stats.image_checks}`}
          icon="◉"
          color="#5ee6ff"
          sublabel="text / image checks"
        />
      </div>

      {/* Charts */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{
          flex: '2 1 400px', padding: 20, borderRadius: 16,
          background: 'rgba(5,20,38,0.6)', backdropFilter: 'blur(18px)',
          border: '1px solid rgba(120,220,255,0.12)',
        }}>
          <h3 style={{ marginTop: 0, fontSize: 16 }}>Moderation Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip contentStyle={{ background: '#0a1e37', border: '1px solid rgba(120,220,255,0.2)' }} />
              <Line type="monotone" dataKey="checks" stroke="#5ee6ff" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          flex: '1 1 260px', padding: 20, borderRadius: 16,
          background: 'rgba(5,20,38,0.6)', backdropFilter: 'blur(18px)',
          border: '1px solid rgba(120,220,255,0.12)',
        }}>
          <h3 style={{ marginTop: 0, fontSize: 16 }}>Content Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={3}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0a1e37', border: '1px solid rgba(120,220,255,0.2)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 12 }}>
            <span style={{ color: '#4ade80' }}>● Allowed {stats.allowed}</span>
            <span style={{ color: '#f87171' }}>● Blocked {stats.blocked}</span>
          </div>
        </div>
      </div>

      {/* Recent Moderation Table */}
      <div style={{
        padding: 20, borderRadius: 16,
        background: 'rgba(5,20,38,0.6)', backdropFilter: 'blur(18px)',
        border: '1px solid rgba(120,220,255,0.12)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Recent Moderation</h3>
          <Link to="/history" style={{ color: '#5ee6ff', fontSize: 13, textDecoration: 'none' }}>View All →</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
              <th style={{ padding: '8px 6px' }}>Type</th>
              <th style={{ padding: '8px 6px' }}>Content</th>
              <th style={{ padding: '8px 6px' }}>Status</th>
              <th style={{ padding: '8px 6px' }}>Confidence</th>
              <th style={{ padding: '8px 6px' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 6).map((log) => (
              <tr key={log.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: '10px 6px' }}>{log.content_type === 'text' ? '📝' : '🖼️'} {log.content_type}</td>
                <td style={{ padding: '10px 6px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.content}
                </td>
                <td style={{ padding: '10px 6px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12,
                    background: log.verdict === 'ALLOWED' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                    color: log.verdict === 'ALLOWED' ? '#4ade80' : '#f87171',
                  }}>
                    {log.verdict === 'ALLOWED' ? '🟢 Safe' : '🔴 Flagged'}
                  </span>
                </td>
                <td style={{ padding: '10px 6px' }}>{(log.confidence * 100).toFixed(1)}%</td>
                <td style={{ padding: '10px 6px', color: 'rgba(255,255,255,0.5)' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Groups logs into a simple activity series (most recent first, reversed for chart order)
function buildActivityData(logs) {
  const recent = [...logs].reverse().slice(-10)
  return recent.map((log, i) => ({
    label: `#${i + 1}`,
    checks: 1,
  }))
}

export default DashboardOverview
