import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const passPlans = [
  { type: 'Daily Pass', price: 'Rs.30', duration: '1 day', icon: 'PASS', routes: 'All city buses' },
  { type: 'Weekly Pass', price: 'Rs.150', duration: '7 days', icon: 'WEEK', routes: 'All city buses' },
  { type: 'Monthly Pass', price: 'Rs.500', duration: '30 days', icon: 'MONTH', routes: 'All city buses', popular: true },
  { type: 'Student Pass', price: 'Rs.250', duration: '30 days', icon: 'STU', routes: 'All city buses' },
]

const EXPIRING_SOON_DAYS = 7
const DEMO_USER_ID = 1

function getDaysLeft(validTo) {
  const today = new Date()
  const endDate = new Date(`${validTo}T00:00:00`)
  return Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)))
}

function formatDisplayDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function modeLabel(mode) {
  if (mode === 'BUS') return 'All city buses'
  if (mode === 'METRO') return 'Metro lines'
  return 'Bus and metro routes'
}

export default function PassManager() {
  const [tab, setTab] = useState('my')
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadPasses() {
      try {
        setLoading(true)
        const response = await api.get(`/passes/user/${DEMO_USER_ID}`)
        setPasses(response.data)
        setError('')
      } catch (err) {
        setError('Unable to load passes right now.')
      } finally {
        setLoading(false)
      }
    }

    loadPasses()
  }, [])

  const passesWithState = useMemo(() => {
    return passes.map(pass => {
      const daysLeft = getDaysLeft(pass.valid_to)
      return {
        ...pass,
        daysLeft,
        type: pass.pass_name,
        id: pass.pass_number,
        routes: modeLabel(pass.applicable_mode),
        color: pass.pass_status === 'ACTIVE' ? 'bg-blue-600' : 'bg-gray-400',
        isExpiringSoon: pass.pass_status === 'ACTIVE' && daysLeft <= EXPIRING_SOON_DAYS,
        displayValidFrom: formatDisplayDate(pass.valid_from),
        displayValidTo: formatDisplayDate(pass.valid_to),
        priceLabel: `Rs.${pass.price_amount}`,
      }
    })
  }, [passes])

  const expiringPass = passesWithState.find(pass => pass.isExpiringSoon)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-gray-400 text-lg">Back</button>
        <span className="text-gray-900 font-semibold">Pass Manager</span>
      </div>

      <div className="flex bg-white border-b border-gray-100 px-6">
        {['my', 'buy'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm py-3 px-4 font-medium border-b-2 transition-colors ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'
            }`}
          >
            {t === 'my' ? 'My Passes' : 'Buy a Pass'}
          </button>
        ))}
      </div>

      {expiringPass && (
        <div className="px-4 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
              RENEW
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Renew Pass</p>
              <p className="text-xs text-amber-800 mt-0.5">
                {expiringPass.type} expires in {expiringPass.daysLeft} days. Valid routes: {expiringPass.routes}
              </p>
            </div>
            <button
              onClick={() => setTab('buy')}
              className="bg-amber-500 text-white text-xs px-4 py-2 rounded-lg font-medium"
            >
              Renew now
            </button>
          </div>
        </div>
      )}

      {tab === 'my' && (
        <div className="px-4 mt-4">
          {loading && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm text-gray-400">
              Loading your passes...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && passesWithState.map(pass => (
            <div key={pass.id} className="mb-4 rounded-2xl overflow-hidden border border-gray-100">
              <div className={`${pass.color} px-5 py-5`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white text-xs font-medium opacity-75 uppercase tracking-widest mb-1">SmartTransit</p>
                    <p className="text-white text-lg font-bold">{pass.type}</p>
                    <p className="text-white text-xs opacity-75 mt-1">{pass.routes}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    pass.pass_status === 'ACTIVE' ? 'bg-green-400 text-white' : 'bg-white text-gray-500'
                  }`}>
                    {pass.pass_status}
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-white text-xs opacity-60">Valid from</p>
                    <p className="text-white text-sm font-medium">{pass.displayValidFrom}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-xs opacity-60">Valid to</p>
                    <p className="text-white text-sm font-medium">{pass.displayValidTo}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Pass ID</p>
                  <p className="text-sm font-medium text-gray-700">{pass.id}</p>
                  <p className="text-xs text-gray-400 mt-1">Valid routes: {pass.routes}</p>
                </div>
                {pass.pass_status === 'ACTIVE' ? (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Days remaining</p>
                    <p className="text-sm font-bold text-green-600">{pass.daysLeft} days</p>
                    {pass.isExpiringSoon && (
                      <button
                        onClick={() => setTab('buy')}
                        className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium"
                      >
                        Renew pass
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setTab('buy')}
                    className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Renew
                  </button>
                )}
              </div>
            </div>
          ))}

          {!loading && !error && passesWithState.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">PASS</p>
              <p className="text-sm">No active passes</p>
              <button
                onClick={() => setTab('buy')}
                className="mt-4 text-sm bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                Buy a pass
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'buy' && (
        <div className="px-4 mt-4">
          <p className="text-xs text-gray-400 mb-3">Select a plan</p>
          {passPlans.map(plan => (
            <div
              key={plan.type}
              className={`bg-white rounded-xl border mb-3 p-4 flex items-center gap-4 cursor-pointer ${
                plan.popular ? 'border-blue-300' : 'border-gray-100'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                {plan.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">{plan.type}</p>
                  {plan.popular && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Popular</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{plan.routes} - {plan.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-blue-600">{plan.price}</p>
                <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg mt-1 font-medium">
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
