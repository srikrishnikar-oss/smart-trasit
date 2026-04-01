import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

const seatColor = seats => (seats <= 20 ? '#ef4444' : seats <= 80 ? '#f59e0b' : '#22c55e')
const routePalette = {
  L1: { line: '#7c3aed', stop: '#6d28d9' },
  L2: { line: '#16a34a', stop: '#15803d' },
  YL1: { line: '#eab308', stop: '#ca8a04' },
  '47C': { line: '#2563eb', stop: '#1d4ed8' },
}

function ensureLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L)
      return
    }

    if (!document.querySelector('link[data-leaflet-map="true"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.dataset.leafletMap = 'true'
      document.head.appendChild(link)
    }

    const existingScript = document.querySelector('script[data-leaflet-map="true"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L), { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.dataset.leafletMap = 'true'
    script.onload = () => resolve(window.L)
    script.onerror = reject
    document.body.appendChild(script)
  })
}

function toMapRoute(route) {
  return {
    id: route.route_code,
    name: route.route_name,
    type: route.mode_type,
    congestion: route.vehicle?.delay_status ?? 'CLEAR',
    stops: route.stops.map(stop => ({
      id: stop.stop_id,
      code: stop.stop_code,
      name: stop.stop_name,
      pos: [stop.latitude, stop.longitude],
    })),
    vehicle: {
      pos: route.vehicle?.latitude != null && route.vehicle?.longitude != null
        ? [route.vehicle.latitude, route.vehicle.longitude]
        : null,
      seats: route.vehicle?.seats_available ?? 0,
      eta: route.vehicle?.delay_minutes != null ? `${Math.max(2, 5 + route.vehicle.delay_minutes)} min` : '--',
      status: route.vehicle?.delay_status ?? 'ACTIVE',
      delayMinutes: route.vehicle?.delay_minutes ?? 0,
    },
    palette: routePalette[route.route_code] ?? { line: '#475569', stop: '#334155' },
  }
}

export default function LiveMap() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layersRef = useRef([])
  const filterRef = useRef('All')
  const searchRef = useRef('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState('')
  const [routes, setRoutes] = useState([])
  const [journey, setJourney] = useState(null)
  const [delayedVehicles, setDelayedVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  const tripFrom = searchParams.get('from') ?? ''
  const tripTo = searchParams.get('to') ?? ''

  useEffect(() => {
    let active = true

    async function loadMapData() {
      try {
        if (active) setLoading(true)

        const requests = [api.get('/routes/network'), api.get('/tracking/delayed')]
        if (tripFrom.trim() && tripTo.trim()) {
          requests.push(api.get('/routes/plan', { params: { from: tripFrom.trim(), to: tripTo.trim() } }))
        }

        const [networkResponse, delayedResponse, journeyResponse] = await Promise.all(requests)
        if (!active) return

        setRoutes(networkResponse.data.map(toMapRoute))
        setDelayedVehicles(delayedResponse.data)
        setJourney(journeyResponse?.data ?? null)
        setMapError('')
      } catch {
        if (active) {
          setMapError('Unable to load route planning data right now.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadMapData()
    return () => {
      active = false
    }
  }, [tripFrom, tripTo])

  const highlightedRouteIds = journey?.route_codes ?? []
  const selectedJourneyRoute = selectedRoute ?? highlightedRouteIds[0] ?? null
  const selectedRouteDetails = useMemo(
    () => routes.find(route => route.id === selectedJourneyRoute) ?? null,
    [routes, selectedJourneyRoute]
  )

  function clearLayers() {
    const map = mapInstanceRef.current
    if (!map) return
    layersRef.current.forEach(layer => map.removeLayer(layer))
    layersRef.current = []
  }

  function drawRoutes() {
    const L = window.L
    const map = mapInstanceRef.current
    if (!L || !map) return

    clearLayers()

    const currentFilter = filterRef.current
    const currentSearch = searchRef.current.toLowerCase()

    const filtered = routes.filter(route => {
      if (journey && highlightedRouteIds.length > 0 && !highlightedRouteIds.includes(route.id)) return false
      if (currentFilter !== 'All' && route.type !== currentFilter) return false
      if (
        currentSearch &&
        !route.name.toLowerCase().includes(currentSearch) &&
        !route.id.toLowerCase().includes(currentSearch) &&
        !route.stops.some(stop => stop.name.toLowerCase().includes(currentSearch))
      ) return false
      return true
    })

    filtered.forEach(route => {
      const isInJourney = highlightedRouteIds.includes(route.id)
      const isSelected = route.id === selectedJourneyRoute

      const line = L.polyline(route.stops.map(stop => stop.pos), {
        color: route.palette.line,
        weight: route.type === 'METRO' ? 7 : 5,
        opacity: isSelected ? 1 : isInJourney ? 0.92 : 0.72,
        dashArray: route.type === 'BUS' ? '8 5' : null,
      }).addTo(map)

      line.on('click', () => setSelectedRoute(route.id))
      layersRef.current.push(line)

      route.stops.forEach(stop => {
        const marker = L.circleMarker(stop.pos, {
          radius: isSelected ? 8 : isInJourney ? 7 : 6,
          fillColor: '#ffffff',
          color: route.palette.stop,
          weight: isSelected ? 3 : 2,
          fillOpacity: 1,
          opacity: isSelected ? 1 : isInJourney ? 0.95 : 0.8,
        }).addTo(map)

        marker.on('click', () => setSelectedRoute(route.id))
        marker.bindTooltip(stop.name, {
          permanent: true,
          direction: 'top',
          offset: [0, -8],
        })
        layersRef.current.push(marker)
      })

      if (route.vehicle.pos) {
        const vehicleIcon = L.divIcon({
          className: '',
          html: `<div style="width:32px;height:32px;border-radius:50%;background:${route.palette.line};border:3px solid ${seatColor(route.vehicle.seats)};box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:700;opacity:${isSelected ? 1 : isInJourney ? 0.96 : 0.82};">${route.type === 'METRO' ? 'M' : 'B'}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const vehicleMarker = L.marker(route.vehicle.pos, { icon: vehicleIcon }).addTo(map)
        vehicleMarker.on('click', () => setSelectedRoute(route.id))
        layersRef.current.push(vehicleMarker)
      }
    })
  }

  useEffect(() => {
    let cancelled = false

    ensureLeaflet()
      .then(L => {
        if (cancelled || mapInstanceRef.current || !mapRef.current) return

        const map = L.map(mapRef.current, {
          center: [12.9769, 77.5713],
          zoom: 11,
          zoomControl: true,
        })

        mapInstanceRef.current = map
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CartoDB',
        }).addTo(map)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CartoDB',
          pane: 'overlayPane',
        }).addTo(map)

        setMapReady(true)
      })
      .catch(() => {
        if (!cancelled) setMapError('Unable to load the live map right now.')
      })

    return () => {
      cancelled = true
      clearLayers()
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      setMapReady(false)
    }
  }, [])

  useEffect(() => {
    if (journey?.route_codes?.[0]) {
      setSelectedRoute(journey.route_codes[0])
    } else if (!journey) {
      setSelectedRoute(null)
    }
  }, [journey])

  useEffect(() => {
    filterRef.current = filter
    searchRef.current = search
    if (!mapReady || !mapInstanceRef.current || routes.length === 0) return

    drawRoutes()

    const focusedStops = []
    if (journey && highlightedRouteIds.length > 0) {
      routes
        .filter(route => highlightedRouteIds.includes(route.id))
        .forEach(route => route.stops.forEach(stop => focusedStops.push(stop.pos)))
    } else {
      routes.forEach(route => route.stops.forEach(stop => focusedStops.push(stop.pos)))
    }

    if (focusedStops.length > 1) {
      mapInstanceRef.current.fitBounds(focusedStops, { padding: [30, 30] })
    }
  }, [filter, search, routes, journey, mapReady, highlightedRouteIds, selectedJourneyRoute])

  function locateMe() {
    if (!mapInstanceRef.current || !window.L) return

    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords
      mapInstanceRef.current.setView([latitude, longitude], 15)
      window.L.circleMarker([latitude, longitude], {
        radius: 8,
        fillColor: '#1A6BCC',
        color: '#fff',
        weight: 2,
        fillOpacity: 1,
      })
        .addTo(mapInstanceRef.current)
        .bindPopup('You are here')
        .openPopup()
    })
  }

  const statusColor = { ACTIVE: 'text-green-600', ON_TIME: 'text-green-600', DELAYED: 'text-red-500', DELAY: 'text-red-500' }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/')} className="text-gray-400 text-lg">Back</button>
        <span className="text-gray-900 font-semibold">Live Map</span>
        <div className="flex-1 mx-2">
          <input
            value={search}
            onChange={event => {
              setSearch(event.target.value)
              searchRef.current = event.target.value
            }}
            placeholder="Search route or stop..."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {journey ? (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">Suggested journey</p>
              <p className="text-sm font-semibold text-blue-900 mt-1">
                Go from {journey.from_stop} to {journey.to_stop}
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {journey.steps.map((step, index) => (
                  <p key={`${step.kind}-${step.from_stop}-${step.to_stop}-${index}`} className="text-xs text-blue-800">
                    {index + 1}. {step.kind === 'ride'
                      ? `Take ${step.route_code} from ${step.from_stop} to ${step.to_stop}`
                      : `Walk from ${step.from_stop} to ${step.to_stop} for the transfer`}
                  </p>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                if (journey.route_codes?.[0]) setSelectedRoute(journey.route_codes[0])
              }}
              className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
            >
              Focus journey
            </button>
          </div>
        </div>
      ) : tripFrom.trim() && tripTo.trim() && !loading ? (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 text-sm text-amber-700">
          No matching route was found in the current database network for this trip yet.
        </div>
      ) : null}

      <div className="flex gap-2 px-4 py-2 bg-white border-b border-gray-100 flex-shrink-0 items-center">
        {['All', 'BUS', 'METRO'].map(item => (
          <button
            key={item}
            onClick={() => {
              filterRef.current = item
              setFilter(item)
            }}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
              filter === item ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            {item}
          </button>
        ))}
        <div className="flex items-center gap-3 ml-3">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
            <span className="text-xs text-gray-400">Clear</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
            <span className="text-xs text-gray-400">Slow</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
            <span className="text-xs text-gray-400">Delay</span>
          </div>
        </div>
        <button
          onClick={locateMe}
          className="ml-auto text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50"
        >
          My location
        </button>
      </div>

      {delayedVehicles.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex gap-2 overflow-x-auto">
          {delayedVehicles.slice(0, 4).map(vehicle => (
            <div key={vehicle.vehicle_code} className="flex-shrink-0 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs text-amber-800">
              {vehicle.route_code} +{vehicle.delay_minutes} min
            </div>
          ))}
        </div>
      )}

      {mapError ? (
        <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {mapError}
        </div>
      ) : (
        <div ref={mapRef} className="flex-1 w-full" />
      )}

      {selectedRouteDetails && !mapError && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t border-gray-100 shadow-lg p-4 z-[1000]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold px-2 py-0.5 rounded ${selectedRouteDetails.type === 'METRO' ? 'bg-teal-50 text-teal-700' : 'bg-blue-50 text-blue-700'}`}>
                {selectedRouteDetails.id}
              </span>
              <span className="font-semibold text-gray-800 text-sm">{selectedRouteDetails.name}</span>
            </div>
            <button onClick={() => setSelectedRoute(null)} className="text-gray-400 text-lg">Close</button>
          </div>
          <div className="flex gap-4 mb-3">
            <div className="text-center">
              <p className="text-xs text-gray-400">Next ETA</p>
              <p className="text-sm font-bold text-teal-600">{selectedRouteDetails.vehicle.eta}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Seats left</p>
              <p className="text-sm font-bold" style={{ color: seatColor(selectedRouteDetails.vehicle.seats) }}>{selectedRouteDetails.vehicle.seats}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Status</p>
              <p className={`text-sm font-bold ${statusColor[selectedRouteDetails.vehicle.status] ?? 'text-gray-700'}`}>{selectedRouteDetails.vehicle.status}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Stops</p>
              <p className="text-sm font-bold text-gray-700">{selectedRouteDetails.stops.length}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">All stops</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {selectedRouteDetails.stops.map(stop => (
                <div key={stop.id} className="flex-shrink-0 bg-gray-50 rounded-lg px-3 py-1.5 text-xs text-gray-600 border border-gray-100">
                  {stop.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
