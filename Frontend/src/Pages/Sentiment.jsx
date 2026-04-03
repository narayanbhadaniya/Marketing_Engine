import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { sentimentAPI } from '../utils/api'
import { Upload } from 'lucide-react'

function parseSection(raw, header) {
  const regex = new RegExp(`## ${header}[^\\n]*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i')
  const match = raw.match(regex)
  return match ? match[1].trim() : ''
}

function parseSentimentScore(text) {
  const pos = text.match(/Positive[:\s]+(\d+)%/i)
  const neu = text.match(/Neutral[:\s]+(\d+)%/i)
  const neg = text.match(/Negative[:\s]+(\d+)%/i)
  return {
    positive: pos ? parseInt(pos[1]) : 33,
    neutral: neu ? parseInt(neu[1]) : 34,
    negative: neg ? parseInt(neg[1]) : 33,
  }
}

function ScoreBar({ label, value, color }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
        <span className="text-sm font-semibold text-white">{value}%</span>
      </div>
      <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  )
}

function WordCloud({ text }) {
  const words = text.split(',').map((w) => w.trim()).filter(Boolean)
  const sizes = [32, 26, 22, 18, 16, 14]
  const colors = ['#6C3AFF', '#FF5C8D', '#0EA5E9', '#F59E0B', '#10B981', 'rgba(255,255,255,0.5)']
  return (
    <div className="flex flex-wrap gap-3 justify-center py-4 px-2">
      {words.map((w, i) => (
        <span
          key={i}
          className="font-display font-semibold"
          style={{ fontSize: sizes[i % sizes.length], color: colors[i % colors.length] }}
        >
          {w}
        </span>
      ))}
    </div>
  )
}

function InfoCard({ title, text, accent }) {
  if (!text) return null
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: accent ? `${accent}15` : '#1A1A2E',
        border: `1px solid ${accent ? accent + '40' : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      <h3 className="font-display font-semibold text-lg mb-3" style={{ color: accent || '#fff' }}>
        {title}
      </h3>
      <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
        {text}
      </p>
    </div>
  )
}

export default function Sentiment() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  })

  const analyse = async () => {
    if (!file) { setError('Please upload a CSV file.'); return }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('brand_context', '')
      const res = await sentimentAPI.analyse(fd)
      setResult(res.data.analysis)
    } catch (e) {
      setError(e.response?.data?.detail || 'Analysis failed.')
    }
    setLoading(false)
  }

  const score = result ? parseSentimentScore(parseSection(result, 'SENTIMENT_SCORE')) : null

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Audience & Sentiment Intelligence</h1>
      <p className="mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Upload customer reviews or social comments (CSV) to extract marketing insights.
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
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className="rounded-2xl p-10 text-center cursor-pointer transition-all"
          style={{
            border: `2px dashed ${isDragActive ? '#6C3AFF' : 'rgba(255,255,255,0.2)'}`,
            background: isDragActive ? 'rgba(108,58,255,0.1)' : 'transparent',
          }}
        >
          <input {...getInputProps()} />
          <Upload size={32} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
          {file ? (
            <div>
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {(file.size / 1024).toFixed(1)} KB — Ready to analyse
              </p>
            </div>
          ) : (
            <div>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>Drop your CSV file here, or click to browse</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                First column should contain review text. Up to 200 rows.
              </p>
            </div>
          )}
        </div>

        {/* CSV format hint */}
        <div
          className="rounded-xl p-4 mt-4"
          style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>📋 CSV Format Example:</p>
          <code className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            review_text<br />
            "Great product, loved the UI"<br />
            "Delivery was slow but product quality is great"
          </code>
        </div>

        <button
          onClick={analyse}
          disabled={loading || !file}
          className="w-full mt-4 text-white font-semibold py-4 rounded-2xl transition-all"
          style={{
            background: loading || !file ? 'rgba(108,58,255,0.4)' : '#6C3AFF',
            cursor: loading || !file ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Analysing sentiment...' : '🔍 Analyse Sentiment & Extract Insights'}
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-4"
            style={{ border: '2px solid #6C3AFF', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}
          />
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>AI is reading and analysing all reviews...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Score */}
          {score && (
            <div
              className="rounded-2xl p-6"
              style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h2 className="font-display font-semibold text-lg text-white mb-6">📊 Overall Sentiment Score</h2>
              <ScoreBar label="😊 Positive" value={score.positive} color="#10B981" />
              <ScoreBar label="😐 Neutral" value={score.neutral} color="#F59E0B" />
              <ScoreBar label="😠 Negative" value={score.negative} color="#EF4444" />
            </div>
          )}

          {/* Themes */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <InfoCard title="💚 Positive Themes" text={parseSection(result, 'POSITIVE_THEMES')} accent="#10B981" />
            <InfoCard title="🔴 Negative Themes" text={parseSection(result, 'NEGATIVE_THEMES')} accent="#EF4444" />
          </div>

          <InfoCard title="💬 High-Impact Comments" text={parseSection(result, 'HIGH_IMPACT_COMMENTS')} />
          <InfoCard title="🎯 Suggested Campaign Angles" text={parseSection(result, 'CAMPAIGN_ANGLES')} accent="#6C3AFF" />
          <InfoCard title="🗣️ Voice of Customer Summary" text={parseSection(result, 'VOICE_OF_CUSTOMER')} />

          {/* Word Cloud */}
          {parseSection(result, 'WORD_CLOUD_TERMS') && (
            <div
              className="rounded-2xl p-6"
              style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h2 className="font-display font-semibold text-lg text-white mb-4">☁️ Word Cloud</h2>
              <WordCloud text={parseSection(result, 'WORD_CLOUD_TERMS')} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
