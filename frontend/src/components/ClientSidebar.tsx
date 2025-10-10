import logo from '../assets/logo.png'
import { NavLink, useNavigate } from 'react-router-dom'

export default function ClientSidebar({ user, onLogout }:{ user:any, onLogout?: ()=>void }) {
  const navigate = useNavigate()
  const linkClass = ({ isActive }:{ isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md transition duration-150 ease-in-out ${isActive ? 'bg-sky-100 text-sky-700' : 'text-gray-700 hover:bg-sky-50 hover:translate-x-1 transform'}`

  return (
  // responsive sidebar: full width on small screens, fixed on the left on md+
  <aside className="w-full md:w-56 bg-white shadow rounded-lg md:rounded-xl overflow-hidden p-4 flex flex-col justify-between md:h-[calc(100vh-4rem)] md:fixed md:left-8 md:top-8 md:bottom-8 md:z-20">
      <div>
        <div className="flex items-center justify-center mb-8">
          <img src={logo} alt="Company logo" className="h-14 w-auto" />
        </div>

        <nav className="space-y-3 mt-6 md:mt-8">
          {/* Client sees only vibraciones and Mi Empresa */}

          <NavLink to="/reportes-vibraciones" className={linkClass}>
            📊 Reportes de Vibraciones
          </NavLink>

          <NavLink to="/mi-empresa" className={linkClass}>
            🏢 Mi Empresa
          </NavLink>
        </nav>
      </div>

      <div className="flex flex-col items-center">
        <div className="h-12 w-12 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-lg">{(user?.name || '?').charAt(0)}</div>
        <div className="mt-2 text-sm font-medium text-center">{user?.name}</div>
        <div className="text-xs text-gray-500 text-center">{user?.role}</div>
        <button
          onClick={() => {
            if (onLogout) onLogout()
            try { localStorage.removeItem('user') } catch (e) { /* ignore */ }
            navigate('/login', { replace: true })
          }}
          className="mt-3 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition duration-150"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
