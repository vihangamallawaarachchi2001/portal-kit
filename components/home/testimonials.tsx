const TESTIMONIALS = [
  {
    quote:
      "I used to lose 3 hours a week to email back-and-forth. Now my clients have everything in one place and I look a hundred times more professional.",
    name: 'Sarah K.',
    role: 'Graphic Designer',
    initials: 'SK',
    gradient: 'from-violet-400 to-violet-600',
  },
  {
    quote:
      "My clients actually pay faster now. They see the invoice right next to the deliverable, so there's no 'I couldn't find the email' excuse anymore.",
    name: 'Marcus T.',
    role: 'Web Developer',
    initials: 'MT',
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    quote:
      "The white-label portal makes me look like I run a full agency. Every new client mentions how polished the onboarding experience feels.",
    name: 'Leila R.',
    role: 'Brand Consultant',
    initials: 'LR',
    gradient: 'from-emerald-400 to-emerald-600',
  },
]

export default function Testimonials() {
  return (
    <section className="bg-surface-container-low py-24 px-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="text-center mb-14 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-ds-secondary">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
            Freelancers who made the switch
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, role, initials, gradient }) => (
            <div
              key={name}
              className="flex flex-col gap-5 rounded-xl border border-outline-variant bg-surface p-6"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map(i => (
                  <svg
                    key={i}
                    className="size-4 fill-yellow-400"
                    viewBox="0 0 20 20"
                    aria-hidden
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-on-surface-variant leading-relaxed flex-1">
                &ldquo;{quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`size-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{name}</p>
                  <p className="text-xs text-on-surface-variant">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
