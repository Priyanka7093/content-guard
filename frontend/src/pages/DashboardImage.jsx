import { useState, useEffect, useRef } from 'react'

const API_URL = 'http://127.0.0.1:8000'

function DashboardImage() {
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [logsError, setLogsError] = useState(null)
  const [logsLoading, setLogsLoading] = useState(true)
  const fileInputRef = useRef(null)

  const loadLogs = async () => {
    setLogsLoading(true)
    try {
      const res = await fetch(`${API_URL}/logs`)
      const data = await res.json()
      const imageLogs = (data.logs || []).filter((l) => l.content_type === 'image')
      setLogs(imageLogs)
      setLogsError(null)
    } catch (err) {
      setLogsError('Unable to load moderation history.')
    }
    setLogsLoading(false)
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const handleFile = (file) => {
    if (!file) return
    setImageFile(file)
    setResult(null)
    setPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const analyzeImage = async () => {
    if (!imageFile) return
    setLoading(true)
    setResult(null)
    const formData = new FormData()
    formData.append('file', imageFile)
    try {
      const res = await fetch(`${API_URL}/moderate/image`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('bad response')
      const data = await res.json()
      setResult(data)
      loadLogs()
    } catch (err) {
      setResult({ error: 'Unable to analyze the image. Please try again.' })
    }
    setLoading(false)
  }

  const isSafe = result && !result.error && result.verdict === 'ALLOWED'

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Image Moderation</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 6, fontSize: 14 }}>
            Upload and analyze images for harmful, inappropriate, or unsafe content.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* LEFT: Upload panel */}
        <div style={{ flex: '1 1 380px' }}>
          <div style={glassPanel}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Upload Image</h3>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current.click()}
              style={{
                border: '2px dashed rgba(120,220,255,0.25)', borderRadius: 12,
                padding: 30, textAlign: 'center', cursor: 'pointer',
              }}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 10, marginBottom: 10 }} />
              ) : (
                <>
                  <div style={{ fontSize: 30 }}>☁</div>
                  <div style={{ marginTop: 6 }}>Drag & drop an image here</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '6px 0' }}>or</div>
                </>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current.click() }}
                style={{ ...analyzeBtn, width: 'auto', padding: '8px 20px', marginTop: 6 }}
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef} type="file" accept="image/*"
                onChange={(e) => handleFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </div>
            {imageFile && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
                {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
              </div>
            )}
            <button onClick={analyzeImage} disabled={loading || !imageFile} style={{ ...analyzeBtn, marginTop: 14, opacity: !imageFile ? 0.5 : 1 }}>
              {loading ? 'Analyzing image...' : 'Analyze Image'}
            </button>
          </div>
        </div>

        {/* RIGHT: Result panel */}
        <div style={{ flex: '1 1 380px' }}>
          <div style={glassPanel}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Analysis Result</h3>

            {!result && (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'rgba(255,255,255,0.5)' }}>
                <div style={{ fontSize: 34 }}>🖼</div>
                <div style={{ fontWeight: 600, marginTop: 8 }}>Ready to Analyze</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Upload an image and click "Analyze Image" to begin.</div>
              </div>
            )}

            {result?.error && <div style={{ color: '#f87171', fontSize: 14 }}>{result.error}</div>}

            {result && !result.error && (
              <>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, color: isSafe ? '#4ade80' : '#f87171' }}>
                  {isSafe ? '✓ SAFE' : '✕ ' + result.verdict}
                </div>

                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600 }}>DETECTED OBJECTS</div>
                <div style={{ marginBottom: 14, fontSize: 13 }}>
                  {result.objects?.length > 0
                    ? result.objects.map((o, i) => <div key={i}>{o.class} — {(o.confidence * 100).toFixed(0)}%</div>)
                    : <span style={{ color: 'rgba(255,255,255,0.5)' }}>No objects detected</span>}
                </div>

                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600 }}>WEAPON DETECTION</div>
                <div style={{ marginBottom: 14, fontSize: 13 }}>
                  {result.weapons?.length > 0
                    ? result.weapons.map((w, i) => <div key={i} style={{ color: '#fb923c' }}>⚠ {w.class} — {(w.confidence * 100).toFixed(0)}%</div>)
                    : <span style={{ color: 'rgba(255,255,255,0.5)' }}>No weapon detected</span>}
                </div>

                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600 }}>SAFETY CLASSIFICATION</div>
                <div style={{ fontSize: 13 }}>
                  {result.nsfw
                    ? (result.nsfw.detected
                        ? <span style={{ color: '#f87171' }}>⚠ NSFW content detected — {(result.nsfw.confidence * 100).toFixed(1)}%</span>
                        : <span style={{ color: '#4ade80' }}>✓ Not detected — {(result.nsfw.confidence * 100).toFixed(1)}% confidence</span>)
                    : <span style={{ color: 'rgba(255,255,255,0.5)' }}>Not available</span>}
                </div>

                {result.reasons?.length > 0 && (
                  <div style={{ marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                    Reasons: {result.reasons.join(', ')}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Image Analyses - REAL data from GET /logs */}
      <div style={{ ...glassPanel, marginTop: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Recent Image Analyses</h3>
        {logsLoading && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Loading recent analyses...</div>}
        {!logsLoading && logsError && <div style={{ color: '#f87171', fontSize: 13 }}>{logsError}</div>}
        {!logsLoading && !logsError && logs.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>No image moderation history yet.</div>
        )}
        {!logsLoading && !logsError && logs.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                <th style={{ padding: '8px 6px' }}>File Name</th>
                <th style={{ padding: '8px 6px' }}>Status</th>
                <th style={{ padding: '8px 6px' }}>Confidence</th>
                <th style={{ padding: '8px 6px' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 8).map((log) => (
                <tr key={log.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '10px 6px', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

const analyzeBtn = {
  width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 600,
  color: 'white', background: 'linear-gradient(90deg, #2563eb, #06b6d4)',
  border: 'none', borderRadius: 10, cursor: 'pointer',
  boxShadow: '0 0 16px rgba(56,189,248,0.4)',
}

export default DashboardImage
