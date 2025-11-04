import React, { useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL

export default function LoginPanel({ onAuth }) {
  const [isAdmin, setIsAdmin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/${isAdmin ? 'login_admin' : 'login_student'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Errore di accesso')
      onAuth({ token: data.token, role: data.role })
      setPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setIsAdmin(true)} className={`px-3 py-1.5 rounded-md text-sm ${isAdmin ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Amministratore</button>
        <button onClick={() => setIsAdmin(false)} className={`px-3 py-1.5 rounded-md text-sm ${!isAdmin ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Studente</button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600">Email</label>
          <input type="email" className="mt-1 w-full border rounded-md px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Password</label>
          <input type="password" className="mt-1 w-full border rounded-md px-3 py-2" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700 disabled:opacity-50">{loading ? 'Accesso...' : 'Accedi'}</button>
      </form>
    </div>
  )
}
