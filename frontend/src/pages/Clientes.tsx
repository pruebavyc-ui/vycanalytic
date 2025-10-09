import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import sample from '../data/sample.json'
import { useState } from 'react'

type User = {
  id: string
  name: string
  email: string
  role: string
  companyId?: string | null
}

type Company = {
  id: string
  name: string
  ruc_or_identifier?: string
  address?: string
}

type Report = {
  id: string
  title: string
  reportDate: string
  reportNumber: string
  machineId: string
  companyId: string
  description?: string
  technician?: string
  status?: string
}

export default function Clientes({ user, onLogout }:{ user:any, onLogout?: ()=>void }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const companies = (sample as any).companies as Company[]
  const users = (sample as any).users as User[]
  const machines = (sample as any).machines as any[]
  const reports = (sample as any).reports as any[]

  const openCompany = (companyId: string) => {
    setSelectedCompanyId(companyId)
    setSelectedBranch(null)
    setSelectedMachineId(null)
    setSelectedReport(null)
  }

  const closeModal = () => {
    setSelectedCompanyId(null)
    setSelectedBranch(null)
    setSelectedMachineId(null)
    setSelectedReport(null)
  }

  const openBranch = (branch: string) => {
    setSelectedBranch(branch)
    setSelectedMachineId(null)
    setSelectedReport(null)
  }

  const openMachine = (machineId: string) => {
    setSelectedMachineId(machineId)
    setSelectedReport(null)
  }

  const openReport = (report: Report) => {
    setSelectedReport(report)
  }

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null
  const selectedMachine = machines.find(m => m.id === selectedMachineId) || null

  // Breadcrumb component
  const Breadcrumb = () => {
    const parts = []
    if (selectedCompanyId) {
      parts.push(
        <span key="company" className="text-sky-600 hover:underline cursor-pointer" onClick={() => {
          setSelectedBranch(null)
          setSelectedMachineId(null)
          setSelectedReport(null)
        }}>{selectedCompany?.name}</span>
      )
    }
    if (selectedBranch) {
      parts.push(<span key="sep1" className="mx-2 text-gray-400">/</span>)
      parts.push(
        <span key="branch" className="text-sky-600 hover:underline cursor-pointer" onClick={() => {
          setSelectedMachineId(null)
          setSelectedReport(null)
        }}>{selectedBranch}</span>
      )
    }
    if (selectedMachineId) {
      parts.push(<span key="sep2" className="mx-2 text-gray-400">/</span>)
      parts.push(
        <span key="machine" className="text-sky-600 hover:underline cursor-pointer" onClick={() => {
          setSelectedReport(null)
        }}>{selectedMachine?.name}</span>
      )
    }
    if (selectedReport) {
      parts.push(<span key="sep3" className="mx-2 text-gray-400">/</span>)
      parts.push(<span key="report" className="text-gray-700">{selectedReport.reportNumber}</span>)
    }

    return parts.length > 0 ? (
      <div className="flex items-center text-sm mb-4">
        <button onClick={closeModal} className="text-sky-500 hover:underline mr-2">← Empresas</button>
        <span className="mx-2 text-gray-400">/</span>
        {parts}
      </div>
    ) : null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Ver clientes" />

      <div className="flex pt-24">
        {user?.role === 'admin' && <Sidebar user={user} onLogout={onLogout} />}

        <main className="flex-1 p-8 md:ml-64">
          <div className="fixed top-29 left-[280px] right-8 z-30 bg-white shadow rounded-lg md:rounded-xl border border-slate-100 h-[88.5%] ">
            <div className="p-6 h-full overflow-auto">
                {!selectedCompany ? (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Empresas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {companies.map(company => {
                        const clients = users.filter(u => u.role === 'client' && u.companyId === company.id)
                        const companyMachines = machines.filter(m => m.companyId === company.id)
                        const branches = Array.from(new Set(companyMachines.map(m => m.location)))
                        
                        return (
                          <div key={company.id} className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openCompany(company.id)}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-lg font-bold text-slate-800">{company.name}</div>
                                <div className="text-xs text-gray-500">{company.ruc_or_identifier || ''}</div>
                                {company.address && <div className="text-xs text-gray-400">{company.address}</div>}
                              </div>
                              <div className="h-10 w-10 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center font-semibold">{company.name.charAt(0)}</div>
                            </div>

                            <div className="mt-4 pt-4 border-t space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">📍 Sucursales</span>
                                <span className="font-medium text-gray-700">{branches.length}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">🖨️ Máquinas</span>
                                <span className="font-medium text-gray-700">{companyMachines.length}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">👥 Clientes</span>
                                <span className="font-medium text-gray-700">{clients.length}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Breadcrumb />

                    {!selectedBranch ? (
                      <div>
                        <div className="mb-6 pb-6 border-b">
                          <h3 className="text-2xl font-bold text-slate-800">{selectedCompany.name}</h3>
                          {selectedCompany.ruc_or_identifier && <div className="text-sm text-gray-500 mt-1">RUC: {selectedCompany.ruc_or_identifier}</div>}
                          {selectedCompany.address && <div className="text-sm text-gray-500">📍 {selectedCompany.address}</div>}
                        </div>

                        <h4 className="text-lg font-semibold mb-4">Sucursales</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Array.from(new Set(machines.filter(m => m.companyId === selectedCompany.id).map(m => m.location))).map(loc => {
                            const branchMachines = machines.filter(m => m.companyId === selectedCompany.id && m.location === loc)
                            const branchReports = reports.filter(r => branchMachines.some(m => m.id === r.machineId))
                            
                            return (
                              <div 
                                key={loc} 
                                className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow bg-gradient-to-br from-white to-sky-50"
                                onClick={() => openBranch(loc)}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <div className="font-semibold text-lg">📍 {loc}</div>
                                    <div className="text-xs text-gray-500">Ubicación</div>
                                  </div>
                                  <button className="px-3 py-1 rounded-md bg-sky-500 text-white text-sm hover:bg-sky-600">
                                    Ver →
                                  </button>
                                </div>
                                <div className="flex gap-4 text-xs text-gray-600 mt-3 pt-3 border-t">
                                  <div>🖨️ {branchMachines.length} máquinas</div>
                                  <div>📄 {branchReports.length} reportes</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : !selectedMachineId ? (
                      <div>
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-slate-800">📍 {selectedBranch}</h3>
                          <div className="text-sm text-gray-500">{selectedCompany.name}</div>
                        </div>

                        <h4 className="text-lg font-semibold mb-4">Máquinas</h4>
                        <div className="space-y-3">
                          {machines.filter(m => m.companyId === selectedCompany.id && m.location === selectedBranch).map(m => {
                            const machineReports = reports.filter(r => r.machineId === m.id)
                            
                            return (
                              <div 
                                key={m.id} 
                                className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow bg-white"
                                onClick={() => openMachine(m.id)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-semibold text-lg">🖨️ {m.name}</div>
                                    <div className="text-sm text-gray-600">{m.model}</div>
                                    <div className="text-xs text-gray-400 mt-1">Serial: {m.serial}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-sky-600">{machineReports.length}</div>
                                    <div className="text-xs text-gray-500">reportes</div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : !selectedMachineId ? (
                      <div>
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-slate-800">📍 {selectedBranch}</h3>
                          <div className="text-sm text-gray-500">{selectedCompany.name}</div>
                        </div>

                        <h4 className="text-lg font-semibold mb-4">Máquinas</h4>
                        <div className="space-y-3">
                          {machines.filter(m => m.companyId === selectedCompany.id && m.location === selectedBranch).map(m => {
                            const machineReports = reports.filter(r => r.machineId === m.id)
                            
                            return (
                              <div 
                                key={m.id} 
                                className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow bg-white"
                                onClick={() => openMachine(m.id)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-semibold text-lg">🖨️ {m.name}</div>
                                    <div className="text-sm text-gray-600">{m.model}</div>
                                    <div className="text-xs text-gray-400 mt-1">Serial: {m.serial}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-sky-600">{machineReports.length}</div>
                                    <div className="text-xs text-gray-500">reportes</div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : !selectedReport ? (
                      <div>
                        <div className="mb-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-slate-800">🖨️ {selectedMachine?.name}</h3>
                              <div className="text-sm text-gray-600 mt-1">{selectedMachine?.model}</div>
                              <div className="text-xs text-gray-400">Serial: {selectedMachine?.serial}</div>
                            </div>
                          </div>
                        </div>

                        <h4 className="text-lg font-semibold mb-4">Reportes</h4>
                        <div className="space-y-3">
                          {reports.filter(r => r.machineId === selectedMachineId).map(r => (
                            <div 
                              key={r.id} 
                              className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-all bg-white hover:border-sky-300"
                              onClick={() => openReport(r as Report)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-slate-800">{r.title}</div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    📄 {r.reportNumber} • 📅 {r.reportDate}
                                  </div>
                                  {(r as any).presentedBy && (
                                    <div className="text-xs text-gray-400 mt-1">👤 {(r as any).presentedBy}</div>
                                  )}
                                </div>
                                <div className="text-sky-500 text-lg">→</div>
                              </div>
                            </div>
                          ))}
                          {reports.filter(r => r.machineId === selectedMachineId).length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                              <div className="text-4xl mb-2">📭</div>
                              <div className="text-sm">No hay reportes disponibles para esta máquina</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Vista Detalle del Reporte */}
                        <div className="space-y-6">
                          {/* Encabezado del Reporte */}
                          <div className="border-b pb-4">
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">{selectedReport.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>📄 {selectedReport.reportNumber}</span>
                              <span>📅 {selectedReport.reportDate}</span>
                            </div>
                          </div>

                          {/* Información General */}
                          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Máquina</div>
                              <div className="text-sm font-medium">{selectedMachine?.name}</div>
                              <div className="text-xs text-gray-500">{selectedMachine?.model}</div>
                              <div className="text-xs text-gray-400">S/N: {selectedMachine?.serial}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Empresa</div>
                              <div className="text-sm font-medium">{selectedCompany?.name}</div>
                              <div className="text-xs text-gray-500">📍 {selectedBranch}</div>
                            </div>
                          </div>

                          {/* Detalles del Reporte */}
                          {(selectedReport as any).route && (
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Ruta</div>
                                <div>{(selectedReport as any).route}</div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Planta</div>
                                <div>{(selectedReport as any).plant}</div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">OT / Plan</div>
                                <div>{(selectedReport as any).planNumber_or_OT}</div>
                              </div>
                            </div>
                          )}

                          {/* Áreas */}
                          {(selectedReport as any).areas && (selectedReport as any).areas.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Áreas</div>
                              <div className="flex flex-wrap gap-2">
                                {(selectedReport as any).areas.map((area: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Personal */}
                          <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded">
                            {(selectedReport as any).presentedBy && (
                              <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Presentado por</div>
                                <div>{(selectedReport as any).presentedBy}</div>
                              </div>
                            )}
                            {(selectedReport as any).reviewedBy && (
                              <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Revisado por</div>
                                <div>{(selectedReport as any).reviewedBy}</div>
                              </div>
                            )}
                            {(selectedReport as any).addressedTo && (
                              <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Dirigido a</div>
                                <div>{(selectedReport as any).addressedTo}</div>
                              </div>
                            )}
                          </div>

                          {/* Observaciones */}
                          {(selectedReport as any).observations && (selectedReport as any).observations.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <span className="text-blue-500">📋</span> Observaciones
                              </h4>
                              <div className="space-y-2">
                                {(selectedReport as any).observations.map((obs: any, idx: number) => (
                                  <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                    <div className="text-sm text-gray-700">{obs.text}</div>
                                    <div className="text-xs text-gray-500 mt-1">📅 {obs.date}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recomendaciones Generales */}
                          {(selectedReport as any).generalRecommendations && (selectedReport as any).generalRecommendations.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <span className="text-green-500">💡</span> Recomendaciones Generales
                              </h4>
                              <div className="space-y-3">
                                {(selectedReport as any).generalRecommendations.map((rec: any, idx: number) => (
                                  <div key={idx} className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="text-xs font-semibold text-green-700 uppercase">Para: {rec.to}</div>
                                      <div className="text-xs text-gray-500">{rec.date}</div>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-2">{rec.text}</div>
                                    <div className="text-xs text-gray-500">Analizado por: {rec.analyzedBy}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Items del Reporte */}
                          {(selectedReport as any).items && (selectedReport as any).items.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <span className="text-purple-500">🔧</span> Items de Inspección
                              </h4>
                              <div className="space-y-4">
                                {(selectedReport as any).items.map((item: any, idx: number) => (
                                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 border-b">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <span className="inline-block px-2 py-1 bg-purple-500 text-white rounded text-xs font-bold mr-2">
                                            #{item.itemNumber}
                                          </span>
                                          <span className="font-semibold text-gray-800">{item.tagOrDescription}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="p-4 space-y-3">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Condición Antes</div>
                                          <div className="font-medium text-gray-700">{item.conditionBefore}</div>
                                        </div>
                                        <div>
                                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Condición Después</div>
                                          <div className="font-medium text-gray-700">{item.conditionAfter}</div>
                                        </div>
                                      </div>

                                      {item.diagnosis && (
                                        <div>
                                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">🔍 Diagnóstico</div>
                                          <div className="text-sm bg-blue-50 p-3 rounded border border-blue-100">{item.diagnosis}</div>
                                        </div>
                                      )}

                                      {item.recommendation && (
                                        <div>
                                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">✅ Recomendación</div>
                                          <div className="text-sm bg-green-50 p-3 rounded border border-green-100">{item.recommendation}</div>
                                        </div>
                                      )}

                                      {item.images && item.images.length > 0 && (
                                        <div>
                                          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">📷 Imágenes</div>
                                          <div className="grid grid-cols-3 gap-2">
                                            {item.images.map((img: string, imgIdx: number) => (
                                              <img 
                                                key={imgIdx} 
                                                src={img} 
                                                alt={`Item ${item.itemNumber} - Imagen ${imgIdx + 1}`}
                                                className="w-full h-24 object-cover rounded border hover:scale-105 transition-transform cursor-pointer"
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Descripción Legacy (si existe y no hay items) */}
                          {selectedReport.description && !(selectedReport as any).items && (
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Descripción</div>
                              <div className="text-sm bg-gray-50 rounded p-4 border">
                                {selectedReport.description}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Additional stateful UI: modal implemented as a separate default export would be heavy; we keep logic in this module by re-exporting a wrapper component.
