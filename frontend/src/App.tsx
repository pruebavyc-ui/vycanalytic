import './App.css'
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import IngresarReportes from './pages/IngresarReportes'
import ExportarReportes from './pages/ExportarReportes'
import IngresarUsuarios from './pages/IngresarUsuarios'

function App() {
  const [user, setUser] = useState<any | null>(null)

  const handleLogin = (u: any) => setUser(u)
  const handleLogout = () => setUser(null)

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="/clientes" element={<Clientes user={user} onLogout={handleLogout} />} />
        <Route path="/ingresar-reportes" element={<IngresarReportes user={user} onLogout={handleLogout} />} />
        <Route path="/exportar-reportes" element={<ExportarReportes user={user} onLogout={handleLogout} />} />
        <Route path="/ingresar-usuarios" element={<IngresarUsuarios user={user} onLogout={handleLogout} />} />
        <Route path="*" element={<div className="p-8">Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
