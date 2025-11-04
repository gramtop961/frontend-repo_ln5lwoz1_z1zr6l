import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import LoginPanel from './components/LoginPanel'
import CalendarWeek from './components/CalendarWeek'
import BookingPanel from './components/BookingPanel'
import AdminPanel from './components/AdminPanel'

const API = import.meta.env.VITE_BACKEND_URL

export default function App() {
  const [auth, setAuth] = useState(null) // {token, role}
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [students, setStudents] = useState([])
  const [settings, setSettings] = useState({ school_name: 'Autoscuola Missori', guide_labels: { A: 'Notturna', B: 'Extraurbana', C: 'Autostrada' } })

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API}/settings`)
      const data = await res.json()
      setSettings(data)
    } catch {}
  }

  useEffect(()=>{ loadSettings() }, [])

  useEffect(()=>{
    const loadStudents = async () => {
      if (auth?.role !== 'admin') { setStudents([]); return }
      const res = await fetch(`${API}/students`, { headers: { 'x-token': auth.token } })
      if (res.ok) setStudents(await res.json())
    }
    loadStudents()
  }, [auth, refreshKey])

  const onBooked = () => {
    setSelectedSlot(null)
    setRefreshKey(x=>x+1)
  }

  const logout = () => setAuth(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header schoolName={settings?.school_name} role={auth?.role} onLogout={logout} />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {!auth && (
          <div className="max-w-md mx-auto">
            <LoginPanel onAuth={setAuth} />
            <p className="text-center text-sm text-gray-600 mt-4">Accedi come amministratore o studente per visualizzare il calendario e prenotare.</p>
          </div>
        )}

        {auth && auth.role === 'student' && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <CalendarWeek token={auth.token} role={auth.role} onSelectSlot={setSelectedSlot} refreshKey={refreshKey} />
            </div>
            <div className="md:col-span-1 space-y-4">
              <BookingPanel token={auth.token} role={auth.role} selectedSlot={selectedSlot} onBooked={onBooked} guideLabels={settings?.guide_labels} />
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-semibold mb-2">Regole prenotazione</h3>
                <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
                  <li>Massimo due lezioni al giorno</li>
                  <li>Lezioni non consecutive nello stesso giorno</li>
                  <li>Cancellazione consentita fino a 24 ore prima</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {auth && auth.role === 'admin' && (
          <div className="space-y-4">
            <CalendarWeek token={auth.token} role={auth.role} onSelectSlot={setSelectedSlot} refreshKey={refreshKey} />
            <BookingPanel token={auth.token} role={auth.role} selectedSlot={selectedSlot} onBooked={onBooked} students={students} guideLabels={settings?.guide_labels} />
            <AdminPanel token={auth.token} refresh={refreshKey} onSettingsChange={setSettings} />
          </div>
        )}
      </main>
    </div>
  )
}
