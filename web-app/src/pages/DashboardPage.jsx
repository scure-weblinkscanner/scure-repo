import { useState, useEffect } from 'react'
import AdminNavbar from '../components/AdminNavbar'
import backgroundWebsite from '../assets/background-website.jpg'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const PERIODS = ['Daily', 'Weekly', 'Monthly']

const VERDICT_COLORS = {
  clean: '#4AFF91',
  suspicious: '#FFD60A',
  malicious: '#FF6B6B',
}

const SCAN_METHOD_CONFIG = {
  cameraUrl:  { label: 'Scan URL'  },
  pasteUrl:   { label: 'Paste URL' },
  cameraQr:   { label: 'Scan QR'  },
  uploadQr:   { label: 'Upload QR' },
}

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
})

const processActivityData = (data, period) => {
  if (!data?.length) return []

  if (period === 'Daily') {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      label: `${i}:00`,
      total: 0, clean: 0, suspicious: 0, malicious: 0,
    }))
    data.forEach(item => {
      const hour = new Date(item.shCreatedAt).getHours()
      hours[hour].total++
      if (item.shVerdict) hours[hour][item.shVerdict.toLowerCase()]++
    })
    return hours
  }

  if (period === 'Weekly') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const result = days.map(d => ({ label: d, total: 0, clean: 0, suspicious: 0, malicious: 0 }))
    data.forEach(item => {
      const day = new Date(item.shCreatedAt).getDay()
      result[day].total++
      if (item.shVerdict) result[day][item.shVerdict.toLowerCase()]++
    })
    return result
  }

  // Monthly
  const result = Array.from({ length: 30 }, (_, i) => ({
    label: `${i + 1}`,
    total: 0, clean: 0, suspicious: 0, malicious: 0,
  }))
  const now = new Date()
  data.forEach(item => {
    const diffDays = Math.floor((now - new Date(item.shCreatedAt)) / (1000 * 60 * 60 * 24))
    const index = 29 - diffDays
    if (index >= 0 && index < 30) {
      result[index].total++
      if (item.shVerdict) result[index][item.shVerdict.toLowerCase()]++
    }
  })
  return result
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(5,5,15,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '10px 14px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 6px', fontSize: 13 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0', fontSize: 12 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [period, setPeriod] = useState('Daily')
  const [activityData, setActivityData] = useState([])
  const [chartData, setChartData] = useState([])
  const [allScans, setAllScans] = useState([])
  const [loadingActivity, setLoadingActivity] = useState(true)
  const [loadingScans, setLoadingScans] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const token = sessionStorage.getItem('token')

  const loadActivity = async (selectedPeriod) => {
    try {
      setLoadingActivity(true)
      const res = await fetch(`http://localhost:5000/api/scanURL/admin/activity?period=${selectedPeriod.toLowerCase()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setActivityData(data.data)
      setChartData(processActivityData(data.data, selectedPeriod))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingActivity(false)
    }
  }

  const loadAllScans = async () => {
    try {
      setLoadingScans(true)
      const res = await fetch('http://localhost:5000/api/scanURL/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setAllScans(data.scans)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingScans(false)
    }
  }

  useEffect(() => {
    loadActivity(period)
    loadAllScans()
  }, [])

  const handlePeriodChange = (p) => {
    setPeriod(p)
    loadActivity(p)
  }

  const totalScans = activityData.length
  const maliciousCount = activityData.filter(s => s.shVerdict?.toLowerCase() === 'malicious').length
  const suspiciousCount = activityData.filter(s => s.shVerdict?.toLowerCase() === 'suspicious').length
  const cleanCount = activityData.filter(s => s.shVerdict?.toLowerCase() === 'clean').length

  const filteredScans = allScans.filter(s =>
    s.shUrl?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.userAccount?.uaUsername?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(5,5,15,0.85), rgba(5,5,15,0.85)), url(${backgroundWebsite})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <AdminNavbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'Bodoni Moda', serif",
            fontSize: 36, fontWeight: 700, margin: '0 0 6px',
          }}>
            Dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
            Monitor scan activity and usage across the platform.
          </p>
        </div>

        {/* Period Filter */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 999, padding: 4, gap: 4,
          }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => handlePeriodChange(p)} style={{
                background: period === p ? '#0E0E95' : 'transparent',
                color: period === p ? '#fff' : 'rgba(255,255,255,0.45)',
                border: period === p ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                borderRadius: 999, padding: '8px 20px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginBottom: 28,
        }}>
          {[
            { label: 'Total Scans', value: totalScans, color: '#fff' },
            { label: 'Clean', value: cleanCount, color: '#4AFF91' },
            { label: 'Suspicious', value: suspiciousCount, color: '#FFD60A' },
            { label: 'Malicious', value: maliciousCount, color: '#FF6B6B' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '20px 24px',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 8px' }}>
                {stat.label}
              </p>
              <p style={{ color: stat.color, fontSize: 32, fontWeight: 800, margin: 0, fontFamily: "'Bodoni Moda', serif" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Line Chart */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: '24px',
          marginBottom: 28,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 20px', color: '#fff' }}>
            Scan Activity — {period}
          </h2>
          {loadingActivity ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                  interval={period === 'Daily' ? 2 : 0}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', paddingTop: 16 }}
                />
                <Line type="monotone" dataKey="total" stroke="#fff" strokeWidth={2} dot={false} name="Total" />
                <Line type="monotone" dataKey="clean" stroke="#4AFF91" strokeWidth={1.5} dot={false} name="Clean" />
                <Line type="monotone" dataKey="suspicious" stroke="#FFD60A" strokeWidth={1.5} dot={false} name="Suspicious" />
                <Line type="monotone" dataKey="malicious" stroke="#FF6B6B" strokeWidth={1.5} dot={false} name="Malicious" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Scan Table */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#fff' }}>
              All Scans
            </h2>
            <input
              type="text"
              placeholder="Search by URL or username..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '8px 14px',
                fontSize: 13, color: '#fff', outline: 'none',
                fontFamily: "'DM Sans', sans-serif", width: 260,
              }}
            />
          </div>

          {loadingScans ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['User', 'URL', 'Verdict', 'Risk Score', 'Method', 'Date'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '10px 12px',
                        color: 'rgba(255,255,255,0.35)', fontWeight: 600,
                        fontSize: 11, letterSpacing: 1, textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredScans.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.3)' }}>
                        No scans found.
                      </td>
                    </tr>
                  ) : (
                    filteredScans.map((scan, i) => {
                      const verdictColor = VERDICT_COLORS[scan.shVerdict?.toLowerCase()] ?? '#aaa'
                      return (
                        <tr key={i} style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          transition: 'background 0.15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px 12px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
                            {scan.userAccount?.uaUsername ?? 'Unknown'}
                          </td>
                          <td style={{ padding: '12px 12px', maxWidth: 240 }}>
                            <span style={{
                              color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace',
                              fontSize: 12, display: 'block',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {scan.shUrl}
                            </span>
                          </td>
                          <td style={{ padding: '12px 12px' }}>
                            <span style={{
                              color: verdictColor,
                              background: `${verdictColor}18`,
                              border: `1px solid ${verdictColor}44`,
                              borderRadius: 999, padding: '3px 10px',
                              fontSize: 11, fontWeight: 700,
                              textTransform: 'capitalize',
                            }}>
                              {scan.shVerdict}
                            </span>
                          </td>
                          <td style={{ padding: '12px 12px', color: verdictColor, fontWeight: 700 }}>
                            {scan.shRiskScore}
                          </td>
                          <td style={{ padding: '12px 12px', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>
                            {SCAN_METHOD_CONFIG[scan.shScanMethod]?.label ?? scan.shScanMethod}
                          </td>
                          <td style={{ padding: '12px 12px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
                            {formatDate(scan.shCreatedAt)}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}