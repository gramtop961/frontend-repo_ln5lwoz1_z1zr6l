import React, { useEffect, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL

export default function AdminPanel({ token, refresh, onSettingsChange }) {
  const [students, setStudents] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState(null)
  const [ovDate, setOvDate] = useState('')
  const [ovStart, setOvStart] = useState('10:20')
  const [ovEnd, setOvEnd] = useState('11:20')
  const [ovEnabled, setOvEnabled] = useState(true)

  const load = async () => {
    const sres = await fetch(`${API}/settings`)
    const sdata = await sres.json()
    setSettings(sdata)

    const res = await fetch(`${API}/students`, { headers: { 'x-token': token } })
    if (res.ok) {
      const data = await res.json()
      setStudents(data)
    }
  }

  useEffect(()=>{ load() }, [token, refresh])

  const addStudent = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-token': token },
        body: JSON.stringify({ name, email })
      })
      if (!res.ok) throw new Error('Errore creazione studente')
      setName(''); setEmail('')
      load()
    } finally { setLoading(false) }
  }

  const saveSettings = async (e) => {
    e.preventDefault()
    const body = {
      school_name: settings.school_name,
      instructor_emails: settings.instructor_emails,
      smtp_host: settings.smtp_host,
      smtp_port: Number(settings.smtp_port || 587),
      smtp_user: settings.smtp_user,
      smtp_password: settings.smtp_password && settings.smtp_password !== '*****' ? settings.smtp_password : undefined,
      smtp_use_tls: Boolean(settings.smtp_use_tls)
    }
    const res = await fetch(`${API}/settings`, { method:'PUT', headers: { 'Content-Type':'application/json', 'x-token': token }, body: JSON.stringify(body) })
    const data = await res.json()
    setSettings(data)
    onSettingsChange && onSettingsChange(data)
  }

  const addOverride = async (e) => {
    e.preventDefault()
    const res = await fetch(`${API}/slots`, { method:'POST', headers: { 'Content-Type':'application/json', 'x-token': token }, body: JSON.stringify({ date: ovDate, start: ovStart, end: ovEnd, enabled: ovEnabled })})
    if (res.ok) alert('Fascia aggiornata')
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        <h3 className="font-semibold">Gestione studenti</h3>
        <form onSubmit={addStudent} className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm text-gray-600">Nome e Cognome</label>
            <input className="mt-1 w-full border rounded-md px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input type="email" className="mt-1 w-full border rounded-md px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <button disabled={loading} className="bg-indigo-600 text-white rounded-md py-2">Aggiungi studente</button>
        </form>
        <div className="text-sm text-gray-600">{students.length ? `${students.length} studenti registrati` : 'Registra uno studente per continuare'}</div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        <h3 className="font-semibold">Impostazioni scuola</h3>
        {settings && (
          <form onSubmit={saveSettings} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600">Nome autoscuola</label>
              <input className="mt-1 w-full border rounded-md px-3 py-2" value={settings.school_name || ''} onChange={(e)=>setSettings({ ...settings, school_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Email istruttori (separate da virgola)</label>
              <input className="mt-1 w-full border rounded-md px-3 py-2" value={(settings.instructor_emails || []).join(', ')} onChange={(e)=>setSettings({ ...settings, instructor_emails: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600">SMTP Host</label>
                <input className="mt-1 w-full border rounded-md px-3 py-2" value={settings.smtp_host || ''} onChange={(e)=>setSettings({ ...settings, smtp_host: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600">SMTP Porta</label>
                <input className="mt-1 w-full border rounded-md px-3 py-2" value={settings.smtp_port || ''} onChange={(e)=>setSettings({ ...settings, smtp_port: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600">SMTP Utente</label>
                <input className="mt-1 w-full border rounded-md px-3 py-2" value={settings.smtp_user || ''} onChange={(e)=>setSettings({ ...settings, smtp_user: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600">SMTP Password</label>
                <input className="mt-1 w-full border rounded-md px-3 py-2" type="password" value={settings.smtp_password || ''} onChange={(e)=>setSettings({ ...settings, smtp_password: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="tls" type="checkbox" checked={!!settings.smtp_use_tls} onChange={(e)=>setSettings({ ...settings, smtp_use_tls: e.target.checked })} />
              <label htmlFor="tls" className="text-sm text-gray-700">Usa TLS</label>
            </div>
            <button className="bg-indigo-600 text-white rounded-md py-2 px-3">Salva impostazioni</button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-4 md:col-span-2">
        <h3 className="font-semibold">Gestione fasce orarie</h3>
        <form onSubmit={addOverride} className="grid md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-600">Data</label>
            <input type="date" className="mt-1 w-full border rounded-md px-3 py-2" value={ovDate} onChange={(e)=>setOvDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Inizio</label>
            <input className="mt-1 w-full border rounded-md px-3 py-2" value={ovStart} onChange={(e)=>setOvStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Fine</label>
            <input className="mt-1 w-full border rounded-md px-3 py-2" value={ovEnd} onChange={(e)=>setOvEnd(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input id="en" type="checkbox" checked={ovEnabled} onChange={(e)=>setOvEnabled(e.target.checked)} />
            <label htmlFor="en" className="text-sm text-gray-700">Abilitato</label>
          </div>
          <button className="bg-indigo-600 text-white rounded-md py-2 px-3">Applica</button>
        </form>
        <p className="text-xs text-gray-500">Nota: il mercoledì 12:30-13:30 e 15:00-16:00 sono disabilitate per impostazione predefinita; puoi modificarle qui.</p>
      </div>
    </div>
  )
}
