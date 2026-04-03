import { useState, useEffect } from 'react'
import { brandAPI, repurposeAPI } from '../utils/api'
import { Copy, Check } from 'lucide-react'

function parseSection(raw, header) {
  const regex = new RegExp(`## ${header}[^\\n]*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i')
  const match = raw.match(regex)
  return match ? match[1].trim() : ''
}

function CopyCard({ label, text }) {
  const [copied, setCopied] = useState(false)
  if (!text) return null
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {label}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="flex items-center gap-1 text-xs"
          style={{ color: copied ? '#10B981' : 'rgba(255,255,255,0.3)' }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
        {text}
      </p>
    </div>
  )
}

export default function Repurpose() {
  const [brands, setBrands] = useState([])
  const [form, setForm] = useState({
    brand_id: '',
    asset_name: '',
    asset_type: 'blog',
    content: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    brandAPI.getAll().then((r) => {
      setBrands(r.data)
      if (r.data.length > 0) setForm((f) => ({ ...f, brand_id: String(r.data[0].id) }))
    }).catch(() => {})
  }, [])

  const handleSubmit = async () => {
    if (!form.content.trim()) { setError('Please paste your content.'); return }
    if (!form.asset_name.trim()) { setError('Please enter an asset name.'); return }
    if (!form.brand_id) { setError('Please select a brand.'); return }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await repurposeAPI.process({ ...form, brand_id: parseInt(form.brand_id) })
      setResult(res.data.result)
    } catch (e) {
      setError(e.response?.data?.detail || 'Repurposing failed.')
    }
    setLoading(false)
  }

  const inputStyle = {
    background: '#0D0D1A',
    border: '1px solid rgba(255,255,255,0.1)',
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Content Repurposing Engine</h1>
      <p className="mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Paste a long-form asset and extract maximum value across all formats.
      </p>

      {error && (
        <div
          className="rounded-xl px-4 py-3 mb-6 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
        >
          {error}
        </div>
      )}

      <div
        className="rounded-2xl p-6 mb-8"
        style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Top row */}
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Brand</p>
            <select
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
              style={inputStyle}
              value={form.brand_id}
              onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))}
            >
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Asset Name</p>
            <input
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
              style={inputStyle}
              placeholder="e.g. The Future of AI in Marketing"
              value={form.asset_name}
              onChange={(e) => setForm((f) => ({ ...f, asset_name: e.target.value }))}
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Asset Type</p>
            <select
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
              style={inputStyle}
              value={form.asset_type}
              onChange={(e) => setForm((f) => ({ ...f, asset_type: e.target.value }))}
            >
              <option value="blog">Blog Post</option>
              <option value="podcast">Podcast Transcript</option>
              <option value="webinar">Webinar Transcript</option>
            </select>
          </div>
        </div>

        {/* Content area */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Paste Your Content Here
          </p>
          <textarea
            className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none resize-none"
            style={{ ...inputStyle, minHeight: '200px' }}
            placeholder="Paste your full blog post, podcast transcript, or webinar transcript here..."
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          />
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {form.content.length} characters
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full text-white font-semibold py-4 rounded-2xl transition-all"
          style={{ background: loading ? 'rgba(108,58,255,0.5)' : '#6C3AFF', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? '⏳ Repurposing content... this may take a minute...' : '🔄 Repurpose Across All Formats'}
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-4"
            style={{ border: '2px solid #6C3AFF', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}
          />
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Extracting insights and generating all formats...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Insights */}
          <div
            className="rounded-2xl p-6"
            style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <h2 className="font-display font-semibold text-lg text-white mb-4">🔍 Key Insights & Analysis</h2>
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <CopyCard label="Top 5 Key Insights" text={parseSection(result, 'KEY_INSIGHTS')} />
              <CopyCard label="Most Quotable Lines" text={parseSection(result, 'QUOTABLE_LINES')} />
              <CopyCard label="Main Argument Summary" text={parseSection(result, 'SUMMARY')} />
              <CopyCard label="Content Coverage Map" text={parseSection(result, 'COVERAGE_MAP')} />
            </div>
          </div>

          {/* Content Formats */}
          <div
            className="rounded-2xl p-6"
            style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <h2 className="font-display font-semibold text-lg text-white mb-4">📦 Repurposed Content</h2>
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {['LINKEDIN_1','LINKEDIN_2','LINKEDIN_3','INSTAGRAM_CAPTION','INSTAGRAM_HASHTAGS',
                'TWITTER_1','TWITTER_2','TWITTER_3','VIDEO_SCRIPT_30S','VIDEO_SCRIPT_60S',
                'EMAIL_NEWSLETTER','BLOG_OUTLINE','GOOGLE_AD_1','SEO_META'].map((key) => (
                <CopyCard key={key} label={key.replace(/_/g, ' ')} text={parseSection(result, key)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
