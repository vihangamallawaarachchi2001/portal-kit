const STATS = [
  { value: '2,000+', label: 'Active freelancers' },
  { value: '$4M+',   label: 'Invoiced through portals' },
  { value: '98%',    label: 'Client satisfaction' },
  { value: '10 min', label: 'Average setup time' },
]

export default function Stats() {
  return (
    <section className="bg-[#080d1a] px-6 py-16 border-t border-white/5">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <span className="text-3xl md:text-4xl font-bold tracking-tight text-blue-400">
                {value}
              </span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
