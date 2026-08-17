import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home-hero">
      <div className="home-content">
        {/* LEFT SIDE */}
        <div className="home-left">
          <h1 className="home-title">
            CONTENT<br />
            <span className="home-title-accent">GUARD</span>
          </h1>
          <p className="home-subtitle">AI-Powered Content Moderation</p>
          <p className="home-tagline">Smarter protection for your digital space.</p>

          <Link to="/dashboard">
            <button className="home-cta">Get Started →</button>
          </Link>

          <div className="home-indicators">
            <div className="home-indicator">🛡 Safety</div>
            <div className="home-indicator">◉ AI Detection</div>
            <div className="home-indicator">◇ Analytics</div>
          </div>
        </div>

        {/* RIGHT SIDE - AI PANEL */}
        <div className="home-right">
          <img
            src="/images/ai-panel.png"
            alt="AI moderation panel"
            className="home-panel-image"
          />
        </div>
      </div>

      {/* BOTTOM TAGLINE */}
      <div className="home-bottom-tagline">
        • Powered by Advanced AI •
      </div>
    </div>
  )
}

export default Home
