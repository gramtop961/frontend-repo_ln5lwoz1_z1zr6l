import React from 'react'

export default function Header({ schoolName, role, onLogout }) {
  return (
    <header className="w-full border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">AM</div>
          <div>
            <h1 className="text-lg font-semibold">{schoolName || 'Autoscuola Missori'}</h1>
            <p className="text-xs text-gray-500">Calendario lezioni di guida</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {role ? (
            <>
              <span className="text-sm text-gray-600">Accesso: {role === 'admin' ? 'Amministratore' : 'Studente'}</span>
              <button onClick={onLogout} className="px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200">Esci</button>
            </>
          ) : (
            <span className="text-sm text-gray-500">Non autenticato</span>
          )}
        </div>
      </div>
    </header>
  )
}
