import Sidebar from '../components/ClientSidebar'
import Navbar from '../components/Navbar'
import sample from '../data'

export default function MiEmpresa({ user, onLogout }:{ user:any, onLogout?: ()=>void }) {
  const companies = (sample as any).companies as any[]
  const machines = (sample as any).machines as any[]

  const company = companies.find(c => c.id === user.companyId)

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="Mi Empresa" companyName={undefined} />
        <div className="pt-24 p-8">
          <div className="bg-white rounded-lg shadow p-6">No se encontró la empresa asociada a este usuario.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Mi Empresa" companyName={company.name} />

      <div className="flex pt-24">
        <Sidebar user={user} onLogout={onLogout} />

        <main className="flex-1 p-8 md:ml-64">
          <div className="fixed top-29 left-[280px] right-8 z-30 bg-white shadow rounded-lg md:rounded-xl border border-slate-100 h-[88.5%] overflow-auto">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">{company.name}</h2>
              {company.ruc_or_identifier && <div className="text-sm text-gray-500 mb-2">{company.ruc_or_identifier}</div>}
              {company.address && <div className="text-sm text-gray-500 mb-4">{company.address}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-semibold mb-2">Sucursales</h3>
                  <div className="space-y-3">
                    {(company.sucursales || []).map((s: any) => (
                      <div key={s.id} className="border rounded p-3">
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-sm text-gray-500">{s.address}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-semibold mb-2">Máquinas</h3>
                  <div className="space-y-3">
                    {machines.filter(m => m.companyId === company.id).map(m => (
                      <div key={m.id} className="border rounded p-3">
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-xs text-gray-500">{m.model} • {m.serial}</div>
                        <div className="text-sm text-gray-600 mt-1">Ubicación: {m.location}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
