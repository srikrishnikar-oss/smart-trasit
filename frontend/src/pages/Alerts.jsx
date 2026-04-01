import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const filters = ['All', 'Delays', 'Cancellations', 'Diversions', 'High severity']

const severityStyle = {
  HIGH: 'bg-red-50 text-red-700 border-red-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  LOW: 'bg-gray-50 text-gray-500 border-gray-200',
}

const typeStyle = {
  DELAY: 'bg-amber-50 text-amber-700',
  CANCELLATION: 'bg-red-50 text-red-700',
  DIVERSION: 'bg-blue-50 text-blue-700',
  MAINTENANCE: 'bg-slate-100 text-slate-700',
  INFO: 'bg-emerald-50 text-emerald-700',
}

function formatRelativeTime(value) {
  const diffMs = Date.now() - new Date(value).getTime()
  const diffMin = Math.max(1, Math.round(diffMs / 60000))

  if (diffMin < 60) return `${diffMin} min ago`

  const diffHours = Math.round(diffMin / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  const diffDays = Math.round(diffHours / 24)
  return `${diffDays} day ago`
}

export default function Alerts() {
  const [active, setActive] = useState('All')
  const [alerts, setAlerts] = useState([])
  const [delayedVehicles, setDelayedVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadAlerts() {
      try {
        setLoading(true)
        const [alertsResponse, delayedResponse] = await Promise.all([
          api.get('/alerts'),
          api.get('/tracking/delayed'),
        ])
        setAlerts(alertsResponse.data)
        setDelayedVehicles(delayedResponse.data)
        setError('')
      } catch (err) {
        setError('Unable to load alerts right now.')
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [])

  const filtered = useMemo(() => {
    return alerts.filter(alert => {
      if (active === 'All') return true
      if (active === 'Delays') return alert.alert_type === 'DELAY'
      if (active === 'Cancellations') return alert.alert_type === 'CANCELLATION'
      if (active === 'Diversions') return alert.alert_type === 'DIVERSION'
      if (active === 'High severity') return alert.severity_level === 'HIGH'
      return true
    })
  }, [active, alerts])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-gray-400 text-lg">Back</button>
        <span className="text-gray-900 font-semibold">Active Alerts</span>
        <span className="ml-auto bg-red-50 text-red-600 text-xs font-medium px-2 py-1 rounded-full">{alerts.length} active</span>
      </div>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActive(filter)}
            className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap font-medium ${
              active === filter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="px-4 mt-1">
        {!loading && !error && delayedVehicles.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Delayed vehicles</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">DB view: `vw_delayed_vehicles`</p>
              </div>
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium">
                {delayedVehicles.length} delayed
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {delayedVehicles.slice(0, 4).map(vehicle => (
                <div key={vehicle.vehicle_code} className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-amber-900">{vehicle.route_code} - {vehicle.route_name}</p>
                    <p className="text-xs text-amber-700 mt-0.5">{vehicle.vehicle_code} - {vehicle.seats_available} seats available</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-700">+{vehicle.delay_minutes} min</p>
                    <p className="text-xs text-amber-600">{formatRelativeTime(vehicle.last_reported_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm text-gray-400">
            Loading live alerts...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && filtered.map(alert => (
          <div key={alert.alert_id} className={`bg-white rounded-xl border mb-3 p-4 ${severityStyle[alert.severity_level] ?? severityStyle.LOW}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{alert.route_code ?? 'GEN'}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeStyle[alert.alert_type] ?? 'bg-gray-100 text-gray-700'}`}>
                {alert.alert_type}
              </span>
              {alert.severity_level === 'HIGH' && (
                <span className="ml-auto flex items-center gap-1 text-xs text-red-500">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
                  High
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{alert.alert_message}</p>
            <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(alert.created_at)}</p>
          </div>
        ))}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">OK</p>
            <p className="text-sm">No alerts in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}
