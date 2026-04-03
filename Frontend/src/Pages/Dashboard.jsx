import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Zap, RefreshCw, Megaphone, BarChart2, Calendar, ArrowRight } from 'lucide-react'
import { brandAPI } from '../utils/api'

const modules = [
  {
    path: '/brand',
    icon: Briefcase,
    label: 'Brand Setup',
    desc: 'Define your brand context, tone & campaign goals',
    color: '#6C3AFF',
  },
  {
    path: '/content',
    icon: Zap,
    label: 'Content Hub',
    desc: 'Generate all content formats from a single brief',
    color: '#FF5C8D',
  },
  {
    path: '/repurpose',
    icon: RefreshCw,
    label: 'Repurpose',
    desc: 'Turn long-form assets into multi-format content',
    color: '#0EA5E9',
  },
  {
    path: '/adcopy',
    icon: Megaphone,
    label: 'Ad Copy A/B',
    desc: 'Generate & compare 5 ad variants by tone',
    color: '#F59E0B',
  },
  {
    path: '/sentiment',
    icon: BarChart2,
    label: 'Sentiment',
    desc: 'Analyse customer reviews & extract insights',
    color: '#10B981',
  },
  {
    path: '/calendar',
    icon: Calendar,
    label: 'Calendar',
    desc: 'Plan & schedule content across platforms',
    color: '#8B5CF6',
  },
]

export default function Dashboard() {
  const [brands, setBrands] = useState([])

  useEffect(() => {
    brandAPI.getAll().then((r) => setBrands(r.data)).catch(() => {})
  }, [])

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold text-white mb-2">
          Marketing Intelligence Engine
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
          AI-powered workspace for campaigns, content & analytics
        </p>
      </div>

      {/* Welcome Banner if no brands */}
      {brands.length === 0 && (
        <div
          className="rounded-2xl p-6 mb-8 flex items-center justify-between"
          style={{
            background: 'rgba(108,58,255,0.1)',
            border: '1px solid rgba(108,58,255,0.3)',
          }}
        >
          <div>
            <p className="font-semibold mb-1" style={{ color: '#6C3AFF' }}>
              👋 Welcome! Start by setting up your brand.
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              All AI outputs are personalised to your brand context.
            </p>
          </div>
          <Link
            to="/brand"
            className="px-6 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-80"
            style={{ background: '#6C3AFF' }}
          >
            Setup Brand →
          </Link>
        </div>
      )}

      {/* Active Brands */}
      {brands.length > 0 && (
        <div
          className="rounded-2xl p-6 mb-8"
          style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Active Brands
          </p>
          <div className="flex flex-wrap gap-3">
            {brands.map((b) => (
              <span
                key={b.id}
                className="px-4 py-2 rounded-xl text-sm text-white"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {b.name}{' '}
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>{b.industry}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Module Cards */}
      <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {modules.map((mod) => {
          const ModIcon = mod.icon
          return (
            <Link
              key={mod.path}
              to={mod.path}
              className="group rounded-2xl p-6 transition-all hover:-translate-y-1"
              style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: mod.color + '22' }}
              >
                <ModIcon size={22} style={{ color: mod.color }} />
              </div>
              <h3 className="text-white font-display font-semibold text-lg mb-1">{mod.label}</h3>
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {mod.desc}
              </p>
              <div
                className="flex items-center gap-1 text-sm transition-all"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Open module <ArrowRight size={14} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
