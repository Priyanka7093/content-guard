import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const API_URL = 'http://127.0.0.1:8000'

const MODELS = [
  {
    name: 'Toxic-BERT',
    type: 'Transformer (Text Classification)',
    purpose: 'Text toxicity detection',
    source: 'Hugging Face — unitary/toxic-bert',
  },
  {
    name: 'YOLOv8 (base)',
    type: 'Object Detection',
    purpose: 'General object detection',
    source: 'Pretrained on COCO dataset',
  },
  {
    name: 'Custom Weapons Detector',
    type: 'Object Detection (fine-tuned YOLOv8)',
    purpose: 'Weapon detection',
    classes: 'Handgun, Knife, Missile, Rifle, Shotgun, Sword, Tank',
    dataset: '671 images (Roboflow)'
  },
  {
    name: 'NSFW Image Classifier',
    type: 'Image Classification',
    purpose: 'NSFW / inappropriate content detection',
    source: 'Hugging Face — Falconsai/nsfw_image_detection',
  },
]

function DashboardModelInsights() {
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [error, setError] = useState(null)
  const [logsLoading, setLogsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          fetch(`${API_URL}/statistics`),
          fetch(`${API_URL}/logs`),
        ])
        const statsData = await statsRes.json()
        const logsData = await logsRes.json()
        setStats(statsData)
        setLogs((logsData.logs || []).filter((l) => l.content_type === 'image'))
      } catch (err) {
        setError('Unable to load model insights. Please check the moderation services and try again.')
      }
      setLogsLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: 'white' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>Model Insights</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 6, fontSize: 14 }}>
          Deep insights into moderation model performance, behavior, and learning patterns.
        </p>
      </div>

      {error && <div style={{ color: '#f87171', fontSize: 14, marginBottom: 16 }}>{error}</div>}

      {/* Real stats row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <MetricCard label="Total Inferences" value={stats ? stats.total_checks : '...'} color="#5ee6ff" />
        <MetricCard label="Safe Content" value={stats ? stats.allowed : '...'} color="#4ade80" />
        <MetricCard label="Flagged Content" value={stats ? stats.blocked : '...'} color="#fb923c" />
        <MetricCard label="Text / Image Checks" value={stats ? `${stats.text_checks} / ${stats.image_checks}` : '...'} color="#5ee6ff" />
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        {/* Model Information */}
        <div style={{ ...glassPanel, flex: '1 1 480px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Model Information</h3>
          {MODELS.map((m) => (
            <div key={m.name} style={{
              padding: 14, borderRadius: 10, marginBottom: 10,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{m.type}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Purpose: {m.purpose}</div>
              {m.classes && <div style={{ fontSize: 13, marginTop: 2 }}>Classes: {m.classes}</div>}
              {m.dataset && <div style={{ fontSize: 13, marginTop: 2 }}>Dataset: {m.dataset}</div>}
              {m.training && <div style={{ fontSize: 13, marginTop: 2 }}>Training: {m.training}</div>}
              {m.metric && <div style={{ fontSize: 13, marginTop: 2, color: '#5ee6ff' }}>{m.metric}</div>}
              {m.source && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{m.source}</div>}
            </div>
          ))}
        </div>

        {/* Prediction Distribution - real */}
        <div style={{ ...glassPanel, flex: '1 1 280px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Prediction Distribution</h3>
          {!stats && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Loading distribution data...</div>}
          {stats && stats.total_checks === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>No distribution data available.</div>
          )}
          {stats && stats.total_checks > 0 && (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Allowed', value: stats.allowed, color: '#4ade80' },
                      { name: 'Blocked', value: stats.blocked, color: '#f87171' },
                    ]}
                    dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={3}
                  >
                    <Cell fill="#4ade80" />
                    <Cell fill="#f87171" />
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0a1e37', border: '1px solid rgba(120,220,255,0.2)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                Total: {stats.total_checks}
              </div>
            </>
          )}
        </div>
      </div>
      

      {/* Recent Predictions - real, image only */}
      <div style={glassPanel}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Recent Predictions</h3>
        {logsLoading && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Loading recent predictions...</div>}
        {!logsLoading && logs.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>No image predictions yet. Run an image moderation check to generate insights.</div>
        )}
        {!logsLoading && logs.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                <th style={{ padding: '8px 6px' }}>File</th>
                <th style={{ padding: '8px 6px' }}>Status</th>
                <th style={{ padding: '8px 6px' }}>Confidence</th>
                <th style={{ padding: '8px 6px' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 6).map((log) => (
                <tr key={log.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '10px 6px' }}>{log.content}</td>
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

function MetricCard({ label, value, color }) {
  return (
    <div style={{
      flex: 1, minWidth: 150, padding: 16, borderRadius: 14,
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

export default DashboardModelInsights
