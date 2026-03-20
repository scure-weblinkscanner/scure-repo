import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNavbar from '../components/AdminNavbar'
import backgroundWebsite from '../assets/background-website.jpg'
import { getAllTickets, respondToTicket } from '../services/tickets.service'

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: '#FFD60A', bg: 'rgba(255,214,10,0.12)',   border: 'rgba(255,214,10,0.3)'   },
  in_progress: { label: 'In Progress', color: '#4AFF91', bg: 'rgba(74,255,145,0.12)',  border: 'rgba(74,255,145,0.3)'  },
  resolved:    { label: 'Resolved',    color: '#aaa',    bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)' },
}

const FILTERS = ['All', 'Open', 'In Progress', 'Resolved']

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
})

export default function TicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('All')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [response, setResponse] = useState('')
  const [responseStatus, setResponseStatus] = useState('resolved')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

 const token = sessionStorage.getItem('token')

    const loadTickets = async () => {
    try {
        setLoading(true)
        setError(null)
        const data = await getAllTickets(token)
        setTickets(data)
    } catch (err) {
        setError(err.message)
    } finally {
        setLoading(false)
    }
    }

  useEffect(() => {
    loadTickets()
  }, [])

  const filteredTickets = tickets.filter(t => {
    if (filter === 'All') return true
    return t.tkStatus === filter.toLowerCase().replace(' ', '_')
  })

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket)
    setResponse(ticket.tkAdminResponse ?? '')
    setResponseStatus(ticket.tkStatus === 'resolved' ? 'resolved' : 'in_progress')
    setSubmitError('')
    setSubmitSuccess(false)
  }

  const handleRespond = async () => {
    if (!response.trim()) {
      setSubmitError('Response cannot be empty.')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
        await respondToTicket(token, selectedTicket.tkId, response, responseStatus)
        setSubmitSuccess(true)
        setSelectedTicket({ ...selectedTicket, tkAdminResponse: response, tkStatus: responseStatus })
        loadTickets()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(5,5,15,0.85), rgba(5,5,15,0.85)), url(${backgroundWebsite})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
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
            Support Tickets
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
            View and respond to user-submitted issues.
          </p>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 999, padding: 4, gap: 4,
          }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? '#0E0E95' : 'transparent',
                color: filter === f ? '#fff' : 'rgba(255,255,255,0.45)',
                border: filter === f ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                borderRadius: 999, padding: '8px 20px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1fr' : '1fr', gap: 20 }}>

          {/* Ticket List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 40 }}>Loading...</div>
            ) : error ? (
              <div style={{
                background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
                borderRadius: 12, padding: 16, color: '#FF6B6B', fontSize: 14,
              }}>
                {error}
              </div>
            ) : filteredTickets.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 40, fontSize: 14 }}>
                No tickets found.
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const sc = STATUS_CONFIG[ticket.tkStatus] ?? STATUS_CONFIG.open
                const isSelected = selectedTicket?.tkId === ticket.tkId
                return (
                  <div
                    key={ticket.tkId}
                    onClick={() => handleSelectTicket(ticket)}
                    style={{
                      background: isSelected ? 'rgba(14,14,149,0.2)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '1px solid rgba(14,14,149,0.6)' : '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 16, padding: '18px 20px',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', flex: 1 }}>
                        {ticket.tkSubject}
                      </div>
                      <div style={{
                        background: sc.bg, border: `1px solid ${sc.border}`,
                        borderRadius: 999, padding: '3px 12px',
                        fontSize: 11, fontWeight: 700, color: sc.color,
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        {sc.label}
                      </div>
                    </div>
                    <p style={{
                      color: 'rgba(255,255,255,0.45)', fontSize: 13,
                      margin: '0 0 10px', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {ticket.tkDescription}
                    </p>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                        👤 {ticket.userAccount?.uaUsername ?? 'Unknown'}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                        {formatDate(ticket.tkCreatedAt)}
                      </span>
                      {ticket.tkAdminResponse && (
                        <span style={{ color: '#4AFF91', fontSize: 12 }}>Responded</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Ticket Detail + Response */}
          {selectedTicket && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: 28,
              position: 'sticky', top: 84,
              alignSelf: 'flex-start',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
            }}>
              {/* Close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 20, fontWeight: 700, margin: 0 }}>
                  Ticket Detail
                </h2>
                <button onClick={() => setSelectedTicket(null)} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.5)',
                  fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}>
                  ✕ Close
                </button>
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{
                  background: STATUS_CONFIG[selectedTicket.tkStatus]?.bg,
                  border: `1px solid ${STATUS_CONFIG[selectedTicket.tkStatus]?.border}`,
                  borderRadius: 999, padding: '3px 12px',
                  fontSize: 11, fontWeight: 700,
                  color: STATUS_CONFIG[selectedTicket.tkStatus]?.color,
                }}>
                  {STATUS_CONFIG[selectedTicket.tkStatus]?.label}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, alignSelf: 'center' }}>
                  {formatDate(selectedTicket.tkCreatedAt)}
                </span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>
                {selectedTicket.tkSubject}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6, margin: '0 0 6px' }}>
                {selectedTicket.tkDescription}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: '0 0 24px' }}>
                Submitted by {selectedTicket.userAccount?.uaUsername} ({selectedTicket.userAccount?.uaEmail})
              </p>

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginBottom: 20 }} />

              {/* Admin Response */}
              <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 10px' }}>
                Admin Response
              </h4>

              <textarea
                value={response}
                onChange={e => setResponse(e.target.value)}
                placeholder="Type your response here..."
                rows={5}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                  padding: '12px 14px', fontSize: 14, color: '#fff',
                  fontFamily: "'DM Sans', sans-serif", resize: 'vertical',
                  outline: 'none', boxSizing: 'border-box', marginBottom: 12,
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(14,14,149,0.7)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />

              {/* Status selector */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  fontSize: 12, fontWeight: 600, letterSpacing: 1,
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
                  display: 'block', marginBottom: 8,
                }}>
                  Set Status
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['in_progress', 'resolved'].map(s => (
                    <button key={s} onClick={() => setResponseStatus(s)} style={{
                      background: responseStatus === s ? STATUS_CONFIG[s].bg : 'rgba(255,255,255,0.03)',
                      border: responseStatus === s ? `1px solid ${STATUS_CONFIG[s].border}` : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, padding: '7px 16px',
                      fontSize: 13, fontWeight: 600,
                      color: responseStatus === s ? STATUS_CONFIG[s].color : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {submitError && (
                <div style={{
                  background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
                  borderRadius: 10, padding: '10px 14px', marginBottom: 12,
                  color: '#FF6B6B', fontSize: 13,
                }}>
                  ⚠ {submitError}
                </div>
              )}

              {submitSuccess && (
                <div style={{
                  background: 'rgba(74,255,145,0.1)', border: '1px solid rgba(74,255,145,0.3)',
                  borderRadius: 10, padding: '10px 14px', marginBottom: 12,
                  color: '#4AFF91', fontSize: 13,
                }}>
                  ✓ Response submitted successfully.
                </div>
              )}

              <button
                onClick={handleRespond}
                disabled={submitting}
                style={{
                  width: '100%', background: '#0E0E95',
                  color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12, padding: '13px 0',
                  fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s',
                  opacity: submitting ? 0.7 : 1,
                }}
                onMouseEnter={e => { if (!submitting) e.target.style.background = '#1a1ab0' }}
                onMouseLeave={e => { if (!submitting) e.target.style.background = '#0E0E95' }}
              >
                {submitting ? 'Submitting...' : 'Submit Response'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}