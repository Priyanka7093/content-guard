function About() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundImage: 'linear-gradient(180deg, rgba(2,8,23,0.7), rgba(2,8,23,0.85)), url(/images/background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: 'white',
      paddingTop: 100,
      paddingBottom: 60,
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 30px' }}>

        {/* HERO */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 40, flexWrap: 'wrap', marginBottom: 40,
        }}>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ color: '#5ee6ff', fontSize: 12, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>
              ABOUT CONTENT GUARD
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              AI-Powered Content<br />Moderation Platform
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginTop: 16, maxWidth: 480 }}>
              Content Guard uses advanced AI models to detect, analyze, and moderate text and image
              content in real-time, helping platforms build safer and healthier digital communities.
            </p>

            <div style={{ display: 'flex', gap: 24, marginTop: 26, flexWrap: 'wrap' }}>
              <Stat icon="🛡" value="99.2%" label="Detection Accuracy" color="#5ee6ff" />
              <Stat icon="⚡" value="10M+" label="Content Analyzed" color="#4ade80" />
              <Stat icon="👥" value="500+" label="Active Platforms" color="#a78bfa" />
            </div>
          </div>

          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 220, height: 220, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56,189,248,0.18), transparent 70%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 60px rgba(56,189,248,0.25)',
            }}>
              <div style={{
                width: 130, height: 150, position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 90, filter: 'drop-shadow(0 0 20px #5ee6ff)',
              }}>
                🛡️
              </div>
            </div>
          </div>
        </div>

        {/* MISSION / VISION / VALUES */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
          <Panel>
            <PanelIcon color="#5ee6ff">◎</PanelIcon>
            <h3 style={{ margin: '10px 0 6px', fontSize: 16 }}>Our Mission</h3>
            <p style={pText}>
              To create a safer digital world by providing intelligent, real-time content moderation
              that scales with your platform.
            </p>
          </Panel>
          <Panel>
            <PanelIcon color="#4ade80">👁</PanelIcon>
            <h3 style={{ margin: '10px 0 6px', fontSize: 16 }}>Our Vision</h3>
            <p style={pText}>
              To be the global standard for AI-powered content safety, empowering platforms to build
              trust and protect communities online.
            </p>
          </Panel>
          <Panel>
            <PanelIcon color="#a78bfa">♡</PanelIcon>
            <h3 style={{ margin: '10px 0 6px', fontSize: 16 }}>Our Values</h3>
            <ul style={{ ...pText, margin: 0, paddingLeft: 18 }}>
              <li>Integrity in every decision</li>
              <li>Privacy and security first</li>
              <li>Continuous innovation</li>
              <li>Responsible AI for a better world</li>
            </ul>
          </Panel>
        </div>

        {/* WHY CHOOSE */}
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Why Choose Content Guard?</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
          <Feature icon="🌐" color="#5ee6ff" title="Advanced AI Models" desc="State-of-the-art NLP and Computer Vision models for accurate detection." />
          <Feature icon="⏱" color="#4ade80" title="Real-time Analysis" desc="Lightning-fast processing for text and images in real-time." />
          <Feature icon="📊" color="#a78bfa" title="Scalable & Reliable" desc="Built to scale with high availability and enterprise-grade reliability." />
          <Feature icon="🔒" color="#5ee6ff" title="Privacy Focused" desc="Your data is secure with strict privacy controls and compliance." />
          <Feature icon="</>" color="#4ade80" title="Easy Integration" desc="Simple APIs and SDKs to integrate content moderation anywhere." />
        </div>

        {/* CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 24, borderRadius: 16, flexWrap: 'wrap', gap: 16,
          background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(94,230,255,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Let's build a safer digital world together</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                Join hundreds of platforms that trust Content Guard for content safety.
              </div>
            </div>
          </div>
          <a href="/dashboard" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 24px', fontSize: 14, fontWeight: 600, color: 'white',
              background: 'linear-gradient(90deg, #2563eb, #06b6d4)', border: 'none',
              borderRadius: 10, cursor: 'pointer', boxShadow: '0 0 16px rgba(56,189,248,0.4)',
            }}>
              Get Started Now →
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, value, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 18, color }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{label}</div>
      </div>
    </div>
  )
}

function Panel({ children }) {
  return (
    <div style={{
      flex: '1 1 260px', padding: 20, borderRadius: 16,
      background: 'rgba(5,20,38,0.6)', backdropFilter: 'blur(18px)',
      border: '1px solid rgba(120,220,255,0.12)',
    }}>
      {children}
    </div>
  )
}

function PanelIcon({ color, children }) {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 16, background: `${color}22`, color,
    }}>
      {children}
    </div>
  )
}

function Feature({ icon, color, title, desc }) {
  return (
    <div style={{
      flex: '1 1 180px', padding: 18, borderRadius: 14,
      background: 'rgba(5,20,38,0.5)', backdropFilter: 'blur(14px)',
      border: '1px solid rgba(120,220,255,0.1)',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 14, background: `${color}22`, color, marginBottom: 10,
      }}>
        {icon}
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{desc}</div>
    </div>
  )
}

const pText = { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }

export default About
