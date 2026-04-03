import { useState, useEffect } from 'react'
import { brandAPI, adAPI } from '../utils/api'

const TONE_COLORS = {
  Emotional:      { bg: 'rgba(236,72,153,0.15)', color: '#f472b6', border: 'rgba(236,72,153,0.3)' },
  Logical:        { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  Urgency:        { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.3)' },
  'Social Proof': { bg: 'rgba(16,185,129,0.15)',  color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  Curiosity:      { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
}

const STATUS_STYLES = {
  Testing:  { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
  Winner:   { bg: 'rgba(16,185,129,0.15)',  color: '#34d399' },
  Rejected: { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
}

function parseVariants(raw) {
  const variants = []
  let recommendation = ''
  let prediction = ''
  let currentTone = null
  let currentLines = []
  let mode = 'variant'

  for (const line of raw.split('\n')) {
    const stripped = line.trim()
    if (stripped.startsWith('## VARIANT_') && stripped.includes('|')) {
      if (currentTone && currentLines.length) {
        variants.push({ tone: currentTone, content: currentLines.join('\n').trim() })
      }
      const parts = stripped.split('|')
      currentTone = parts[1] ? parts[1].trim() : 'Mixed'
      currentLines = []
      mode = 'variant'
    } else if (stripped.startsWith('## RECOMMENDATION')) {
      if (currentTone && currentLines.length) {
        variants.push({ tone: currentTone, content: currentLines.join('\n').trim() })
        currentTone = null
        currentLines = []
      }
      mode = 'rec'
    } else if (stripped.startsWith('## PERFORMANCE')) {
      mode = 'pred'
    } else {
      if (mode === 'variant') currentLines.push(line)
      else if (mode === 'rec') recommendation += line + ' '
      else if (mode === 'pred') prediction += line + ' '
    }
  }

  return { variants, recommendation: recommendation.trim(), prediction: prediction.trim() }
}

export default function AdCopy() {
  const [brands, setBrands] = useState([])
  const [form, setForm] = useState({
    brand_id: '',
    product: '',
    audience: '',
    platform: 'LinkedIn',
    goal: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [statuses, setStatuses] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    brandAPI.getAll().then((r) => {
      setBrands(r.data)
      if (r.data.length > 0) setForm((f) => ({ ...f, brand_id: String(r.data[0].id) }))
    }).catch(() => {})
  }, [])

  const generate = async () => {
    if (!form.product.trim()) { setError('Please enter a product/service.'); return }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await adAPI.generate({ ...form, brand_id: parseInt(form.brand_id) })
      const parsed = parseVariants(res.data.raw)
      setResult(parsed)
      const s = {}
      parsed.variants.forEach((_, i) => { s[i] = 'Testing' })
      setStatuses(s)
    } catch (e) {
      setError(e.response?.data?.detail || 'Generation failed.')
    }
    setLoading(false)
  }

  const exportCSV = () => {
    if (!result) return
    const rows = [['Variant', 'Tone', 'Status', 'Content']]
    result.variants.forEach((v, i) => {
      rows.push([`Variant ${i + 1}`, v.tone, statuses[i] || 'Testing', v.content.replace(/\n/g, ' ')])
    })
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'ad_variants.csv'
    a.click()
  }

  const inputStyle = { background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.1)' }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Ad Copy & A/B Testing</h1>
      <p className="mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Generate 5 ad variants with different persuasion tones and compare them side by side.
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
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
          {[
            { label: 'Brand', isSelect: true, key: 'brand_id', options: brands.map(b => ({ value: b.id, label: b.name })) },
            { label: 'Platform', isSelect: true, key: 'platform', options: ['LinkedIn','Instagram','Google Ads','Twitter','Email'].map(p => ({ value: p, label: p })) },
            { label: 'Product / Service', key: 'product', placeholder: 'e.g. AI Analytics Tool' },
            { label: 'Goal', key: 'goal', placeholder: 'e.g. Free trial signups' },
          ].map(({ label, isSelect, key, options, placeholder }) => (
            <div key={key}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
              {isSelect ? (
                <select
                  className="w-full rounded-xl px-3 py-3 text-white text-sm outline-none"
                  style={inputStyle}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                >
                  {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input
                  className="w-full rounded-xl px-3 py-3 text-white text-sm outline-none"
                  style={inputStyle}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Target Audience</p>
          <input
            className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
            style={inputStyle}
            placeholder="e.g. Marketing managers at mid-size B2B companies"
            value={form.audience}
            onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
          />
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="w-full text-white font-semibold py-4 rounded-2xl transition-all"
          style={{ background: loading ? 'rgba(108,58,255,0.5)' : '#6C3AFF', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? '⏳ Generating 5 ad variants...' : '📢 Generate Ad Variants'}
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-4"
            style={{ border: '2px solid #6C3AFF', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}
          />
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Creating 5 variants with different persuasion tones...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {result && (
        <div>
          {/* AI Insights */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {result.recommendation && (
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#34d399' }}>
                  🏆 AI Recommendation
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{result.recommendation}</p>
              </div>
            )}
            {result.prediction && (
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}
              >
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#60a5fa' }}>
                  📈 Performance Prediction
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{result.prediction}</p>
              </div>
            )}
          </div>

          {/* Export */}
          <div className="flex justify-end mb-4">
            <button
              onClick={exportCSV}
              className="px-5 py-2 rounded-xl text-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
            >
              📥 Export as CSV
            </button>
          </div>

          {/* Variants */}
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {result.variants.map((v, i) => {
              const toneStyle = TONE_COLORS[v.tone] || { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.1)' }
              const statusStyle = STATUS_STYLES[statuses[i]] || STATUS_STYLES.Testing
              return (
                <div
                  key={i}
                  className="rounded-2xl p-5"
                  style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold text-sm">Variant {i + 1}</span>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: toneStyle.bg, color: toneStyle.color, border: `1px solid ${toneStyle.border}` }}
                    >
                      {v.tone}
                    </span>
                  </div>
                  <p
                    className="text-sm whitespace-pre-line leading-relaxed mb-4"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    {v.content}
                  </p>
                  {/* Status buttons */}
                  <div className="flex gap-2">
                    {['Testing', 'Winner', 'Rejected'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatuses((prev) => ({ ...prev, [i]: s }))}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: statuses[i] === s ? statusStyle.bg : 'rgba(255,255,255,0.05)',
                          color: statuses[i] === s ? statusStyle.color : 'rgba(255,255,255,0.3)',
                          border: statuses[i] === s ? `1px solid ${statusStyle.color}44` : '1px solid transparent',
                        }}
                      >
                        {s === 'Winner' ? '🏆' : s === 'Rejected' ? '✕' : '🧪'} {s}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
