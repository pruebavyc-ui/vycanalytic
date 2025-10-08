export default function Navbar({ title }:{ title?: string }) {
  return (
    // Fixed floating navbar. Outer container keeps consistent side spacing; inner wrapper shifts content on md+ to account for the sidebar width.
    <header className="fixed top-8 left-[280px] right-8 z-30 p-4 bg-white shadow rounded-lg md:rounded-xl border border-slate-100">
      <div className="w-full flex items-center justify-between md:pl-64">
        <div className="left-10px font-semibold">{title || 'VyC Analytic'}</div>
        <div className="text-sm text-slate-500">Panel</div>
      </div>
    </header>
  )
}
