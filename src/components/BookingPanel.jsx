import React, { useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL

export default function BookingPanel({ token, role, selectedSlot, onBooked, students, guideLabels }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pickedStudent, setPickedStudent] = useState('')
  const [guideType, setGuideType] = useState('standard')
  const labels = useMemo(()=>({ A: 'Notturna', B: 'Extraurbana', C: 'Autostrada', ...(guideLabels||{}) }), [guideLabels])

  if (!selectedSlot) return null

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-token': token },
        body: JSON.stringify({ ...selectedSlot, student_id: role==='admin' ? pickedStudent || undefined : undefined, guide_type: guideType })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Errore di prenotazione')
      onBooked()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3">
      <div className="text-sm text-gray-600">Prenotazione selezionata:</div>
      <div className="text-base font-medium">{selectedSlot.date} • {selectedSlot.start} - {selectedSlot.end}</div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Tipo di guida</label>
        <select className="w-full border rounded-md px-3 py-2" value={guideType} onChange={(e)=>setGuideType(e.target.value)}>
          <option value="standard">Standard</option>
          <option value="A">{labels.A} (A)</option>
          <option value="B">{labels.B} (B)</option>
          <option value="C">{labels.C} (C)</option>
        </select>
      </div>

      {role === 'admin' && (
        <div>
          <label className="block text-sm text-gray-600 mb-1">Seleziona studente</label>
          {students && students.length ? (
            <select className="w-full border rounded-md px-3 py-2" value={pickedStudent} onChange={(e)=>setPickedStudent(e.target.value)}>
              <option value="">— scegli studente —</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
            </select>
          ) : (
            <div className="text-sm text-amber-600">Registra uno studente per continuare</div>
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={submit} disabled={loading || (role==='admin' && !(students?.length))} className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Prenoto...' : 'Conferma prenotazione'}
      </button>
    </div>
  )
}
