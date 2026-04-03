import { useState, useEffect } from 'react'
import { brandAPI, contentAPI } from '../utils/api'
import { Copy, Check, RefreshCw } from 'lucide-react'

const SECTION_LABELS = {
  LINKEDIN_1: '💼 LinkedIn — Thought Leadership',
  LINKEDIN_2: '💼 LinkedIn — Story-Based',
  LINKEDIN_3: '💼 LinkedIn — Direct CTA',
  INSTAGRAM_CAPTION: '📸 Instagram Caption',
  INSTAGRAM_HASHTAGS: '# Instagram Hashtags',
  TWITTER_1: '🐦 Twitter — Stat',
  TWITTER_2: '🐦 Twitter — Question',
  TWITTER_3: '🐦 Twitter — Hot Take',
  TWITTER_4: '🐦 Twitter — Tip',
  TWITTER_5: '🐦 Twitter — Announcement',
  VIDEO_SCRIPT_30S: '🎬 Video Script 30s',
  VIDEO_SCRIPT_60S: '🎬 Video Script 60s',
  EMAIL_NEWSLETTER: '📧 Email Newsletter',
  BLOG_OUTLINE: '📝 Blog Outline',
  GOOGLE_AD_1: '📢 Google Ad 1',
  GOOGLE_AD_2: '📢 Google Ad 2',
  GOOGLE_AD_3: '📢 Google Ad 3',
  SEO_META: '🔍 SEO Meta',
}

function ContentCard({ label, content }) {
  const [copied, setCopied] = useState(false)
  const [refineText, setRefineText] = useState('')
  const [refined, setRefined] = useState('')
  const [refining, setRefining] = useState(false)
  const [showRefine, setShowRefine] = useState(false)

  const displayed = refined || content

  const copy = () => {
    navigator.clipboard.writeText(displayed)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRefine = async () => {
    if (!refineText.trim()) return
    setRefining(true)
    try {
      const res = await contentAPI.refine({ content: displayed, instruction: refineText })
      setRefined(res.data.refined)
      setRefineText('')
    } catch (e) {
      console.error(e)
    }
    setRefining(false)
  }

  return (
    <div
      className="rounded-2xl p-5 flex flex-col"
      style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {label}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: copied ? '#10B981' : 'rgba(255,255,255,0.4)',
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Content */}
      <p
        className="text-sm whitespace-pre-line leading-relaxed flex-1"
        style={{ color: 'rgba(255,255,255,0.8)' }}
      >
        {displayed}
      </p>

      {/* Refine */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => setShowRefine(!showRefine)}
          className="text-xs transition-all"
          style={{ color: '#6C3AFF' }}
        >
          {showRefine ? '▲ Hide refine' : '✏️ Refine this content'}
        </button>
        {showRefine && (
          <div className="flex gap-2 mt-3">
            <input
              className="flex-1 rounded-xl px-3 py-2 text-white text-xs outline-none"
              style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="e.g. Make shorter, More aggressive, Add emojis..."
              value={refineText}
              onChange={(e) => setRefineText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
            />
            <button
              onClick={handleRefine}
              disabled={refining}
              className="px-4 py-2 rounded-xl text-xs text-white flex items-center gap-1"
              style={{ background: '#6C3AFF', opacity: refining ? 0.6 : 1 }}
            >
              {refining ? <RefreshCw size={12} className="animate-spin" /> : 'Go'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ContentHub() {
  const [brands, setBrands] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    brandAPI.getAll().then((r) => {
      setBrands(r.data)
      if (r.data.length > 0) setSelectedBrand(String(r.data[0].id))
    }).catch(() => {})
  }, [])

  const generate = async () => {
    if (!selectedBrand) { setError('Please select a brand.'); return }
    if (!topic.trim()) { setError('Please enter a topic or brief.'); return }
    setError('')
    setLoading(true)
    setContent(null)
    try {
      const res = await contentAPI.generate({ brand_id: parseInt(selectedBrand), topic })
      setContent(res.data.content)
    } catch (e) {
      setError(e.response?.data?.detail || 'Generation failed. Check your Google API key.')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Content Generation Hub</h1>
      <p className="mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Generate all content formats from a single brief in one click.
      </p>

      {error && (
        <div
          className="rounded-xl px-4 py-3 mb-6 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
        >
          {error}
        </div>
      )}

      {/* Input Panel */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 2fr' }}>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Brand
            </p>
            <select
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
              style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.1)' }}
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">Select brand...</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Topic / Brief
            </p>
            <input
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
              style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="e.g. Launching our AI-powered analytics dashboard for SMEs"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
            />
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="w-full text-white font-semibold py-4 rounded-2xl transition-all"
          style={{ background: loading ? 'rgba(108,58,255,0.5)' : '#6C3AFF', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading
            ? '⏳ Generating all content formats... (30-60 seconds)'
            : '⚡ Generate All Content Formats'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-4"
            style={{
              border: '2px solid #6C3AFF',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>AI is generating all content pieces for you...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Results */}
      {content && (
        <div>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ✅ {Object.keys(content).length} content pieces generated for:{' '}
            <span className="text-white">"{topic}"</span>
          </p>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {Object.entries(content).map(([key, value]) =>
              value ? (
                <ContentCard
                  key={key}
                  label={SECTION_LABELS[key] || key.replace(/_/g, ' ')}
                  content={value}
                />
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  )
}
