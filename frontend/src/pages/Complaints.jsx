import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const DEMO_USER_ID = 1
const categories = ['Delay', 'Overcrowding', 'Driver Behaviour', 'Cleanliness', 'Route Issue', 'Other']

const statusStyle = {
  PENDING: 'bg-amber-50 text-amber-700',
  IN_REVIEW: 'bg-blue-50 text-blue-700',
  RESOLVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function Complaints() {
  const [tab, setTab] = useState('my')
  const [category, setCategory] = useState('')
  const [route, setRoute] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [complaints, setComplaints] = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [complaintsResponse, routesResponse] = await Promise.all([
          api.get(`/complaints/user/${DEMO_USER_ID}`),
          api.get('/routes'),
        ])
        setComplaints(complaintsResponse.data)
        setRoutes(routesResponse.data)
        setError('')
      } catch (err) {
        setError('Unable to load complaints right now.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const routeLookup = useMemo(() => {
    return Object.fromEntries(routes.map(item => [item.route_code.toUpperCase(), item]))
  }, [routes])

  async function handleSubmit() {
    if (!category || !route || !message) return

    const selectedRoute = routeLookup[route.trim().toUpperCase()]

    try {
      setSubmitting(true)
      setError('')
      const response = await api.post('/complaints', {
        user_id: DEMO_USER_ID,
        route_id: selectedRoute?.route_id ?? null,
        vehicle_id: null,
        complaint_category: category,
        complaint_text: message,
      })

      const newComplaint = {
        complaint_id: response.data.complaint_id,
        route_code: selectedRoute?.route_code ?? route.trim().toUpperCase(),
        complaint_category: category,
        complaint_text: message,
        complaint_status: response.data.complaint_status,
        created_at: response.data.created_at,
      }

      setComplaints(current => [newComplaint, ...current])
      setSubmitted(true)
    } catch (err) {
      setError('Complaint submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleNew() {
    setSubmitted(false)
    setCategory('')
    setRoute('')
    setMessage('')
    setTab('my')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-gray-400 text-lg">Back</button>
        <span className="text-gray-900 font-semibold">Complaints</span>
      </div>

      <div className="flex bg-white border-b border-gray-100 px-6">
        {['my', 'new'].map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSubmitted(false) }}
            className={`text-sm py-3 px-4 font-medium border-b-2 transition-colors ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'
            }`}
          >
            {t === 'my' ? 'My Complaints' : 'File a Complaint'}
          </button>
        ))}
      </div>

      {tab === 'my' && (
        <div className="px-4 mt-4">
          {loading && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm text-gray-400">
              Loading complaints...
            </div>
          )}

          {error && !submitted && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 mb-3">
              {error}
            </div>
          )}

          {!loading && complaints.map(c => (
            <div key={c.complaint_id} className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{c.route_code ?? 'GEN'}</span>
                  <span className="text-xs text-gray-400">{c.complaint_category}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[c.complaint_status] ?? statusStyle.PENDING}`}>
                  {c.complaint_status}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{c.complaint_text}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">{formatDate(c.created_at)}</p>
                <p className="text-xs text-gray-400">ID: {c.complaint_id}</p>
              </div>
            </div>
          ))}

          {!loading && complaints.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">LOG</p>
              <p className="text-sm">No complaints filed yet</p>
            </div>
          )}

          <button
            onClick={() => setTab('new')}
            className="w-full mt-2 bg-blue-600 text-white text-sm py-3 rounded-xl font-medium"
          >
            File a new complaint
          </button>
        </div>
      )}

      {tab === 'new' && (
        <div className="px-4 mt-4">
          {submitted ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">OK</p>
              <p className="text-lg font-semibold text-gray-800 mb-1">Complaint submitted</p>
              <p className="text-sm text-gray-400 mb-6">We'll review it and get back to you soon.</p>
              <button
                onClick={handleNew}
                className="bg-blue-600 text-white text-sm px-6 py-2.5 rounded-xl font-medium"
              >
                Back to my complaints
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-800 mb-4">New complaint</p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 mb-4">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1 block">Route number</label>
                <input
                  value={route}
                  onChange={e => setRoute(e.target.value)}
                  placeholder="e.g. 47C, M2"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-400"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
                        category === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-400 resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!category || !route || !message || submitting}
                className={`w-full text-sm py-3 rounded-xl font-medium ${
                  category && route && message && !submitting
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit complaint'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
