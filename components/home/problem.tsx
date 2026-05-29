import { X } from 'lucide-react'

const PAIN_POINTS = [
  {
    title: 'Email thread chaos',
    description:
      'Feedback on v14_FINAL_revised.pdf buried under 47 replies. By the time you find it, the deadline has passed.',
  },
  {
    title: 'Files nobody can find',
    description:
      "You shared a Dropbox link three months ago. The client swears they never got it. Twenty minutes later you're still hunting.",
  },
  {
    title: 'Invoices that go cold',
    description:
      "You sent the invoice. Did they open it? When will they pay? You're left guessing while your cash flow dries up.",
  },
  {
    title: '"How is it going?" on loop',
    description:
      "Clients are anxious because they can't see progress. The same 5-minute status call, every single week, forever.",
  },
]

export default function Problem() {
  return (
    <section className="bg-surface-container-low py-24 px-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="text-center mb-14 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-ds-secondary">
            Sound familiar?
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
            The client work problem
            <br className="hidden sm:block" /> nobody talks about
          </h2>
          <p className="max-w-md mx-auto text-base text-on-surface-variant leading-relaxed">
            Great freelancers lose clients — not because of their work, but
            because of how they communicate it.
          </p>
        </div>

        {/* Pain points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PAIN_POINTS.map(({ title, description }) => (
            <div
              key={title}
              className="flex gap-4 rounded-xl border border-outline-variant bg-surface p-6"
            >
              <div className="flex items-center justify-center size-8 rounded-full bg-ds-error/10 text-ds-error shrink-0 mt-0.5">
                <X size={14} strokeWidth={2.5} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
