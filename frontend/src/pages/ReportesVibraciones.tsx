import Sidebar from '../components/Sidebar'
import ClientSidebar from '../components/ClientSidebar'
import Navbar from '../components/Navbar'
import sample from '../data'
import logoImage from '../assets/logo.png'
import { useState, useRef } from 'react'
import { saveToJSON } from '../utils/saveToJSON'

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
  const [showAddBranchForm, setShowAddBranchForm] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [showReportDetailModal, setShowReportDetailModal] = useState(false)
  const [draggingPoint, setDraggingPoint] = useState<string | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const [localCompanies, setLocalCompanies] = useState<Company[]>((sample as any).companies as Company[])
  const users = (sample as any).users as User[]
  const [localMachines, setLocalMachines] = useState<any[]>((sample as any).machines as any[])
  const machinePositionsFromFile = (sample as any).machinePositions as any[]
  const vibrationReports = (sample as any).vibrationReports as any[]

  const openCompany = (companyId: string) => {
    setSelectedCompanyId(companyId)
    setSelectedBranch(null)
  }

  // If user is client, auto-open their company on mount
  if (user?.role === 'client' && !selectedCompanyId) {
    const clientCompanyId = user.companyId
    if (clientCompanyId) {
      setSelectedCompanyId(clientCompanyId)
    }
  }

  const openBranch = (branch: any) => {
    setSelectedBranch(branch)
    // Primero intentar cargar desde el archivo JSON
    const filePositions = machinePositionsFromFile.filter((pos: any) => pos.branchId === branch.id)
    
    // Si hay posiciones en el archivo, usarlas
    if (filePositions.length > 0) {
      setMachinePoints(filePositions)
    } else {
      // Si no hay en el archivo, intentar localStorage como fallback
      const savedPoints = localStorage.getItem(`machinePoints_${branch.id}`)
      if (savedPoints) {
        setMachinePoints(JSON.parse(savedPoints))
      } else {
        setMachinePoints([])
      }
    }
  }

  const closeModal = () => {
    setSelectedCompanyId(null)
    setSelectedBranch(null)
    setMachinePoints([])
  }

  const addBranch = () => {
    setShowAddBranchForm(true)
  }

  const createNewBranch = async (branchData: any) => {
    const newBranch = {
      id: `s${Date.now()}`,
      name: branchData.name,
      address: branchData.address,
      mapImage: "/maps/Diseño sin título.png"
    }

    const updatedCompanies = localCompanies.map(company => 
      company.id === selectedCompanyId
        ? { ...company, sucursales: [...(company.sucursales || []), newBranch] }
        : company
    )

    setLocalCompanies(updatedCompanies)

    // Guardar en el archivo JSON (solo desarrollo)
    await saveToJSON('companies.json', updatedCompanies)

    // Backup en localStorage
    localStorage.setItem('companies', JSON.stringify(updatedCompanies))

    // Cerrar formulario
    setShowAddBranchForm(false)
  }

  const addMachinePoint = () => {
    // Abrir formulario para crear nueva máquina
    setShowAddMachineForm(true)
  }

  const createNewMachine = async (machineData: any) => {
    const newMachine = {
      id: `m${Date.now()}`,
      companyId: selectedCompanyId,
      branchId: selectedBranch.id,
      location: selectedBranch.name,
      ...machineData
    }
    
    const updatedMachines = [...localMachines, newMachine]
    setLocalMachines(updatedMachines)
    
    // Guardar en el archivo JSON (solo desarrollo)
    await saveToJSON('machines.json', updatedMachines)
    
    // Backup en localStorage
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

  const saveMachinePoints = async (points: any[]) => {
    if (selectedBranch) {
      // Actualizar posiciones globales
      const allPositions = machinePositionsFromFile.filter((pos: any) => pos.branchId !== selectedBranch.id)
      const updatedPositions = [...allPositions, ...points.map(p => ({ ...p, branchId: selectedBranch.id }))]
      
      // Guardar en el archivo JSON (solo desarrollo)
      await saveToJSON('machine-positions.json', updatedPositions)
      
      // Backup en localStorage
      localStorage.setItem(`machinePoints_${selectedBranch.id}`, JSON.stringify(points))
      localStorage.setItem('allMachinePositions', JSON.stringify(updatedPositions))
    }
  }

  const handlePointMouseDown = (pointId: string, e: React.MouseEvent) => {
    // If user is not admin, always open modal (read-only)
    if (user?.role !== 'admin') {
      setSelectedMachinePoint(pointId)
      setShowMachineModal(true)
      return
    }

    if (!isEditMode) {
      // If not in edit mode, show modal
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

  // Export a report to a downloadable PDF using html2pdf.js (loaded from CDN at runtime).
  const exportReportAsPDF = async (report: any) => {
    if (!report) return

    // Resolve canonical report from vibrationReports (JSON) in case caller passed a lightweight object
    let canonicalReport = report
    const possibleIds = [report.report_id, report.reportId, report.id, report.report_id?.toString(), report.reportNumber]
    const lookupId = possibleIds.find(Boolean)
    if (lookupId && Array.isArray(vibrationReports)) {
      const found = vibrationReports.find((r: any) => (
        r.report_id === lookupId || r.report_id === report.report_id || r.report_id === report.reportId || r.reportNumber === lookupId || r.id === lookupId
      ))
      if (found) canonicalReport = found
    }

    const companyName = localCompanies.find(c => c.id === canonicalReport.company_id)?.name || ''

    // Build grouped rows HTML
    let rowsHtml = ''
  const items = canonicalReport.items || []
    const grouped: Record<string, any[]> = {}
    
    // Helper to map condition text to inline styles (background + color) — match report colors
    const conditionCellStyle = (cond: any) => {
      const s = (cond || '').toString().toLowerCase()
      let bg = '#ffffff'
      let color = '#111111'
      if (s.includes('inacept')) { bg = '#fecaca'; color = '#7f1d1d' } // light red
      else if (s.includes('alarma')) { bg = '#ffedd5'; color = '#7c2d12' } // orange
      else if (s.includes('observ')) { bg = '#fef3c7'; color = '#92400e' } // yellow
      else if (s.includes('bueno')) { bg = '#10b981'; color = '#ffffff' } // green (solid)
      else if (s.includes('medic') || s.includes('s/med') || s.includes('sin medic')) { bg = '#d1d5db'; color = '#111827' } // gray
      return `border:1px solid #ccc;padding:6px;text-align:center;background:${bg};color:${color}`
    }
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      const key = it.equipment_name || 'Sin equipo'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(it)
    }

    for (const equipment in grouped) {
      const group = grouped[equipment]
      for (let j = 0; j < group.length; j++) {
        const it = group[j]
        rowsHtml += '<tr>'
        rowsHtml += `<td style="border:1px solid #ccc;padding:6px;text-align:center">${it.item_number ?? ''}</td>`
        if (j === 0) rowsHtml += `<td style="border:1px solid #ccc;padding:6px" rowspan="${group.length}">${equipment}</td>`
        rowsHtml += `<td style="border:1px solid #ccc;padding:6px">${it.component ?? ''}</td>`
  rowsHtml += `<td style="${conditionCellStyle(it.previous_condition)}">${it.previous_condition ?? ''}</td>`
  rowsHtml += `<td style="${conditionCellStyle(it.current_condition)}">${it.current_condition ?? ''}</td>`
        rowsHtml += `<td style="border:1px solid #ccc;padding:6px">${it.diagnosis ?? ''}</td>`
        rowsHtml += `<td style="border:1px solid #ccc;padding:6px">${(it.observation || '-')}</td>`
        rowsHtml += '</tr>'
      }
    }

    const contentHtml = `
      <style>
        td, th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .report-header { display:flex; align-items:center; justify-content:space-between; }
        .report-title { text-align:center; flex:1 }
      </style>
      <div style="font-family: Arial, Helvetica, sans-serif; color:#111; padding:12px; background:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="width:160px">
            <img src="${logoImage}" alt="logo" style="height:60px;object-fit:contain" />
          </div>
          <div class="report-title">
            <h1 style="margin:0 0 6px 0">${canonicalReport.report_name || canonicalReport.title || ''}</h1>
            <div style="font-size:12px">${canonicalReport.report_date ? new Date(canonicalReport.report_date).toLocaleDateString('es-ES') : (canonicalReport.reportDate ? new Date(canonicalReport.reportDate).toLocaleDateString('es-ES') : '')}</div>
            <div style="font-size:12px">${canonicalReport.location || canonicalReport.location || canonicalReport.plant || ''}</div>
          </div>
          <div style="width:160px;text-align:right;font-size:12px">
            <div><strong>Empresa:</strong> ${companyName}</div>
            <div><strong>Creado por:</strong> ${canonicalReport.created_by || canonicalReport.createdByUserId || canonicalReport.presentedBy || ''}</div>
            <div><strong>Aprobado por:</strong> ${canonicalReport.approved_by || canonicalReport.reviewedBy || ''}</div>
          </div>
        </div>
        <hr style="margin:12px 0" />
        <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:12px;margin-bottom:12px">
          <div style="padding:6px;background:#ecfdf5;border:1px solid #d1fae5">Bueno: ${report.summary?.good ?? 0}</div>
          <div style="padding:6px;background:#fef3c7;border:1px solid #f5d08a">Observación: ${canonicalReport.summary?.observation ?? 0}</div>
          <div style="padding:6px;background:#ffedd5;border:1px solid #f3b28a">Alarma: ${canonicalReport.summary?.alarm ?? 0}</div>
          <div style="padding:6px;background:#fecaca;border:1px solid #f28a8a">Inaceptable: ${canonicalReport.summary?.inacceptable ?? 0}</div>
          <div style="padding:6px;background:#e5e7eb;border:1px solid #cfcfcf">Sin medición: ${canonicalReport.summary?.no_measurement ?? 0}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:12px">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #ccc">Item</th>
              <th style="padding:8px;border:1px solid #ccc">Equipo</th>
              <th style="padding:8px;border:1px solid #ccc">Activos</th>
              <th style="padding:8px;border:1px solid #ccc">Condición anterior</th>
              <th style="padding:8px;border:1px solid #ccc">Condición actual</th>
              <th style="padding:8px;border:1px solid #ccc">Diagnóstico</th>
              <th style="padding:8px;border:1px solid #ccc">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `

    // Create offscreen container
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.innerHTML = contentHtml
    document.body.appendChild(container)

    // Helper to load html2pdf from CDN if not present
    const loadHtml2Pdf = () => new Promise<void>((resolve, reject) => {
      if ((window as any).html2pdf) return resolve()
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/html2pdf.js@0.9.3/dist/html2pdf.bundle.min.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load html2pdf'))
      document.head.appendChild(script)
    })

    try {
      await loadHtml2Pdf()
      const opt = {
        margin:       10,
        filename:     `${(report.report_name || 'reporte').replace(/[^a-z0-9\-\_ ]/gi,'').replace(/\s+/g,'_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      await (window as any).html2pdf().set(opt).from(container).save()
    } catch (err) {
      // fallback: open printable window (previous behaviour)
      const w = window.open('', '_blank')
      if (w) {
        w.document.open()
        w.document.write(`<html><body>${contentHtml}</body></html>`)
        w.document.close()
        setTimeout(() => { try { w.print() } catch(e){} }, 300)
      }
    } finally {
      // cleanup
      setTimeout(() => {
        try { document.body.removeChild(container) } catch(e) {}
      }, 500)
    }
  }

  const deleteMachinePoint = (pointId: string) => {
    const updatedPoints = machinePoints.filter(p => p.id !== pointId)
    setMachinePoints(updatedPoints)
    saveMachinePoints(updatedPoints)
  }

  const selectedCompany = localCompanies.find(c => c.id === selectedCompanyId) || null

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
      <Navbar title="Reportes de Vibraciones" companyName={
        // show company name for client or selected company
        user?.role === 'client' ? localCompanies.find(c => c.id === user.companyId)?.name : selectedCompany?.name
      } />

      <div className="flex pt-24">
        {user?.role === 'admin' ? (
          <Sidebar user={user} onLogout={onLogout} />
        ) : (
          <ClientSidebar user={user} onLogout={onLogout} />
        )}

        <main className="flex-1 p-8 md:ml-64">
          <div className="fixed top-29 left-[280px] right-8 z-30 bg-white shadow rounded-lg md:rounded-xl border border-slate-100 h-[88.5%] ">
            <div className="p-6 h-full overflow-auto">
                {!selectedCompany ? (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Empresas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {localCompanies.map(company => {
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
                    {/* Hide breadcrumb for clients (they should land directly in their company view) */}
                    {user?.role !== 'client' && <Breadcrumb />}
                    
                    {/* Botón para agregar sucursal */}
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold">Sucursales de {selectedCompany?.name}</h2>
                      {/* Only admins can add branches */}
                      {user?.role === 'admin' && (
                        <button
                          onClick={addBranch}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <span className="text-lg">+</span>
                          Agregar Sucursal
                        </button>
                      )}
                    </div>
                    
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
                      {/* Add machine button only for admins */}
                      {user?.role === 'admin' && (
                        <button
                          onClick={addMachinePoint}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <span className="text-lg">+</span>
                          Agregar Máquina
                        </button>
                      )}
                      
                      {/* Edit mode toggle only for admins */}
                      {user?.role === 'admin' && (
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
                      )}

                      <div className="flex-1"></div>
                      
                      {import.meta.env.DEV && (
                        <div className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-xs font-medium flex items-center gap-2">
                          <span className="animate-pulse">●</span>
                          Guardado automático activo
                        </div>
                      )}
                      
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
                        {machinePoints.map(point => {
                          // Obtener información de la máquina
                          const machine = localMachines.find(m => m.id === point.machineId)
                          
                          // Obtener el último reporte de la máquina para determinar el color
                          const machineReports = vibrationReports
                            .filter(r => r.machine_id === point.machineId)
                            .sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())
                          const latestReport = machineReports[0]
                          
                          // Determinar el color según el estado
                          let pointColor = 'bg-gray-500' // Sin reportes
                          let pointColorPing = 'bg-gray-500'
                          
                          if (latestReport) {
                            if (latestReport.summary.inacceptable > 0) {
                              pointColor = 'bg-red-600'
                              pointColorPing = 'bg-red-500'
                            } else if (latestReport.summary.alarm > 0) {
                              pointColor = 'bg-orange-500'
                              pointColorPing = 'bg-orange-400'
                            } else if (latestReport.summary.observation > 0) {
                              pointColor = 'bg-yellow-500'
                              pointColorPing = 'bg-yellow-400'
                            } else {
                              pointColor = 'bg-green-600'
                              pointColorPing = 'bg-green-500'
                            }
                          }
                          
                          // Si está siendo arrastrado, usar azul
                          if (draggingPoint === point.id) {
                            pointColor = 'bg-blue-600'
                            pointColorPing = 'bg-blue-500'
                          }
                          
                          return (
                            <div
                              key={point.id}
                              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                                (user?.role === 'admin' && isEditMode) ? 'cursor-move' : 'cursor-pointer'
                              }`}
                              style={{ 
                                left: `${point.x}%`, 
                                top: `${point.y}%`,
                                zIndex: draggingPoint === point.id ? 50 : 10
                              }}
                              onMouseDown={(e) => handlePointMouseDown(point.id, e)}
                            >
                              <div className="flex items-center gap-2">
                                {/* Pin de ubicación */}
                                <div className="relative w-8 h-8 flex-shrink-0">
                                  <div className={`absolute inset-0 rounded-full ${pointColorPing} opacity-20 animate-ping`}></div>
                                  <div className={`relative w-8 h-8 rounded-full ${pointColor} border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm`}>
                                    ⚙️
                                  </div>
                                </div>
                                
                                {/* Nombre de la máquina */}
                                {machine && (
                                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-md border border-gray-200 whitespace-nowrap">
                                    <span className="text-xs font-semibold text-gray-800">
                                      {machine.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Modal de información de máquina */}
                    {showMachineModal && selectedMachinePoint && (
                      <div 
                        className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowMachineModal(false)}
                      >
                        <div 
                          className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
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
                              
                              if (!machine) {
                                return (
                                  <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 text-sm">
                                    ⚠️ Esta máquina no tiene información asociada
                                  </div>
                                )
                              }

                              // Obtener reportes de esta máquina
                              const machineReports = vibrationReports
                                .filter(r => r.machine_id === machine.id)
                                .sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())

                              const latestReport = machineReports[0]

                              // Función para determinar el color del estado
                              const getConditionColor = (summary: any) => {
                                if (summary.inacceptable > 0) return 'bg-red-100 text-red-800 border-red-300'
                                if (summary.alarm > 0) return 'bg-orange-100 text-orange-800 border-orange-300'
                                if (summary.observation > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                return 'bg-green-100 text-green-800 border-green-300'
                              }

                              const getConditionText = (summary: any) => {
                                if (summary.inacceptable > 0) return 'Inaceptable'
                                if (summary.alarm > 0) return 'Alarma'
                                if (summary.observation > 0) return 'Observación'
                                return 'Bueno'
                              }

                              return (
                                <>
                                  {/* Información básica de la máquina */}
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-800 mb-3">Datos de la Máquina</h4>
                                    <div className="space-y-2 text-sm">
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

                                  {/* Estado actual */}
                                  {latestReport ? (
                                        <div className={`p-4 rounded-lg border-2 ${getConditionColor(latestReport.summary)}`}>
                                          <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold text-lg">Estado Actual</h4>
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-medium">
                                                {new Date(latestReport.report_date).toLocaleDateString('es-ES', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric'
                                                })}
                                              </span>
                                              <button
                                                onClick={() => exportReportAsPDF(latestReport)}
                                                className="px-2 py-1 bg-sky-600 text-white rounded-md hover:bg-sky-700 text-sm"
                                              >
                                                📄 Exportar PDF
                                              </button>
                                            </div>
                                          </div>
                                      <div className="text-2xl font-bold mb-2">
                                        {getConditionText(latestReport.summary)}
                                      </div>
                                      <div className="grid grid-cols-5 gap-2 text-xs mt-3">
                                        <div className="text-center">
                                          <div className="font-semibold">{latestReport.summary.good}</div>
                                          <div className="text-green-700">Bueno</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-semibold">{latestReport.summary.observation}</div>
                                          <div className="text-yellow-700">Observ.</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-semibold">{latestReport.summary.alarm}</div>
                                          <div className="text-orange-700">Alarma</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-semibold">{latestReport.summary.inacceptable}</div>
                                          <div className="text-red-700">Inacept.</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-semibold">{latestReport.summary.no_measurement}</div>
                                          <div className="text-gray-700">Sin med.</div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-300">
                                      <div className="text-center text-gray-600">
                                        <div className="text-4xl mb-2">📋</div>
                                        <div className="font-semibold">Sin reportes registrados</div>
                                        <div className="text-sm mt-1">Esta máquina aún no tiene inspecciones</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Historial de reportes */}
                                  {machineReports.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold text-gray-800 mb-3">
                                        Historial de Reportes ({machineReports.length})
                                      </h4>
                                      <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {machineReports.map(report => (
                                          <div 
                                            key={report.report_id}
                                            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                                            onClick={() => {
                                              setSelectedReport(report)
                                              setShowReportDetailModal(true)
                                            }}
                                          >
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1">
                                                <div className="font-semibold text-gray-800 text-sm">
                                                  {report.report_name}
                                                </div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                  {new Date(report.report_date).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                  })}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                  Inspector: {report.created_by}
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <div className={`px-2 py-1 rounded text-xs font-medium ${getConditionColor(report.summary)}`}>
                                                  {getConditionText(report.summary)}
                                                </div>
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); exportReportAsPDF(report) }}
                                                  className="px-2 py-1 bg-sky-600 text-white rounded-md hover:bg-sky-700 text-sm"
                                                >
                                                  📄
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )
                            })()}

                            <div className="flex gap-2 pt-4">
                              {/* Only admins can delete points */}
                              {user?.role === 'admin' ? (
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
                              ) : null}
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
                        className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50"
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

                    {/* Formulario para agregar nueva sucursal */}
                    {showAddBranchForm && (
                      <div 
                        className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowAddBranchForm(false)}
                      >
                        <div 
                          className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Agregar Nueva Sucursal</h3>
                            <button
                              onClick={() => setShowAddBranchForm(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>

                          <form 
                            onSubmit={(e) => {
                              e.preventDefault()
                              const formData = new FormData(e.currentTarget)
                              const branchData = {
                                name: formData.get('name'),
                                address: formData.get('address')
                              }
                              createNewBranch(branchData)
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de la Sucursal *
                              </label>
                              <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: Sucursal Lima Centro"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dirección *
                              </label>
                              <input
                                type="text"
                                name="address"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: Av. Principal 123, Lima"
                              />
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                              <p><strong>Empresa:</strong> {selectedCompany?.name}</p>
                              <p className="text-xs text-blue-600 mt-1">La imagen del mapa se asignará por defecto</p>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <button
                                type="button"
                                onClick={() => setShowAddBranchForm(false)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                              >
                                Crear Sucursal
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                    {/* Modal de detalle del reporte */}
                    {showReportDetailModal && selectedReport && (
                      <div 
                        className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-[60]"
                        onClick={() => {
                          setShowReportDetailModal(false)
                          setSelectedReport(null)
                        }}
                      >
                        <div 
                          className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Header del reporte */}
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                {selectedReport.report_name}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  📅 {new Date(selectedReport.report_date).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  📍 {selectedReport.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => exportReportAsPDF(selectedReport)}
                                className="px-3 py-1 bg-sky-600 text-white rounded-md hover:bg-sky-700 text-sm"
                              >
                                📄 Exportar PDF
                              </button>
                              <button
                                onClick={() => {
                                  setShowReportDetailModal(false)
                                  setSelectedReport(null)
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* Información del reporte */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-xs text-gray-600 mb-1">Creado por</div>
                              <div className="font-semibold text-gray-800">{selectedReport.created_by}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-xs text-gray-600 mb-1">Aprobado por</div>
                              <div className="font-semibold text-gray-800">{selectedReport.approved_by}</div>
                            </div>
                          </div>

                          {/* Resumen del estado */}
                          <div className="mb-6">
                            <h4 className="font-bold text-lg text-gray-800 mb-3">Resumen de Inspección</h4>
                            <div className="grid grid-cols-5 gap-3">
                              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center">
                                <div className="text-3xl font-bold text-green-700">{selectedReport.summary.good}</div>
                                <div className="text-xs text-green-600 mt-1">Bueno</div>
                              </div>
                              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 text-center">
                                <div className="text-3xl font-bold text-yellow-700">{selectedReport.summary.observation}</div>
                                <div className="text-xs text-yellow-600 mt-1">Observación</div>
                              </div>
                              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 text-center">
                                <div className="text-3xl font-bold text-orange-700">{selectedReport.summary.alarm}</div>
                                <div className="text-xs text-orange-600 mt-1">Alarma</div>
                              </div>
                              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-center">
                                <div className="text-3xl font-bold text-red-700">{selectedReport.summary.inacceptable}</div>
                                <div className="text-xs text-red-600 mt-1">Inaceptable</div>
                              </div>
                              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-center">
                                <div className="text-3xl font-bold text-gray-700">{selectedReport.summary.no_measurement}</div>
                                <div className="text-xs text-gray-600 mt-1">Sin medición</div>
                              </div>
                            </div>
                          </div>

                          {/* Items de inspección - Formato Tabla */}
                          <div className="overflow-x-auto">
                            <h4 className="font-bold text-lg text-gray-800 mb-3">
                              Detalle de Inspección ({selectedReport.items.length} items)
                            </h4>
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-blue-600 text-white">
                                  <th className="border border-blue-700 px-3 py-2 text-sm font-semibold text-center w-12">Item</th>
                                  <th className="border border-blue-700 px-3 py-2 text-sm font-semibold text-center w-32">Equipo</th>
                                  <th className="border border-blue-700 px-3 py-2 text-sm font-semibold text-center w-32">Activos</th>
                                  <th className="border border-blue-700 px-3 py-2 text-sm font-semibold text-center w-32">Condición anterior</th>
                                  <th className="border border-blue-700 px-3 py-2 text-sm font-semibold text-center w-32">Condición actual</th>
                                  <th className="border border-blue-700 px-3 py-2 text-sm font-semibold text-center">Diagnóstico</th>
                                  <th className="border border-blue-700 px-3 py-2 text-sm font-semibold text-center">Observaciones y Recomendaciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  // Agrupar items por equipo
                                  const groupedItems: { [key: string]: any[] } = {}
                                  selectedReport.items.forEach((item: any) => {
                                    if (!groupedItems[item.equipment_name]) {
                                      groupedItems[item.equipment_name] = []
                                    }
                                    groupedItems[item.equipment_name].push(item)
                                  })

                                  const getCellColor = (condition: string) => {
                                    if (condition.toLowerCase().includes('inaceptable')) return 'bg-red-500 text-white'
                                    if (condition.toLowerCase().includes('alarma')) return 'bg-orange-400 text-black'
                                    if (condition.toLowerCase().includes('observ')) return 'bg-yellow-400 text-black'
                                    if (condition.toLowerCase().includes('bueno')) return 'bg-green-500 text-white'
                                    if (condition.toLowerCase().includes('medición') || condition.toLowerCase().includes('s/medición')) return 'bg-gray-300 text-black'
                                    return 'bg-white text-black'
                                  }

                                  const rows: any[] = []
                                  
                                  Object.entries(groupedItems).forEach(([equipmentName, items]) => {
                                    items.forEach((item: any, index: number) => {
                                      rows.push(
                                        <tr key={item.item_number} className="hover:bg-gray-50">
                                          <td className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">
                                            {item.item_number}
                                          </td>
                                          {/* Solo mostrar el nombre del equipo en la primera fila del grupo */}
                                          {index === 0 && (
                                            <td 
                                              className="border border-gray-300 px-3 py-2 text-sm font-semibold text-center align-middle"
                                              rowSpan={items.length}
                                            >
                                              {equipmentName}
                                            </td>
                                          )}
                                          <td className="border border-gray-300 px-3 py-2 text-sm">
                                            {item.component}
                                          </td>
                                          <td className={`border border-gray-300 px-3 py-2 text-center text-sm font-semibold ${getCellColor(item.previous_condition)}`}>
                                            {item.previous_condition}
                                          </td>
                                          <td className={`border border-gray-300 px-3 py-2 text-center text-sm font-semibold ${getCellColor(item.current_condition)}`}>
                                            {item.current_condition}
                                          </td>
                                          <td className="border border-gray-300 px-3 py-2 text-sm">
                                            {item.diagnosis}
                                          </td>
                                          <td className="border border-gray-300 px-3 py-2 text-sm bg-blue-100">
                                            {item.observation || '-'}
                                          </td>
                                        </tr>
                                      )
                                    })
                                  })

                                  return rows
                                })()}
                              </tbody>
                            </table>
                          </div>

                          {/* Botón cerrar */}
                          <div className="mt-6 flex justify-end">
                            <button
                              onClick={() => {
                                setShowReportDetailModal(false)
                                setSelectedReport(null)
                              }}
                              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                              Cerrar
                            </button>
                          </div>
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
