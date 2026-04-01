import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Reports() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true)
        const response = await api.get('/analytics/complaints-by-route')
        setRows(response.data)
        setError('')
      } catch (err) {
        setError('Unable to load complaint analytics right now.')
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-gray-400 text-lg">Back</button>
        <span className="text-gray-900 font-semibold">Complaint Analytics</span>
      </div>

      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest">DBMS report</p>
          <p className="text-sm font-semibold text-gray-800 mt-1">Data source: `vw_complaint_summary_by_route`</p>
        </div>

        {loading && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm text-gray-400">
            Loading analytics...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50 text-[11px] uppercase tracking-widest text-gray-400 font-medium">
              <span>Route</span>
              <span>Name</span>
              <span>Total</span>
              <span>Pending</span>
              <span>Resolved</span>
            </div>
            {rows.map(row => (
              <div key={row.route_code} className="grid grid-cols-5 gap-4 px-4 py-3 border-t border-gray-100 text-sm items-center">
                <span className="font-semibold text-gray-800">{row.route_code}</span>
                <span className="text-gray-600">{row.route_name}</span>
                <span className="text-gray-700">{row.complaint_count}</span>
                <span className="text-amber-600 font-medium">{row.pending_count}</span>
                <span className="text-green-600 font-medium">{row.resolved_count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
