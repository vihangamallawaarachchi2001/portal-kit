import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import PostsWithFilter from '@/components/blog/posts-with-filter'
import { getPublishedPosts } from '@/lib/blog'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog — PortalKit',
  description: 'Guides, tips, and insights for freelancers — from the PortalKit team.',
}

function DotGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    />
  )
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()
  const featured = posts[0] ?? null

  return (
    <>
      <Header />
      <main className="pt-16">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ background: '#060b18' }}
        >
          <DotGrid />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(0,81,213,0.4), transparent)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-32 w-[900px] h-[500px]"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.16) 0%, transparent 70%)',
            }}
          />

          <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-0">
            <div className="grid lg:grid-cols-[1fr_460px] gap-10 xl:gap-20 items-start pb-20">

              {/* Left: editorial headline */}
              <div className="lg:pt-8">
                <div
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.55)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  The PortalKit Blog
                </div>

                <h1
                  className="font-extrabold text-white tracking-tight leading-[1.04]"
                  style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)' }}
                >
                  Guides for<br />
                  <span
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #60a5fa, #93c5fd)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    modern<br />freelancers.
                  </span>
                </h1>

                <p
                  className="mt-6 text-lg leading-relaxed max-w-md"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  Practical articles on client management, getting paid faster, and building
                  a delivery experience your clients will love.
                </p>

                <div className="flex items-center gap-8 mt-10">
                  <div>
                    <div className="text-4xl font-extrabold text-white tabular-nums">
                      {posts.length}
                    </div>
                    <div
                      className="text-[11px] uppercase tracking-widest font-semibold mt-1"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      Articles
                    </div>
                  </div>
                  <div
                    className="w-px h-12"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  />
                  <div>
                    <div className="text-4xl font-extrabold text-white">New</div>
                    <div
                      className="text-[11px] uppercase tracking-widest font-semibold mt-1"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      Posts weekly
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: featured article card */}
              {featured && (
                <Link href={`/blog/${featured.slug}`} className="group block mt-0 lg:mt-4">
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {/* Cover image */}
                    <div className="relative h-[230px] overflow-hidden">
                      {featured.cover_image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={featured.cover_image_url}
                          alt={featured.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{ opacity: 0.9 }}
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(0,81,213,0.2) 0%, rgba(139,92,246,0.15) 100%)',
                          }}
                        />
                      )}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(to top, rgba(6,11,24,0.8) 0%, transparent 55%)',
                        }}
                      />
                      {featured.tags?.[0] && (
                        <span
                          className="absolute bottom-4 left-4 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: 'rgba(0,81,213,0.35)',
                            color: '#93c5fd',
                            border: '1px solid rgba(0,81,213,0.4)',
                          }}
                        >
                          {featured.tags[0]}
                        </span>
                      )}
                      <span
                        className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.6)',
                          border: '1px solid rgba(255,255,255,0.12)',
                        }}
                      >
                        Featured
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 pb-6">
                      <h3
                        className="font-bold text-white leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors duration-200"
                        style={{ fontSize: '1.05rem' }}
                      >
                        {featured.title}
                      </h3>
                      {featured.excerpt && (
                        <p
                          className="mt-2 text-sm line-clamp-2 leading-relaxed"
                          style={{ color: 'rgba(255,255,255,0.45)' }}
                        >
                          {featured.excerpt}
                        </p>
                      )}
                      <div
                        className="flex items-center gap-2 mt-4 text-xs"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                      >
                        <span>{featured.author_name}</span>
                        {featured.reading_time_mins && (
                          <>
                            <span>·</span>
                            <span>{featured.reading_time_mins} min read</span>
                          </>
                        )}
                        {featured.published_at && (
                          <>
                            <span>·</span>
                            <span>
                              {new Date(featured.published_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* Bottom section divider */}
            <div
              className="h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
              }}
            />
          </div>
        </section>

        {/* ── All posts grid ────────────────────────────────────────── */}
        <section className="bg-[#f8fafc] py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-gray-900">All articles</h2>
              <span className="text-sm text-gray-400 font-medium">{posts.length} posts</span>
            </div>

            {posts.length > 0 ? (
              <PostsWithFilter posts={posts} featuredId={featured?.id} />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(0,81,213,0.07)' }}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0051D5"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Coming soon</h2>
                <p className="text-gray-500 max-w-sm leading-relaxed">
                  We&apos;re working on guides for freelancers. Check back soon — or start
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

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-24 px-6"
          style={{
            background:
              'linear-gradient(150deg, #002a9e 0%, #0051D5 55%, #1268ff 100%)',
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
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
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded text-base font-bold hover:brightness-95 transition-all"
                style={{
                  background: '#fff',
                  color: '#003db5',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
              >
                Start for free
              </Link>
              <Link
                href="/platform"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded text-base font-semibold text-white transition-all hover:bg-white/10"
                style={{
                  border: '1px solid rgba(255,255,255,0.28)',
                  background: 'rgba(255,255,255,0.07)',
                }}
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
