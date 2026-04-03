import { useState } from 'react'
import { brandAPI } from '../utils/api'

const TONES = ['Professional', 'Witty', 'Warm', 'Bold', 'Minimalist', 'Playful', 'Authoritative']
const PLATFORMS = ['LinkedIn', 'Instagram', 'Email', 'Google Ads', 'Twitter']
const GOALS = ['Awareness', 'Lead Gen', 'Retention', 'Product Launch']

function Label({ children }) {
  return (
    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
      {children}
    </p>
  )
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
      style={{
        background: '#0D0D1A',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={(e) => (e.target.style.borderColor = '#6C3AFF')}
      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
    />
  )
}

function Section({ title, children }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <h2 className="font-display font-semibold text-lg text-white mb-4">{title}</h2>
      {children}
    </div>
  )
}

function ToggleButton({ active, onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
      style={{
        background: active ? '#6C3AFF' : 'transparent',
        borderColor: active ? '#6C3AFF' : 'rgba(255,255,255,0.2)',
        color: active ? '#fff' : 'rgba(255,255,255,0.5)',
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  )
}

export default function BrandSetup() {
  const [form, setForm] = useState({
    name: '',
    industry: '',
    target_audience: { age: '', interests: '', pain_points: '' },
    tone: [],
    guardrails: { include: '', avoid: '' },
    campaign: { name: '', goal: '', duration: '' },
    platforms: [],
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const toggleTone = (t) => {
    if (form.tone.includes(t)) {
      setForm((f) => ({ ...f, tone: f.tone.filter((x) => x !== t) }))
    } else if (form.tone.length < 3) {
      setForm((f) => ({ ...f, tone: [...f.tone, t] }))
    }
  }

  const togglePlatform = (p) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.industry.trim()) {
      setError('Brand name and industry are required.')
      return
    }
    if (form.tone.length === 0) {
      setError('Select at least 1 tone.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        guardrails: {
          include: form.guardrails.include
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          avoid: form.guardrails.avoid
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        },
      }
      const res = await brandAPI.setup(payload)
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong. Check your API key.')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Brand & Campaign Setup</h1>
      <p className="mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
        All AI outputs will be personalised to this brand context.
      </p>

      {/* Error */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 mb-6 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
        >
          {error}
        </div>
      )}

      {/* Success */}
      {result && (
        <div
          className="rounded-2xl p-6 mb-8"
          style={{ background: 'rgba(108,58,255,0.1)', border: '1px solid rgba(108,58,255,0.3)' }}
        >
          <p className="font-semibold mb-2" style={{ color: '#6C3AFF' }}>
            ✅ Brand saved! AI Feedback:
          </p>
          <p className="text-sm whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {result.ai_feedback}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Brand Context */}
        <Section title="Brand Context">
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <Label>Brand Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. TechCorp"
              />
            </div>
            <div>
              <Label>Industry *</Label>
              <Input
                value={form.industry}
                onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                placeholder="e.g. SaaS, E-commerce, Healthcare"
              />
            </div>
            <div>
              <Label>Target Age Range</Label>
              <Input
                value={form.target_audience.age}
                onChange={(e) =>
                  setForm((f) => ({ ...f, target_audience: { ...f.target_audience, age: e.target.value } }))
                }
                placeholder="e.g. 25-40"
              />
            </div>
            <div>
              <Label>Interests</Label>
              <Input
                value={form.target_audience.interests}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    target_audience: { ...f.target_audience, interests: e.target.value },
                  }))
                }
                placeholder="e.g. tech, productivity, business"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Pain Points</Label>
              <Input
                value={form.target_audience.pain_points}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    target_audience: { ...f.target_audience, pain_points: e.target.value },
                  }))
                }
                placeholder="e.g. too much manual work, high costs, lack of insights"
              />
            </div>
          </div>
        </Section>

        {/* Brand Tone */}
        <Section title="Brand Tone">
          <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Pick up to 3 tones ({form.tone.length}/3 selected)
          </p>
          <div className="flex flex-wrap gap-3">
            {TONES.map((t) => (
              <ToggleButton
                key={t}
                active={form.tone.includes(t)}
                onClick={() => toggleTone(t)}
                disabled={form.tone.length === 3 && !form.tone.includes(t)}
              >
                {t}
              </ToggleButton>
            ))}
          </div>
        </Section>

        {/* Guardrails */}
        <Section title="Brand Guardrails">
          <div className="space-y-4">
            <div>
              <Label>Keywords to Always Include (comma-separated)</Label>
              <Input
                value={form.guardrails.include}
                onChange={(e) =>
                  setForm((f) => ({ ...f, guardrails: { ...f.guardrails, include: e.target.value } }))
                }
                placeholder="e.g. innovation, sustainable, customer-first"
              />
            </div>
            <div>
              <Label>Words to Always Avoid (comma-separated)</Label>
              <Input
                value={form.guardrails.avoid}
                onChange={(e) =>
                  setForm((f) => ({ ...f, guardrails: { ...f.guardrails, avoid: e.target.value } }))
                }
                placeholder="e.g. cheap, basic, complicated"
              />
            </div>
          </div>
        </Section>

        {/* Campaign Setup */}
        <Section title="Campaign Setup">
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <Label>Campaign Name</Label>
              <Input
                value={form.campaign.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, campaign: { ...f.campaign, name: e.target.value } }))
                }
                placeholder="e.g. Q2 Product Launch"
              />
            </div>
            <div>
              <Label>Campaign Duration</Label>
              <Input
                value={form.campaign.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, campaign: { ...f.campaign, duration: e.target.value } }))
                }
                placeholder="e.g. 30 days"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Campaign Goal</Label>
              <div className="flex gap-3 flex-wrap mt-1">
                {GOALS.map((g) => (
                  <ToggleButton
                    key={g}
                    active={form.campaign.goal === g}
                    onClick={() =>
                      setForm((f) => ({ ...f, campaign: { ...f.campaign, goal: g } }))
                    }
                  >
                    {g}
                  </ToggleButton>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Platforms */}
        <Section title="Target Platforms">
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((p) => (
              <ToggleButton
                key={p}
                active={form.platforms.includes(p)}
                onClick={() => togglePlatform(p)}
              >
                {p}
              </ToggleButton>
            ))}
          </div>
        </Section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full text-white font-semibold py-4 rounded-2xl transition-all"
          style={{
            background: loading ? 'rgba(108,58,255,0.5)' : '#6C3AFF',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Saving brand & validating with AI...' : '🚀 Save Brand & Get AI Validation'}
        </button>
      </div>
    </div>
  )
}
