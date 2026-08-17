import { useEffect, useState } from 'react'

const SERVICES = [
  { name: 'API Gateway', url: 'http://127.0.0.1:8000/health' },
  { name: 'Text Moderation', url: 'http://127.0.0.1:8001/health' },
  { name: 'Image Moderation', url: 'http://127.0.0.1:8002/health' },
  { name: 'Decision Service', url: 'http://127.0.0.1:8003/health' },
  { name: 'Logging Service', url: 'http://127.0.0.1:8004/health' },
]

function DashboardHealth() {
  const [results, setResults] = useState([])
  const [checking, setChecking] = useState(true)
  const [lastChecked, setLastChecked] = useState(null)
  const [totalRequests, setTotalRequests] = useState(null)

  const checkHealth = async () => {
    setChecking(true)
    const checks = await Promise.all(
      SERVICES.map(async (svc) => {
        const start = performance.now()
        try {
          const res = await fetch(svc.url)
          const elapsed = Math.round(performance.now() - start)
          if (!res.ok) return { ...svc, status: 'unhealthy', responseTime: elapsed }
          const data = await res.json()
          return { ...svc, status: data.status || 'healthy', responseTime: elapsed, modelLoaded: data.model_loaded }
        } catch (err) {
          const elapsed = Math.round(performance.now() - start)
          return { ...svc, status: 'unreachable', responseTime: elapsed }
        }
      })
    )
    setResults(checks)
    setLastChecked(new Date())
    setChecking(false)

    try {
      const statsRes = await fetch('http://127.0.0.1:8000/statistics')
      const statsData = await statsRes.json()
      setTotalRequests(statsData.total_checks)
    } catch (err) {
      setTotalRequests(null)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const healthyCount = results.filter((r) => r.status === 'healthy').length
  const overall = results.length === 0
    ? { label: 'Checking...', color: '#5ee6ff' }
    : healthyCount === results.length
      ? { label: 'Healthy', sub: 'All systems are running normally', color: '#4ade80' }
      : healthyCount === 0
        ? { label: 'Unavailable', sub: 'Critical moderation services are unavailable', color: '#f87171' }
        : { label: 'Degraded', sub: 'One or more services require attention', color: '#fb923c' }

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>System Health</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 6, fontSize: 14 }}>
            Real-time monitoring of moderation services and infrastructure.
          </p>
        </div>
        <div style={{
          padding: '12px 18px', borderRadius: 14,
          background: `${overall.color}15`, border: `1px solid ${overall.color}40`,
          textAlign: 'right', minWidth: 220,
        }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Overall System Status</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: overall.color }}>● {overall.label}</div>
          {overall.sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{overall.sub}</div>}
        </div>
      </div>

      {/* Metric row - only real values */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <MetricCard label="Services Online" value={`${healthyCount} / ${SERVICES.length}`} color="#5ee6ff" />
        <MetricCard label="Total Requests" value={totalRequests !== null ? totalRequests : '...'} color="#5ee6ff" />
        <MetricCard
          label="Avg Response Time"
          value={results.length > 0 ? `${Math.round(results.reduce((a, r) => a + r.responseTime, 0) / results.length)}ms` : '...'}
          color="#5ee6ff"
        />
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Service Health table */}
        <div style={{ ...glassPanel, flex: '2 1 480px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Service Health</h3>
            <button onClick={checkHealth} disabled={checking} style={refreshBtn}>
              {checking ? 'Checking...' : '↻ Refresh'}
            </button>
          </div>
          {checking && results.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Checking system health...</div>
          )}
          {results.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 6px' }}>Service</th>
                  <th style={{ padding: '8px 6px' }}>Status</th>
                  <th style={{ padding: '8px 6px' }}>Response Time</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const color = r.status === 'healthy' ? '#4ade80' : r.status === 'unreachable' ? '#f87171' : '#fb923c'
                  return (
                    <tr key={r.name} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '10px 6px' }}>{r.name}</td>
                      <td style={{ padding: '10px 6px', color }}>
                        ● {r.status === 'healthy' ? 'Healthy' : r.status === 'unreachable' ? 'Unreachable' : r.status}
                      </td>
                      <td style={{ padding: '10px 6px', color: 'rgba(255,255,255,0.6)' }}>{r.responseTime}ms</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {lastChecked && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>
              Last updated: {lastChecked.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* System Map */}
        <div style={{ ...glassPanel, flex: '1 1 300px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>System Map</h3>
          {['API Gateway', 'Text Moderation', 'Image Moderation', 'Decision Service', 'Logging Service'].map((name) => {
            const svc = results.find((r) => r.name === name)
            const color = !svc ? '#5ee6ff' : svc.status === 'healthy' ? '#4ade80' : '#f87171'
            return (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <div style={{ fontSize: 13 }}>{name}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Honest unavailable sections */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 20 }}>
        <div style={{ ...glassPanel, flex: '1 1 300px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>Resource Utilization</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            CPU, memory, and GPU metrics are not currently exposed by the backend.
          </p>
        </div>
        <div style={{ ...glassPanel, flex: '1 1 300px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>Alerts & Notifications</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            No system alerts API is available yet.
          </p>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }) {
  return (
    <div style={{
      flex: 1, minWidth: 160, padding: 16, borderRadius: 14,
      background: 'rgba(5,20,38,0.6)', backdropFilter: 'blur(18px)',
      border: `1px solid ${color}33`,
    }}>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  )
}

const glassPanel = {
  padding: 20, borderRadius: 16,
  background: 'rgba(5,20,38,0.6)', backdropFilter: 'blur(18px)',
  border: '1px solid rgba(120,220,255,0.12)',
}

const refreshBtn = {
  padding: '6px 14px', fontSize: 12, borderRadius: 8, cursor: 'pointer',
  background: 'rgba(94,230,255,0.1)', border: '1px solid rgba(94,230,255,0.3)', color: '#5ee6ff',
}

export default DashboardHealth
