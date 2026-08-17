import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'

const API_URL = 'http://127.0.0.1:8000'
const PAGE_SIZE = 8

function History() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const load = async () => {
    setLoading(true)
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/logs`),
        fetch(`${API_URL}/statistics`),
      ])
      const logsData = await logsRes.json()
      const statsData = await statsRes.json()
      setLogs(logsData.logs || [])
      setStats(statsData)
      setError(null)
    } catch (err) {
      setError('Unable to load moderation history. Please check the backend services and try again.')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = logs
    .filter((l) => tab === 'all' || l.content_type === tab)
    .filter((l) => !search.trim() || l.content.toLowerCase().includes(search.toLowerCase()) || String(l.id).includes(search))

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #020817, #061426)' }}>
      <Navbar />
      <div style={{ paddingTop: 96, padding: '96px 28px 40px', color: 'white', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>History</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 6, fontSize: 14 }}>
              View and track all content moderation activities and results.
            </p>
          </div>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search content or ID..."
            style={{
              padding: '10px 14px', borderRadius: 10, fontSize: 13,
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,220,255,0.15)',
              color: 'white', minWidth: 240,
            }}
          />
        </div>

        {error && <div style={{ color: '#f87171', marginBottom: 16 }}>{error}</div>}

        {/* Summary cards - only real stats */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          <SummaryCard label="Total Analyzed" value={stats ? stats.total_checks : '...'} color="#5ee6ff" />
          <SummaryCard label="Safe Content" value={stats ? stats.allowed : '...'} color="#4ade80" />
          <SummaryCard label="Flagged Content" value={stats ? stats.blocked : '...'} color="#f87171" />
          <SummaryCard label="Text / Image" value={stats ? `${stats.text_checks} / ${stats.image_checks}` : '...'} color="#5ee6ff" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[['all', 'All Activity'], ['text', 'Text Moderation'], ['image', 'Image Moderation']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => { setTab(val); setPage(1) }}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
                background: tab === val ? 'rgba(94,230,255,0.15)' : 'transparent',
                border: tab === val ? '1px solid rgba(94,230,255,0.3)' : '1px solid transparent',
                color: tab === val ? '#5ee6ff' : 'rgba(255,255,255,0.7)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{
          padding: 20, borderRadius: 16,
          background: 'rgba(5,20,38,0.6)', backdropFilter: 'blur(18px)',
          border: '1px solid rgba(120,220,255,0.12)',
        }}>
          {loading && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Loading moderation history...</div>}
          {!loading && filtered.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              No moderation history yet. Run a text or image moderation check to create your first record.
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 6px' }}>ID</th>
                    <th style={{ padding: '8px 6px' }}>Type</th>
                    <th style={{ padding: '8px 6px' }}>Content Preview</th>
                    <th style={{ padding: '8px 6px' }}>Status</th>
                    <th style={{ padding: '8px 6px' }}>Confidence</th>
                    <th style={{ padding: '8px 6px' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((log) => (
                    <tr key={log.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '10px 6px' }}>#{log.id}</td>
                      <td style={{ padding: '10px 6px' }}>{log.content_type === 'text' ? '📝 Text' : '🖼️ Image'}</td>
                      <td style={{ padding: '10px 6px', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.content}
                      </td>
                      <td style={{ padding: '10px 6px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 12,
                          background: log.verdict === 'ALLOWED' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                          color: log.verdict === 'ALLOWED' ? '#4ade80' : '#f87171',
                        }}>
                          {log.verdict === 'ALLOWED' ? 'Safe' : 'Flagged'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 6px' }}>{(log.confidence * 100).toFixed(1)}%</td>
                      <td style={{ padding: '10px 6px', color: 'rgba(255,255,255,0.5)' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                <div>
                  Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button disabled={page === 1} onClick={() => setPage(page - 1)} style={pageBtn(page === 1)}>‹</button>
                  <span style={{ padding: '4px 10px' }}>{page} / {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={pageBtn(page === totalPages)}>›</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }) {
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

function pageBtn(disabled) {
  return {
    padding: '4px 10px', borderRadius: 6, cursor: disabled ? 'default' : 'pointer',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: disabled ? 'rgba(255,255,255,0.3)' : 'white',
  }
}

export default History
