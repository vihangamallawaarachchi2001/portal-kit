import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import PostCard from '@/components/blog/post-card'
import { getPublishedPosts } from '@/lib/blog'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Guides, tips, and insights for freelancers — from the PortalKit team.',
}

function DotGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    />
  )
}

function Eyebrow({ label }: { label: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
      style={{
        background: 'rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.55)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
      {label}
    </div>
  )
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <>
      <Header />
      <main className="pt-16">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-28 px-6 text-center"
          style={{ background: '#060b18' }}
        >
          <DotGrid />
          {/* Blue glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,81,213,0.4), transparent)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-32 w-[700px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 70%)' }}
          />

          <div className="relative max-w-3xl mx-auto">
            <Eyebrow label="Blog" />
            <h1
              className="font-extrabold tracking-tight text-white leading-[1.06]"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)' }}
            >
              Insights for{' '}
              <span
                style={{
                  backgroundImage: 'linear-gradient(90deg, #60a5fa, #93c5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                modern freelancers.
              </span>
            </h1>
            <p
              className="mt-6 text-lg leading-relaxed max-w-xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              Practical guides on client management, getting paid faster, and building a
              delivery workflow your clients will love.
            </p>
          </div>
        </section>

        {/* ── Posts grid ───────────────────────────────────────────── */}
        <section className="bg-[#f8fafc] py-24 px-6">
          <div className="max-w-7xl mx-auto">

            {posts.length > 0 ? (
              <>
                {/* Featured post (first) */}
                {posts.length >= 1 && (
                  <div className="mb-12">
                    <Link
                      href={`/blog/${posts[0].slug}`}
                      className="group grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-gray-200 bg-white hover:border-[#0051D5]/30 hover:shadow-[0_12px_40px_-8px_rgba(0,81,213,0.12)] transition-all duration-300"
                    >
                      {/* Cover */}
                      {posts[0].cover_image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={posts[0].cover_image_url}
                          alt={posts[0].title}
                          className="w-full h-64 lg:h-auto object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-64 lg:h-auto"
                          style={{
                            background: 'linear-gradient(135deg, rgba(0,81,213,0.1) 0%, rgba(18,104,255,0.05) 50%, rgba(139,92,246,0.08) 100%)',
                            minHeight: '280px',
                          }}
                        >
                          <div className="h-full flex items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-[#0051D5]/10 flex items-center justify-center">
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0051D5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Content */}
                      <div className="p-8 lg:p-10 flex flex-col justify-center">
                        {posts[0].tags?.[0] && (
                          <span className="inline-flex self-start text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 mb-4">
                            {posts[0].tags[0]}
                          </span>
                        )}
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug group-hover:text-[#0051D5] transition-colors mb-4">
                          {posts[0].title}
                        </h2>
                        {posts[0].excerpt && (
                          <p className="text-gray-500 leading-relaxed line-clamp-3 mb-6">
                            {posts[0].excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <div className="w-7 h-7 rounded-full bg-[#0051D5]/10 flex items-center justify-center text-[11px] font-bold text-[#0051D5]">
                            {posts[0].author_name[0].toUpperCase()}
                          </div>
                          <span>{posts[0].author_name}</span>
                          {posts[0].reading_time_mins && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span>{posts[0].reading_time_mins} min read</span>
                            </>
                          )}
                          {posts[0].published_at && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span>{new Date(posts[0].published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Remaining posts grid */}
                {posts.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.slice(1).map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(0,81,213,0.07)' }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0051D5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Coming soon</h2>
                <p className="text-gray-500 max-w-sm leading-relaxed">
                  We're working on guides for freelancers. Check back soon — or start
                  your free trial in the meantime.
                </p>
                <Link
                  href="/auth"
                  className="mt-8 inline-flex items-center h-11 px-7 rounded-lg bg-[#0051D5] text-white text-sm font-bold hover:opacity-90 transition-all"
                >
                  Start for free
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-24 px-6"
          style={{ background: 'linear-gradient(150deg, #002a9e 0%, #0051D5 55%, #1268ff 100%)' }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to impress your clients?
            </h2>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.62)' }}>
              Set up your first portal in minutes. No code, no complexity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded bg-white text-[#003db5] text-base font-bold hover:brightness-95 transition-all"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                Start for free
              </Link>
              <Link
                href="/platform"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded text-base font-semibold text-white transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.07)' }}
              >
                See the platform
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
