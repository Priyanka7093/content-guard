import { useState, useEffect } from 'react'

const API_URL = 'http://127.0.0.1:8000'

const SAMPLE_EXAMPLES = [
  "You are amazing and did a great job!",
  "I hate you so much, you are useless.",
  "This is the worst thing ever.",
  "I will hurt you if you do that.",
]

function DashboardText() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [logsError, setLogsError] = useState(null)

  const loadLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/logs`)
      const data = await res.json()
      const textLogs = (data.logs || []).filter((l) => l.content_type === 'text')
      setLogs(textLogs)
      setLogsError(null)
    } catch (err) {
      setLogsError('Unable to load moderation history.')
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const analyzeText = async () => {
    if (!text.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${API_URL}/moderate/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('bad response')
      const data = await res.json()
      setResult(data)
      loadLogs() // refresh recent analyses with the real new record
    } catch (err) {
      setResult({ error: 'Unable to analyze the text. Please check the moderation service and try again.' })
    }
    setLoading(false)
  }

  const isSafe = result && !result.error && result.verdict === 'ALLOWED'
  const isBlocked = result && !result.error && result.verdict === 'BLOCKED'

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Text Moderation</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 6, fontSize: 14 }}>
            Analyze and detect harmful, toxic, or inappropriate text content in real-time.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* LEFT: Analyze panel + samples */}
        <div style={{ flex: '1 1 380px' }}>
          <div style={glassPanel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>✎ Analyze Text</h3>
              <button onClick={() => { setText(''); setResult(null) }} style={clearBtn}>Clear 🗑</button>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '4px 0 10px' }}>Enter or paste text to analyze</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              rows={6}
              maxLength={5000}
              style={textareaStyle}
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              {text.length}/5000
            </div>
            <button onClick={analyzeText} disabled={loading || !text.trim()} style={analyzeBtn}>
              {loading ? 'Analyzing content...' : '✧ Analyze Text'}
            </button>
          </div>

          <div style={{ ...glassPanel, marginTop: 16 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 15 }}>📍 Sample Examples</h3>
            {SAMPLE_EXAMPLES.map((sample, i) => (
              <div
                key={i}
                onClick={() => setText(sample)}
                style={{
                  padding: '10px 12px', fontSize: 13, color: 'rgba(255,255,255,0.8)',
                  borderRadius: 8, cursor: 'pointer', marginBottom: 6,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                "{sample}"
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Result panel */}
        <div style={{ flex: '1 1 380px' }}>
          <div style={glassPanel}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>📈 Analysis Result</h3>

            {!result && (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'rgba(255,255,255,0.5)' }}>
                <div style={{ fontSize: 34 }}>🛡</div>
                <div style={{ fontWeight: 600, marginTop: 8 }}>Ready to Analyze</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  Enter text and click "Analyze Text" to begin moderation.
                </div>
              </div>
            )}

            {result?.error && (
              <div style={{ color: '#f87171', fontSize: 14 }}>{result.error}</div>
            )}

            {result && !result.error && (
              <>
                <div style={{
                  fontSize: 20, fontWeight: 700, marginBottom: 16,
                  color: isSafe ? '#4ade80' : '#f87171',
                }}>
                  {isSafe ? '✓ SAFE' : '✕ ' + result.verdict}
                </div>

                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Confidence</div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{
                    width: `${(result.confidence * 100).toFixed(1)}%`, height: '100%',
                    background: isSafe ? '#4ade80' : '#f87171',
                  }} />
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>
                  {(result.confidence * 100).toFixed(1)}%
                </div>

                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Reasons</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                  {result.reasons?.length > 0 ? result.reasons.join(', ') : 'No issues detected'}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Text Analyses - REAL data from GET /logs */}
      <div style={{ ...glassPanel, marginTop: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Recent Text Analyses</h3>
        {logsError && <div style={{ color: '#f87171', fontSize: 13 }}>{logsError}</div>}
        {!logsError && logs.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>No text moderation history yet.</div>
        )}
        {!logsError && logs.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                <th style={{ padding: '8px 6px' }}>Content</th>
                <th style={{ padding: '8px 6px' }}>Status</th>
                <th style={{ padding: '8px 6px' }}>Confidence</th>
                <th style={{ padding: '8px 6px' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 8).map((log) => (
                <tr key={log.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '10px 6px', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const glassPanel = {
  padding: 20, borderRadius: 16,
  background: 'rgba(5,20,38,0.6)', backdropFilter: 'blur(18px)',
  border: '1px solid rgba(120,220,255,0.12)',
}

const textareaStyle = {
  width: '100%', padding: 12, fontSize: 14, borderRadius: 10,
  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,220,255,0.15)',
  color: 'white', boxSizing: 'border-box', resize: 'vertical',
}

const analyzeBtn = {
  marginTop: 12, width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 600,
  color: 'white', background: 'linear-gradient(90deg, #2563eb, #06b6d4)',
  border: 'none', borderRadius: 10, cursor: 'pointer',
  boxShadow: '0 0 16px rgba(56,189,248,0.4)',
}

const clearBtn = {
  background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
  fontSize: 12, cursor: 'pointer',
}

export default DashboardText
