import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

export default function Clientes({ user, onLogout }:{ user:any, onLogout?: ()=>void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Ver clientes" />

      <div className="flex pt-24">
        {user?.role === 'admin' && <Sidebar user={user} onLogout={onLogout} />}

        <main className="flex-1 p-8 md:ml-64">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Ver clientes</h2>
            <div className="bg-white rounded-lg shadow p-4">Aquí ira la lista de clientes.</div>
          </div>
        </main>
      </div>
    </div>
  )
}
