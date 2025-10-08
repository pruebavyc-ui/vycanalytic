import './App.css'
import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import IngresarReportes from './pages/IngresarReportes'
import ExportarReportes from './pages/ExportarReportes'
import IngresarUsuarios from './pages/IngresarUsuarios'

function ProtectedRoute({ user, children }:{ user:any, children: any }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  // persist user in localStorage so reloads keep the session
  const [user, setUser] = useState<any | null>(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })

  const handleLogin = (u: any) => {
    setUser(u)
    try { localStorage.setItem('user', JSON.stringify(u)) } catch (e) { /* ignore */ }
  }

  const handleLogout = () => {
    setUser(null)
    try { localStorage.removeItem('user') } catch (e) { /* ignore */ }
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard user={user} onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/clientes" element={<ProtectedRoute user={user}><Clientes user={user} onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/ingresar-reportes" element={<ProtectedRoute user={user}><IngresarReportes user={user} onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/exportar-reportes" element={<ProtectedRoute user={user}><ExportarReportes user={user} onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/ingresar-usuarios" element={<ProtectedRoute user={user}><IngresarUsuarios user={user} onLogout={handleLogout} /></ProtectedRoute>} />

        <Route path="*" element={<div className="p-8">Página no encontrada</div>} />
      </Routes>
    </HashRouter>
  )
}

export default App
