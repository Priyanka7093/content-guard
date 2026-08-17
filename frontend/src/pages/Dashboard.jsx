import { Routes, Route } from 'react-router-dom'
import DashboardSidebar from '../components/DashboardSidebar'
import DashboardOverview from './DashboardOverview'
import DashboardText from './DashboardText'
import DashboardImage from './DashboardImage'
import DashboardModelInsights from './DashboardModelInsights'
import DashboardHealth from './DashboardHealth'

function Dashboard() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      paddingTop: 76,
      background: 'linear-gradient(180deg, #020817, #061426)',
    }}>
      <DashboardSidebar />
      <div style={{ flex: 1, padding: 28, boxSizing: 'border-box', overflowX: 'hidden' }}>
        <Routes>
          <Route index element={<DashboardOverview />} />
          <Route path="text" element={<DashboardText />} />
          <Route path="image" element={<DashboardImage />} />
          <Route path="models" element={<DashboardModelInsights />} />
          <Route path="health" element={<DashboardHealth />} />
        </Routes>
      </div>
    </div>
  )
}

export default Dashboard
