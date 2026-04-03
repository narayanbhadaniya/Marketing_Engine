import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Zap,
  RefreshCw,
  Megaphone,
  BarChart2,
  Calendar,
} from 'lucide-react'

const nav = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/brand', icon: Briefcase, label: 'Brand Setup' },
  { path: '/content', icon: Zap, label: 'Content Hub' },
  { path: '/repurpose', icon: RefreshCw, label: 'Repurpose' },
  { path: '/adcopy', icon: Megaphone, label: 'Ad Copy A/B' },
  { path: '/sentiment', icon: BarChart2, label: 'Sentiment' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside
      className="flex flex-col p-6 gap-2 border-r border-white/10"
      style={{ width: '240px', minWidth: '240px', background: '#1A1A2E' }}
    >
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-xl font-display font-bold" style={{ color: '#6C3AFF' }}>
          MarketAI
        </h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Intelligence Engine
        </p>
      </div>

      {/* Nav Links */}
      {nav.map((item) => {
        const NavIcon = item.icon
        const isActive = pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: isActive ? '#6C3AFF' : 'transparent',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              boxShadow: isActive ? '0 4px 20px rgba(108,58,255,0.3)' : 'none',
            }}
          >
            <NavIcon size={18} />
            {item.label}
          </Link>
        )
      })}
    </aside>
  )
}
