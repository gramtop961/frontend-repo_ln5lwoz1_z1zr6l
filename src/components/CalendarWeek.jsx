import React, { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const API = import.meta.env.VITE_BACKEND_URL

const IT_DAYS = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì']
const SLOT_ORDER = [
  ['10:20','11:20'],
  ['11:25','12:25'],
  ['12:30','13:30'],
  ['15:00','16:00'],
  ['16:05','17:05'],
  ['17:10','18:10'],
  ['18:15','19:15'],
]

function mondayOfWeek(d) {
  const date = new Date(d)
  const day = date.getDay() // 0 Sun, 1 Mon
  const diff = (day === 0 ? -6 : 1) - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + diff)
  monday.setHours(0,0,0,0)
  return monday
}

function formatISO(d) {
  return d.toISOString().slice(0,10)
}

export default function CalendarWeek({ token, role, onSelectSlot, refreshKey }) {
  const [weekStart, setWeekStart] = useState(mondayOfWeek(new Date()))
  const [calendar, setCalendar] = useState({})
  const weekStartISO = formatISO(weekStart)

  const load = async () => {
    const res = await fetch(`${API}/calendar?weekStart=${weekStartISO}`, {
      headers: token ? { 'x-token': token } : {}
    })
    const data = await res.json()
    setCalendar(data.calendar || {})
  }

  useEffect(()=>{ load() }, [weekStartISO, token, refreshKey])

  const nextWeek = () => setWeekStart(new Date(weekStart.getTime() + 7*86400000))
  const prevWeek = () => setWeekStart(new Date(weekStart.getTime() - 7*86400000))

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-2 rounded-md hover:bg-gray-100"><ChevronLeft size={18} /></button>
          <button onClick={nextWeek} className="p-2 rounded-md hover:bg-gray-100"><ChevronRight size={18} /></button>
          <div className="font-medium">Settimana del {new Date(weekStart).toLocaleDateString('it-IT')}</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left text-sm text-gray-500 p-3 w-40">Orario</th>
              {IT_DAYS.map((d, i)=>{
                const date = new Date(weekStart.getTime() + i*86400000)
                return (
                  <th key={i} className="text-left text-sm text-gray-500 p-3">{d} <span className="text-gray-400">{date.toLocaleDateString('it-IT')}</span></th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {SLOT_ORDER.map(([st,en])=> (
              <tr key={st} className="border-t">
                <td className="p-3 text-sm text-gray-600">{st} - {en}</td>
                {IT_DAYS.map((_, i)=>{
                  const date = formatISO(new Date(weekStart.getTime() + i*86400000))
                  const cell = (calendar[date] || []).find(s => s.start === st)
                  const enabled = cell?.enabled
                  const status = cell?.status || 'disabilitato'
                  const isFree = enabled && status === 'libero'
                  const isMine = cell?.info?.mine
                  const color = !enabled ? 'bg-gray-100 text-gray-400' : isFree ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  return (
                    <td key={i} className="p-1">
                      <button 
                        disabled={!isFree}
                        onClick={()=> onSelectSlot && onSelectSlot({ date, start: st, end: en })}
                        className={`w-full text-left rounded-md px-3 py-3 text-sm ${color} disabled:opacity-50 disabled:cursor-not-allowed`}>
                        {enabled ? (isFree ? 'Libero' : (isMine ? 'Prenotato (tu)' : 'Occupato')) : 'Disabilitato'}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
