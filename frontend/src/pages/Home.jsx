import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { smartRoutes } from '../data/transit'

const TRIP_HISTORY_KEY = 'smartTransit.tripHistory'

function readTripHistory() {
  if (typeof window === 'undefined') return []

  try {
    const saved = JSON.parse(window.localStorage.getItem(TRIP_HISTORY_KEY) ?? '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function saveTripHistory(nextHistory) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TRIP_HISTORY_KEY, JSON.stringify(nextHistory))
}

function SidebarIcon({ kind }) {
  const baseClass = 'w-[18px] h-[18px] text-slate-500 group-hover:text-blue-600 transition-colors'

  if (kind === 'map') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
        <path d="M3.5 6.5 9 4l6 2.5L20.5 4v13.5L15 20l-6-2.5L3.5 20Z" />
        <path d="M9 4v13.5M15 6.5V20" />
      </svg>
    )
  }

  if (kind === 'alert') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
        <path d="M12 3 4.5 16h15Z" />
        <path d="M12 8.5v3.5M12 15h.01" />
      </svg>
    )
  }

  if (kind === 'pass') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
        <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v2a2 2 0 0 0 0 4v1A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-1a2 2 0 0 0 0-4Z" />
        <path d="M9 6v12" strokeDasharray="2.5 2.5" />
      </svg>
    )
  }

  if (kind === 'schedule') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
        <path d="M7 3v3M17 3v3M4 9h16" />
        <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
        <path d="M8 13h3M13 13h3M8 17h3M13 17h3" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
      <path d="M12 20h7" />
      <path d="M19 11a7 7 0 1 0-2.05 4.95L19 18" />
      <path d="M9.1 9a2.9 2.9 0 1 1 5.3 1.6c-.55.73-1.31 1.17-1.95 1.7-.55.45-.95.97-.95 1.7V14.4" />
      <path d="M12 17.2h.01" />
    </svg>
  )
}

function normalizeText(value) {
  return value.trim().toLowerCase()
}

function getSuggestedRoute(from, to, routes) {
  const origin = normalizeText(from)
  const destination = normalizeText(to)

  if (!origin || !destination || routes.length === 0) return null

  const scoredRoutes = routes.map(route => {
    const routeName = route.name.toLowerCase()
    let score = 0

    if (routeName.includes(origin)) score += 4
    if (routeName.includes(destination)) score += 5
    if (destination.includes('indiranagar') && route.id === '47C') score += 6
    if ((destination.includes('whitefield') || destination.includes('challaghatta')) && route.id === 'L1') score += 6
    if ((destination.includes('madavara') || destination.includes('silk institute') || destination.includes('yelachenahalli')) && route.id === 'L2') score += 6
    if ((destination.includes('bommasandra') || destination.includes('r v road') || destination.includes('rv road')) && route.id === 'YL1') score += 6
    if (origin.includes('majestic') && routeName.includes('majestic')) score += 4
    if (origin.includes('whitefield') && route.id === 'L1') score += 4
    if (origin.includes('madavara') && route.id === 'L2') score += 4
    if ((origin.includes('r v road') || origin.includes('rv road')) && route.id === 'YL1') score += 4

    return { ...route, score }
  })

  const bestMatch = [...scoredRoutes].sort((a, b) => b.score - a.score)[0]
  return bestMatch.score > 0 ? bestMatch : scoredRoutes[0]
}

export default function Home() {
  const [from, setFrom] = useState('Majestic Bus Stand')
  const [to, setTo] = useState('')
  const [tripHistory, setTripHistory] = useState([])
  const [liveTracking, setLiveTracking] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setTripHistory(readTripHistory())
  }, [])

  useEffect(() => {
    let active = true

    async function loadDashboardData() {
      try {
        if (active) setLoading(true)
        const [trackingResponse, alertsResponse] = await Promise.all([
          api.get('/tracking/live'),
          api.get('/alerts'),
        ])

        if (!active) return

        setLiveTracking(trackingResponse.data)
        setAlerts(alertsResponse.data)
        setLoadError('')
      } catch (err) {
        if (active) setLoadError('Unable to load live transit data right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboardData()
    const intervalId = window.setInterval(loadDashboardData, 15000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  function swap() {
    const temp = from
    setFrom(to)
    setTo(temp)
  }

  function storeTripHistory(nextFrom, nextTo) {
    const origin = nextFrom.trim()
    const destination = nextTo.trim()
    if (!origin || !destination) return

    const nextEntry = {
      id: `${origin}-${destination}`.toLowerCase().replace(/\s+/g, '-'),
      from: origin,
      to: destination,
    }

    const nextHistory = [
      nextEntry,
      ...tripHistory.filter(item => !(item.from === origin && item.to === destination)),
    ].slice(0, 3)

    setTripHistory(nextHistory)
    saveTripHistory(nextHistory)
  }

  function handleFindRoutes() {
    storeTripHistory(from, to)
    const params = new URLSearchParams()
    if (from.trim()) params.set('from', from.trim())
    if (to.trim()) params.set('to', to.trim())

    navigate(`/map?${params.toString()}`)
  }

  const routeMeta = useMemo(() => {
    return Object.fromEntries(smartRoutes.map(route => [route.id, route]))
  }, [])

  const liveRoutes = useMemo(() => {
    return liveTracking.map(item => {
      const meta = routeMeta[item.route_code] ?? {
        id: item.route_code,
        name: item.route_code,
        mode: item.route_code.startsWith('L') || item.route_code.startsWith('Y') ? 'METRO' : 'BUS',
        delayMinutes: item.delay_minutes,
        seatsAvailable: item.seats_available,
        totalSeats: item.route_code.startsWith('L') || item.route_code.startsWith('Y') ? 300 : 30,
        distanceKm: 10,
        estimatedMinutes: item.route_code.startsWith('L') || item.route_code.startsWith('Y') ? 42 : 15,
      }

      return {
        ...meta,
        delayMinutes: item.delay_minutes,
        seatsAvailable: item.seats_available,
        adjustedMinutes: meta.estimatedMinutes + item.delay_minutes,
        freeSeatPercent: Math.round((item.seats_available / meta.totalSeats) * 100),
      }
    })
  }, [liveTracking, routeMeta])

  const heroAlert = alerts[0]
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-6 gap-6 fixed top-0 left-0 h-full z-10">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-2">
          <span className="text-white text-sm font-bold">ST</span>
        </div>
        {[
          { icon: 'map', label: 'Map', path: '/map' },
          { icon: 'schedule', label: 'Schedule', path: '/schedules' },
          { icon: 'alert', label: 'Alerts', path: '/alerts' },
          { icon: 'pass', label: 'Pass', path: '/passes' },
          { icon: 'help', label: 'Issues', path: '/complaints' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1 cursor-pointer group w-full px-2"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <SidebarIcon kind={item.icon} />
            </div>
            <span className="text-xs text-gray-400 group-hover:text-blue-600">{item.label}</span>
          </button>
        ))}

        <div className="mt-auto">
          <div
            onClick={() => navigate('/login')}
            className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-medium cursor-pointer"
          >
            SK
          </div>
        </div>
      </div>

      <div className="ml-20 flex-1 p-6">
        <div className="mb-5">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-widest mb-1">Good morning</p>
          <h1 className="text-xl font-bold text-gray-900">Where are you headed?</h1>
        </div>

        {loadError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {loadError}
          </div>
        )}

        <div className="w-full">
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3 py-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0"></span>
                <input
                  className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-300"
                  placeholder="Origin stop"
                  value={from}
                  onChange={event => setFrom(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 px-1 my-1">
                <div className="flex-1 h-px bg-gray-100"></div>
                <button
                  onClick={swap}
                  className="w-10 h-6 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 text-[10px] font-semibold"
                >
                  SWAP
                </button>
                <div className="flex-1 h-px bg-gray-100"></div>
              </div>
              <div className="flex items-center gap-3 py-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 flex-shrink-0"></span>
                <input
                  className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-300"
                  placeholder="Destination stop"
                  value={to}
                  onChange={event => setTo(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button className="text-xs px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 font-medium">Leave now</button>
                <button
                  onClick={() => navigate('/schedules')}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  Schedule
                </button>
                <button
                  onClick={handleFindRoutes}
                  className="ml-auto bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-medium"
                >
                  Find routes
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-amber-600 text-xs font-bold">ALERT</span>
              <span className="text-xs text-amber-700 flex-1">
                {heroAlert ? heroAlert.alert_message : (loading ? 'Loading latest alert...' : 'No active disruption alerts right now.')}
              </span>
              <button onClick={() => navigate('/alerts')} className="text-xs font-medium text-amber-600 whitespace-nowrap">View all</button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Trip history</p>
                {tripHistory.length > 0 && <span className="text-[11px] text-gray-400">Last 3 searches</span>}
              </div>
              {tripHistory.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {tripHistory.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setFrom(item.from)
                        setTo(item.to)
                      }}
                      className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-semibold">
                        REC
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.from} to {item.to}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Tap to refill this trip</p>
                      </div>
                      <span className="text-xs text-blue-600 font-medium">Reuse</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-400">
                  Your last three searches will show up here for quick reselect.
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Favourites</p>
              {liveRoutes.slice(0, 2).map(route => (
                <div key={route.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold ${
                    route.mode === 'METRO' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {route.id}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{route.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Live - {route.seatsAvailable} seats - {route.distanceKm} km</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-teal-600">{route.adjustedMinutes} min</p>
                    <p className="text-xs text-gray-400">{route.mode === 'METRO' ? 'Next train' : 'Next bus'}</p>
                  </div>
                </div>
              ))}

              {!loading && liveRoutes.length === 0 && (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-400">
                  Live favourites will appear here once tracking data is available.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
