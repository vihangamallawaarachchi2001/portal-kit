import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { getPostBySlug, getAllPublishedSlugs, getPublishedPosts } from '@/lib/blog'
import PostCard from '@/components/blog/post-card'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs()
  return slugs.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post || post.status !== 'published') return { title: 'Not Found' }

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: [post.author_name],
      ...(post.cover_image_url && { images: [post.cover_image_url] }),
    },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
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

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([
    getPostBySlug(slug),
    getPublishedPosts(),
  ])

  if (!post || post.status !== 'published') notFound()

  const relatedPosts = allPosts.filter(p => p.slug !== slug).slice(0, 3)

  return (
    <>
      <Header />
      <main className="pt-16">

        {/* ── Post hero — cover image integrated ───────────────────── */}
        <section
          className="relative overflow-hidden flex flex-col"
          style={{ minHeight: '76vh', background: '#060b18' }}
        >
          {/* Cover image as atmospheric background */}
          {post.cover_image_url && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image_url}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.48 }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, #060b18 22%, rgba(6,11,24,0.62) 52%, rgba(6,11,24,0.15) 100%)',
                }}
              />
            </>
          )}

          <DotGrid />

          {/* Top edge accent */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(0,81,213,0.4), transparent)',
            }}
          />

          {/* Blue glow (only when no cover image to avoid colour clash) */}
          {!post.cover_image_url && (
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-32 w-[700px] h-[400px]"
              style={{
                background:
                  'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 70%)',
              }}
            />
          )}

          {/* Content — back link at top, title/meta at bottom */}
          <div className="relative flex-1 flex flex-col max-w-3xl w-full mx-auto px-6 pt-28 pb-16">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm transition-colors hover:opacity-80 self-start"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              All posts
            </Link>

            {/* Tags + title + meta pushed to the bottom of the hero */}
            <div className="mt-auto space-y-5 pt-10">
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{
                        background: 'rgba(0,81,213,0.2)',
                        color: '#93c5fd',
                        border: '1px solid rgba(0,81,213,0.3)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1
                className="font-extrabold text-white tracking-tight leading-[1.1]"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}
              >
                {post.title}
              </h1>

              <div
                className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ background: 'rgba(0,81,213,0.25)', color: '#93c5fd' }}
                  >
                    {post.author_name[0].toUpperCase()}
                  </div>
                  <span
                    className="font-medium"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    {post.author_name}
                  </span>
                </div>
                {post.published_at && (
                  <>
                    <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                    <span>{formatDate(post.published_at)}</span>
                  </>
                )}
                {post.reading_time_mins && (
                  <>
                    <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                    <span>{post.reading_time_mins} min read</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Content ──────────────────────────────────────────────── */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div
              data-blog-content
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <hr className="my-12 border-gray-100" />

            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">Share this article</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border border-gray-200 text-gray-600 cursor-pointer select-none hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.856L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                  </svg>
                  Share on X
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border border-gray-200 text-gray-600 cursor-pointer select-none hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Share on LinkedIn
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border border-gray-200 text-gray-600 cursor-pointer select-none hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  Copy link
                </span>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0051D5] hover:underline underline-offset-4"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to blog
              </Link>
            </div>
          </div>
        </section>

        {/* ── Related posts ─────────────────────────────────────────── */}
        {relatedPosts.length > 0 && (
          <section className="bg-[#f8fafc] py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">More from the blog</h2>
                <Link
                  href="/blog"
                  className="text-sm text-[#0051D5] font-medium hover:underline underline-offset-4"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map(p => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-20 px-6"
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
          <div className="relative max-w-xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to impress your clients?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.62)' }}>
              Set up your first portal in minutes. No code, no complexity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
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
