import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import BrandSetup from './pages/BrandSetup'
import ContentHub from './pages/ContentHub'
import Repurpose from './pages/Repurpose'
import AdCopy from './pages/AdCopy'
import Sentiment from './pages/Sentiment'
import CalendarPage from './pages/CalendarPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden" style={{ background: '#0D0D1A' }}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/brand" element={<BrandSetup />} />
            <Route path="/content" element={<ContentHub />} />
            <Route path="/repurpose" element={<Repurpose />} />
            <Route path="/adcopy" element={<AdCopy />} />
            <Route path="/sentiment" element={<Sentiment />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
