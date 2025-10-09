import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import sample from '../data'
import { useState, useRef } from 'react'

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
  sucursales?: Array<{
    id: string
    name: string
    address: string
    mapImage: string
  }>
}

export default function ReportesVibraciones({ user, onLogout }:{ user:any, onLogout?: ()=>void }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [machinePoints, setMachinePoints] = useState<Array<{id: string, x: number, y: number, machineId: string}>>([])
  const [selectedMachinePoint, setSelectedMachinePoint] = useState<string | null>(null)
  const [showMachineModal, setShowMachineModal] = useState(false)
  const [showAddMachineForm, setShowAddMachineForm] = useState(false)
  const [draggingPoint, setDraggingPoint] = useState<string | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const companies = (sample as any).companies as Company[]
  const users = (sample as any).users as User[]
  const [localMachines, setLocalMachines] = useState<any[]>((sample as any).machines as any[])

  const openCompany = (companyId: string) => {
    setSelectedCompanyId(companyId)
    setSelectedBranch(null)
  }

  const openBranch = (branch: any) => {
    setSelectedBranch(branch)
    // Cargar puntos guardados de localStorage
    const savedPoints = localStorage.getItem(`machinePoints_${branch.id}`)
    if (savedPoints) {
      setMachinePoints(JSON.parse(savedPoints))
    } else {
      setMachinePoints([])
    }
  }

  const closeModal = () => {
    setSelectedCompanyId(null)
    setSelectedBranch(null)
    setMachinePoints([])
  }

  const addMachinePoint = () => {
    // Abrir formulario para crear nueva máquina
    setShowAddMachineForm(true)
  }

  const createNewMachine = (machineData: any) => {
    const newMachine = {
      id: `m${Date.now()}`,
      companyId: selectedCompanyId,
      branchId: selectedBranch.id,
      location: selectedBranch.name,
      ...machineData
    }
    
    const updatedMachines = [...localMachines, newMachine]
    setLocalMachines(updatedMachines)
    
    // Guardar en localStorage
    localStorage.setItem('machines', JSON.stringify(updatedMachines))
    
    // Crear punto en el mapa para la nueva máquina
    const newPoint = {
      id: `point_${Date.now()}`,
      x: 50,
      y: 50,
      machineId: newMachine.id
    }
    const updatedPoints = [...machinePoints, newPoint]
    setMachinePoints(updatedPoints)
    saveMachinePoints(updatedPoints)
    
    // Cerrar formulario
    setShowAddMachineForm(false)
  }

  const saveMachinePoints = (points: any[]) => {
    if (selectedBranch) {
      localStorage.setItem(`machinePoints_${selectedBranch.id}`, JSON.stringify(points))
    }
  }

  const handlePointMouseDown = (pointId: string, e: React.MouseEvent) => {
    if (!isEditMode) {
      // Si no está en modo edición, mostrar modal
      setSelectedMachinePoint(pointId)
      setShowMachineModal(true)
      return
    }
    e.stopPropagation()
    setDraggingPoint(pointId)
  }

  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingPoint || !isEditMode || !imageRef.current) return

    const imgRect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - imgRect.left) / imgRect.width) * 100
    const y = ((e.clientY - imgRect.top) / imgRect.height) * 100

    // Solo actualizar si el punto está dentro de los límites de la imagen
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      const updatedPoints = machinePoints.map(point =>
        point.id === draggingPoint
          ? { ...point, x, y }
          : point
      )
      setMachinePoints(updatedPoints)
    }
  }

  const handleMapMouseUp = () => {
    if (draggingPoint) {
      saveMachinePoints(machinePoints)
      setDraggingPoint(null)
    }
  }

  const deleteMachinePoint = (pointId: string) => {
    const updatedPoints = machinePoints.filter(p => p.id !== pointId)
    setMachinePoints(updatedPoints)
    saveMachinePoints(updatedPoints)
  }

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null

  // Breadcrumb component
  const Breadcrumb = () => {
    const parts = []
    if (selectedCompanyId) {
      parts.push(
        <span key="company" className="text-sky-600 hover:underline cursor-pointer" onClick={() => {
          setSelectedBranch(null)
        }}>{selectedCompany?.name}</span>
      )
    }
    if (selectedBranch) {
      parts.push(<span key="sep1" className="mx-2 text-gray-400">/</span>)
      parts.push(
        <span key="branch" className="text-gray-700">{selectedBranch.name}</span>
      )
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
      <Navbar title="Reportes de Vibraciones" />

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
                        const companyMachines = localMachines.filter(m => m.companyId === company.id)
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
                                <span className="text-gray-600">Usuarios</span>
                                <span className="font-semibold text-gray-700">{clients.length}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Sucursales</span>
                                <span className="font-semibold text-gray-700">{branches.length}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Máquinas</span>
                                <span className="font-semibold text-gray-700">{companyMachines.length}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : !selectedBranch ? (
                  <div>
                    <Breadcrumb />
                    <h2 className="text-2xl font-semibold mb-4">Sucursales de {selectedCompany?.name}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedCompany?.sucursales?.map((branch: any) => {
                        const branchMachines = localMachines.filter(m => m.companyId === selectedCompanyId && m.branchId === branch.id)
                        
                        return (
                          <div key={branch.id} className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openBranch(branch)}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-lg font-bold text-slate-800">{branch.name}</div>
                                <div className="text-xs text-gray-500">{branch.address}</div>
                              </div>
                              <div className="h-10 w-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold">📍</div>
                            </div>

                            <div className="mt-4 pt-4 border-t">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Máquinas</span>
                                <span className="font-semibold text-gray-700">{branchMachines.length}</span>
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
                    
                    {/* Controles superiores */}
                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={addMachinePoint}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <span className="text-lg">+</span>
                        Agregar Máquina
                      </button>
                      
                      <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                          isEditMode 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {isEditMode ? '🔓 Desbloquear Posición' : '🔒 Bloquear Posición'}
                      </button>

                      <div className="flex-1"></div>
                      
                      <div className="text-sm text-gray-600 flex items-center">
                        {machinePoints.length} máquina{machinePoints.length !== 1 ? 's' : ''} en el mapa
                      </div>
                    </div>

                    {/* Contenedor del mapa */}
                    <div 
                      ref={mapContainerRef}
                      className="relative bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center"
                      style={{ height: 'calc(100vh - 300px)' }}
                      onMouseMove={handleMapMouseMove}
                      onMouseUp={handleMapMouseUp}
                      onMouseLeave={handleMapMouseUp}
                    >
                      {/* Contenedor de la imagen con posición relativa para los puntos */}
                      <div className="relative inline-block">
                        <img 
                          ref={imageRef}
                          src={selectedBranch.mapImage} 
                          alt={`Mapa de ${selectedBranch.name}`}
                          className="max-w-full max-h-full object-contain pointer-events-none select-none"
                          draggable={false}
                        />
                        
                        {/* Puntos de máquinas - posicionados relativos a la imagen */}
                        {machinePoints.map(point => (
                          <div
                            key={point.id}
                            className={`absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 ${
                              isEditMode ? 'cursor-move' : 'cursor-pointer'
                            }`}
                            style={{ 
                              left: `${point.x}%`, 
                              top: `${point.y}%`,
                              zIndex: draggingPoint === point.id ? 50 : 10
                            }}
                            onMouseDown={(e) => handlePointMouseDown(point.id, e)}
                          >
                            {/* Pin de ubicación */}
                            <div className="relative">
                              <div className={`absolute inset-0 rounded-full ${
                                draggingPoint === point.id ? 'bg-blue-500' : 'bg-red-500'
                              } opacity-20 animate-ping`}></div>
                              <div className={`relative w-8 h-8 rounded-full ${
                                draggingPoint === point.id ? 'bg-blue-600' : 'bg-red-600'
                              } border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm`}>
                                ⚙️
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Modal de información de máquina */}
                    {showMachineModal && selectedMachinePoint && (
                      <div 
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowMachineModal(false)}
                      >
                        <div 
                          className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Información de Máquina</h3>
                            <button
                              onClick={() => setShowMachineModal(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="space-y-4">
                            {(() => {
                              const machine = localMachines.find(
                                m => m.id === machinePoints.find(p => p.id === selectedMachinePoint)?.machineId
                              )
                              return machine ? (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="space-y-3 text-sm">
                                    <div className="flex items-start">
                                      <span className="font-semibold text-gray-700 w-24">Nombre:</span>
                                      <span className="text-gray-900">{machine.name}</span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="font-semibold text-gray-700 w-24">Modelo:</span>
                                      <span className="text-gray-900">{machine.model}</span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="font-semibold text-gray-700 w-24">Serial:</span>
                                      <span className="text-gray-900">{machine.serial}</span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className="font-semibold text-gray-700 w-24">Ubicación:</span>
                                      <span className="text-gray-900">{machine.location}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 text-sm">
                                  ⚠️ Esta máquina no tiene información asociada
                                </div>
                              )
                            })()}

                            <div className="flex gap-2 pt-4">
                              <button
                                onClick={() => {
                                  deleteMachinePoint(selectedMachinePoint)
                                  setShowMachineModal(false)
                                  setSelectedMachinePoint(null)
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                              >
                                Eliminar Punto
                              </button>
                              <button
                                onClick={() => setShowMachineModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                              >
                                Cerrar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Formulario para agregar nueva máquina */}
                    {showAddMachineForm && (
                      <div 
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowAddMachineForm(false)}
                      >
                        <div 
                          className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Agregar Nueva Máquina</h3>
                            <button
                              onClick={() => setShowAddMachineForm(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>

                          <form 
                            onSubmit={(e) => {
                              e.preventDefault()
                              const formData = new FormData(e.currentTarget)
                              const machineData = {
                                name: formData.get('name'),
                                serial: formData.get('serial'),
                                model: formData.get('model')
                              }
                              createNewMachine(machineData)
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de la Máquina *
                              </label>
                              <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: Motor Trifásico Principal"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Serie *
                              </label>
                              <input
                                type="text"
                                name="serial"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: MTR-TRI-5574"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Modelo *
                              </label>
                              <input
                                type="text"
                                name="model"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: ABB M3BP 280 SMB4 - 90kW"
                              />
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                              <p><strong>Empresa:</strong> {selectedCompany?.name}</p>
                              <p><strong>Sucursal:</strong> {selectedBranch?.name}</p>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <button
                                type="button"
                                onClick={() => setShowAddMachineForm(false)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                              >
                                Crear y Posicionar
                              </button>
                            </div>
                          </form>
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
