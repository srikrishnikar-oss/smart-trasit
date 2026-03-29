import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { metroSchedule } from '../data/transit'

export default function Schedules() {
  const navigate = useNavigate()
  const [lineId, setLineId] = useState('L1')
  const [dayLabel, setDayLabel] = useState('Monday')

  const selectedLine = useMemo(
    () => metroSchedule.find(line => line.lineId === lineId) ?? metroSchedule[0],
    [lineId]
  )

  const availableDays = selectedLine.days.map(day => day.label)
  const selectedDay = selectedLine.days.find(day => day.label === dayLabel) ?? selectedLine.days[0]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
          >
            Back
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-blue-600 font-semibold">Metro schedule</p>
            <h1 className="text-2xl font-bold text-gray-900">Bengaluru timetable overview</h1>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {metroSchedule.map(line => (
              <button
                key={line.lineId}
                onClick={() => {
                  setLineId(line.lineId)
                  setDayLabel(line.days[0].label)
                }}
                className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                  lineId === line.lineId ? line.accent : 'border-gray-200 text-gray-500 bg-white'
                }`}
              >
                {line.lineId} {line.lineName}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {availableDays.map(day => (
              <button
                key={day}
                onClick={() => setDayLabel(day)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  dayLabel === day ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {selectedDay.sections.map(section => (
            <div key={section.title} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className={`px-4 py-3 border-b ${selectedLine.accent}`}>
                <p className="text-sm font-bold">{section.title}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3 text-left">From</th>
                      <th className="px-4 py-3 text-left">To</th>
                      <th className="px-4 py-3 text-left">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map(row => (
                      <tr key={`${section.title}-${row.from}-${row.to}`} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-900">{row.from}</td>
                        <td className="px-4 py-3 text-gray-700">{row.to}</td>
                        <td className="px-4 py-3 text-gray-700">{row.frequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
