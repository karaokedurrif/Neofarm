export default function PageShell({ title, subtitle, children }: { title: string, subtitle?: string, children: React.ReactNode }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#E5E5E5]">{title}</h1>
        {subtitle && <p className="text-sm text-[#9CA3AF]">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
