import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const metroRoutes = [
  {
    id: 'L1',
    name: 'Purple Line',
    type: 'METRO',
    congestion: 'SLOW',
    stops: [
      { pos: [12.9954, 77.757], name: 'Whitefield' },
      { pos: [12.9871, 77.7362], name: 'Kadugodi Tree Park' },
      { pos: [12.9975, 77.6753], name: 'Garudacharpalya' },
      { pos: [12.9908, 77.6516], name: 'Benniganahalli' },
      { pos: [12.9756, 77.6056], name: 'Mahatma Gandhi Road' },
      { pos: [12.9769, 77.5713], name: 'Majestic Metro' },
      { pos: [12.9732, 77.5483], name: 'Mysore Road' },
      { pos: [12.9505, 77.5252], name: 'Challaghatta' },
    ],
    vehicle: { pos: [12.9908, 77.6516], seats: 124, eta: '7 min', status: 'ACTIVE' },
  },
  {
    id: 'L2',
    name: 'Green Line',
    type: 'METRO',
    congestion: 'CLEAR',
    stops: [
      { pos: [13.0586, 77.5013], name: 'Madavara' },
      { pos: [13.036, 77.5249], name: 'Nagasandra / Peenya Industry' },
      { pos: [13.0233, 77.5488], name: 'Yeshwanthpur' },
      { pos: [12.9769, 77.5713], name: 'Majestic Metro' },
      { pos: [12.941, 77.5735], name: 'Lalbagh' },
      { pos: [12.9163, 77.573], name: 'Yelachenahalli' },
      { pos: [12.8892, 77.5603], name: 'Silk Institute' },
    ],
    vehicle: { pos: [12.941, 77.5735], seats: 146, eta: '5 min', status: 'ACTIVE' },
  },
  {
    id: 'YL1',
    name: 'Yellow Line',
    type: 'METRO',
    congestion: 'DELAY',
    stops: [
      { pos: [12.9251, 77.5541], name: 'R V Road' },
      { pos: [12.9095, 77.5733], name: 'Jayadeva Hospital' },
      { pos: [12.8972, 77.5951], name: 'BTM Layout' },
      { pos: [12.8785, 77.6248], name: 'Central Silk Board' },
      { pos: [12.8453, 77.6602], name: 'Electronics City' },
      { pos: [12.8168, 77.6887], name: 'Bommasandra' },
    ],
    vehicle: { pos: [12.8785, 77.6248], seats: 98, eta: '9 min', status: 'DELAYED' },
  },
  {
    id: '47C',
    name: 'Majestic Bus Stand to Indiranagar',
    type: 'BUS',
    congestion: 'DELAY',
    stops: [
      { pos: [12.9784, 77.5721], name: 'Majestic Bus Stand' },
      { pos: [12.9767, 77.5854], name: 'Cubbon Park' },
      { pos: [12.9756, 77.6056], name: 'MG Road' },
      { pos: [12.9738, 77.6203], name: 'Ulsoor' },
      { pos: [12.9784, 77.6408], name: 'Indiranagar' },
    ],
    vehicle: { pos: [12.9756, 77.6056], seats: 12, eta: '8 min', status: 'DELAYED' },
  },
]

const congestionColor = { CLEAR: '#22c55e', SLOW: '#f59e0b', DELAY: '#ef4444' }
const seatColor = seats => (seats <= 20 ? '#ef4444' : seats <= 80 ? '#f59e0b' : '#22c55e')

function normalizeText(value) {
  return value.trim().toLowerCase()
}

function getRecommendedRoute(routes, from, to, forcedRouteId) {
  if (forcedRouteId) {
    const forcedRoute = routes.find(route => route.id === forcedRouteId)
    if (forcedRoute) return forcedRoute
  }

  const origin = normalizeText(from ?? '')
  const destination = normalizeText(to ?? '')
  if (!origin && !destination) return null

  const scoredRoutes = routes.map(route => {
    const stopNames = route.stops.map(stop => stop.name.toLowerCase()).join(' ')
    const routeName = `${route.id} ${route.name}`.toLowerCase()
    let score = 0

    if (origin && stopNames.includes(origin)) score += 5
    if (destination && stopNames.includes(destination)) score += 6
    if (origin && routeName.includes(origin)) score += 2
    if (destination && routeName.includes(destination)) score += 3
    if ((origin.includes('whitefield') || destination.includes('challaghatta')) && route.id === 'L1') score += 5
    if ((origin.includes('madavara') || destination.includes('silk institute')) && route.id === 'L2') score += 5
    if ((origin.includes('r v road') || destination.includes('bommasandra') || destination.includes('rv road')) && route.id === 'YL1') score += 5
    if (destination.includes('indiranagar') && route.id === '47C') score += 5
    if (origin.includes('majestic') && stopNames.includes('majestic')) score += 4

    return { route, score }
  })

  const bestMatch = [...scoredRoutes].sort((a, b) => b.score - a.score)[0]
  return bestMatch && bestMatch.score > 0 ? bestMatch.route : routes[0]
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

  const tripFrom = searchParams.get('from') ?? ''
  const tripTo = searchParams.get('to') ?? ''
  const forcedRouteId = searchParams.get('route') ?? null
  const recommendedRoute = useMemo(
    () => getRecommendedRoute(metroRoutes, tripFrom, tripTo, forcedRouteId),
    [tripFrom, tripTo, forcedRouteId]
  )
  const recommendedDestination = recommendedRoute
    ? recommendedRoute.stops[recommendedRoute.stops.length - 1]?.name ?? recommendedRoute.name
    : ''

  function drawRoutes() {
    const L = window.L
    const map = mapInstanceRef.current
    if (!L || !map) return

    layersRef.current.forEach(layer => map.removeLayer(layer))
    layersRef.current = []

    const currentFilter = filterRef.current
    const currentSearch = searchRef.current

    const filtered = metroRoutes.filter(route => {
      if (currentFilter !== 'All' && route.type !== currentFilter) return false
      if (
        currentSearch &&
        !route.name.toLowerCase().includes(currentSearch.toLowerCase()) &&
        !route.id.toLowerCase().includes(currentSearch.toLowerCase()) &&
        !route.stops.some(stop => stop.name.toLowerCase().includes(currentSearch.toLowerCase()))
      ) return false
      return true
    })

    filtered.forEach(route => {
      const line = L.polyline(route.stops.map(stop => stop.pos), {
        color: congestionColor[route.congestion],
        weight: route.type === 'METRO' ? 6 : 4,
        opacity: route.id === recommendedRoute?.id ? 1 : 0.82,
        dashArray: route.type === 'BUS' ? '8 5' : null,
      }).addTo(map)

      line.on('click', () => setSelectedRoute(route))
      layersRef.current.push(line)

      route.stops.forEach(stop => {
        const marker = L.circleMarker(stop.pos, {
          radius: route.id === recommendedRoute?.id ? 8 : 7,
          fillColor: '#ffffff',
          color: route.type === 'METRO' ? '#0F6E56' : '#1A6BCC',
          weight: 3,
          fillOpacity: 1,
        }).addTo(map)
        marker.on('click', () => setSelectedRoute(route))
        marker.bindTooltip(
          `<span style="font-size:10px;font-weight:500;color:#1a1a1a;">${stop.name}</span>`,
          { permanent: true, direction: 'top', offset: [0, -8] }
        ).openTooltip()
        layersRef.current.push(marker)
      })

      const vehicleIcon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;border-radius:50%;background:${route.type === 'METRO' ? '#0F6E56' : '#1A6BCC'};border:3px solid ${seatColor(route.vehicle.seats)};box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:700;">${route.type === 'METRO' ? 'M' : 'B'}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })
      const vehicleMarker = L.marker(route.vehicle.pos, { icon: vehicleIcon }).addTo(map)
      vehicleMarker.on('click', () => setSelectedRoute(route))
      layersRef.current.push(vehicleMarker)
    })
  }

  useEffect(() => {
    if (recommendedRoute && !selectedRoute) {
      setSelectedRoute(recommendedRoute)
      setSearch(recommendedRoute.id)
      searchRef.current = recommendedRoute.id
    }
  }, [recommendedRoute, selectedRoute])

  useEffect(() => {
    if (mapInstanceRef.current) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      const L = window.L
      const center = recommendedRoute?.stops?.[0]?.pos ?? [12.9769, 77.5713]
      const map = L.map(mapRef.current, {
        center,
        zoom: recommendedRoute ? 11 : 12,
        zoomControl: true,
      })
      mapInstanceRef.current = map
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB',
      }).addTo(map)
      drawRoutes()

      if (recommendedRoute) {
        map.fitBounds(recommendedRoute.stops.map(stop => stop.pos), { padding: [30, 30] })
      }
    }
    document.head.appendChild(script)
  }, [recommendedRoute])

  useEffect(() => {
    filterRef.current = filter
    searchRef.current = search
    if (mapInstanceRef.current && window.L) {
      drawRoutes()
    }
  }, [filter, search, recommendedRoute])

  useEffect(() => {
    if (mapInstanceRef.current && recommendedRoute) {
      mapInstanceRef.current.fitBounds(recommendedRoute.stops.map(stop => stop.pos), { padding: [30, 30] })
    }
  }, [recommendedRoute])

  function locateMe() {
    if (!mapInstanceRef.current) return
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords
      const L = window.L
      mapInstanceRef.current.setView([latitude, longitude], 15)
      L.circleMarker([latitude, longitude], {
        radius: 8,
        fillColor: '#1A6BCC',
        color: '#fff',
        weight: 2,
        fillOpacity: 1,
      }).addTo(mapInstanceRef.current).bindPopup('You are here').openPopup()
    })
  }

  const statusColor = { ACTIVE: 'text-green-600', DELAYED: 'text-red-500' }

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

      {recommendedRoute && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">Recommended route</p>
              <p className="text-sm font-semibold text-blue-900 mt-1">
                Take {recommendedRoute.id} from {tripFrom || recommendedRoute.stops[0]?.name || recommendedRoute.name} to {tripTo || recommendedDestination}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {recommendedRoute.type === 'METRO' ? 'Metro line' : 'Bus route'} - ETA {recommendedRoute.vehicle.eta} - Seats left {recommendedRoute.vehicle.seats}
              </p>
            </div>
            <button
              onClick={() => setSelectedRoute(recommendedRoute)}
              className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
            >
              Focus route
            </button>
          </div>
        </div>
      )}

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

      <div ref={mapRef} className="flex-1 w-full"></div>

      {selectedRoute && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t border-gray-100 shadow-lg p-4 z-[1000]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold px-2 py-0.5 rounded ${selectedRoute.type === 'METRO' ? 'bg-teal-50 text-teal-700' : 'bg-blue-50 text-blue-700'}`}>
                {selectedRoute.id}
              </span>
              <span className="font-semibold text-gray-800 text-sm">{selectedRoute.name}</span>
            </div>
            <button onClick={() => setSelectedRoute(null)} className="text-gray-400 text-lg">Close</button>
          </div>
          <div className="flex gap-4 mb-3">
            <div className="text-center">
              <p className="text-xs text-gray-400">Next ETA</p>
              <p className="text-sm font-bold text-teal-600">{selectedRoute.vehicle.eta}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Seats left</p>
              <p className="text-sm font-bold" style={{ color: seatColor(selectedRoute.vehicle.seats) }}>{selectedRoute.vehicle.seats}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Status</p>
              <p className={`text-sm font-bold ${statusColor[selectedRoute.vehicle.status]}`}>{selectedRoute.vehicle.status}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Stops</p>
              <p className="text-sm font-bold text-gray-700">{selectedRoute.stops.length}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">All stops</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {selectedRoute.stops.map(stop => (
                <div key={stop.name} className="flex-shrink-0 bg-gray-50 rounded-lg px-3 py-1.5 text-xs text-gray-600 border border-gray-100">
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
