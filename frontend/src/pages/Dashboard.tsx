import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import sample from '../data'

export default function Dashboard({ user, onLogout }:{ user: any, onLogout: ()=>void }) {
  const companiesCount = ((sample as any).companies || []).length
  const reportsCount = ((sample as any).reports || []).length

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Dashboard" />

      <div className="flex pt-24">
        {user?.role === 'admin' && <Sidebar user={user} onLogout={onLogout} />}

        <main className="flex-1 p-8 md:ml-64">
          <div className="fixed top-29 left-[280px] right-8 z-30 p-4 bg-white shadow rounded-lg md:rounded-xl border border-slate-100 h-[88.5%] ">
            <h1 className="text-3xl font-bold mb-6">Bienvenido, {user?.name}</h1>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500">Clientes</div>
                <div className="text-2xl font-semibold">{companiesCount}</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500">Reportes</div>
                <div className="text-2xl font-semibold">{reportsCount}</div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
