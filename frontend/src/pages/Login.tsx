import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import sample from '../data'

type User = {
  id: string
  name: string
  email: string
  role: string
  password: string
  companyId: string | null
}

export default function Login({ onLogin }:{ onLogin: (user: User)=>void }) {
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        // if already logged in, redirect according to role
        const stored = JSON.parse(raw)
        if (stored?.role === 'client') {
          navigate('/reportes-vibraciones', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      }
    } catch (e) { /* ignore */ }
  }, [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const users = (sample as any).users as User[]
    const found = users.find(u => u.email === email && u.password === password)
    if (found) {
      onLogin(found)
      // redirect based on role
      if (found.role === 'client') {
        navigate('/reportes-vibraciones', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } else {
      setError('Correo o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-white/6 backdrop-blur rounded-lg p-8 shadow-lg border border-white/10">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Company logo" className="h-16 w-auto" />
        </div>

        <h2 className="text-center text-2xl font-semibold text-white mb-6">Iniciar sesión</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-400 text-center">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Correo electrónico</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="tú@ejemplo.com"
              className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Contraseña</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-white/80">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded bg-white/5" />
              Recordarme
            </label>
            <a className="text-sky-400 hover:underline" href="#">¿Olvidaste tu contraseña?</a>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 rounded-md bg-sky-500 hover:bg-sky-600 text-white font-medium"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
