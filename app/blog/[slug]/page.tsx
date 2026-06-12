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
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([
    getPostBySlug(slug),
    getPublishedPosts(),
  ])

  if (!post || post.status !== 'published') notFound()

  const relatedPosts = allPosts
    .filter(p => p.slug !== slug)
    .slice(0, 3)

  return (
    <>
      <Header />
      <main className="pt-16">

        {/* ── Post hero ─────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-20 px-6"
          style={{ background: '#060b18' }}
        >
          {/* Dot grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-24 w-[600px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 70%)' }}
          />

          <div className="relative max-w-3xl mx-auto">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              All posts
            </Link>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(0,81,213,0.2)', color: '#93c5fd', border: '1px solid rgba(0,81,213,0.3)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1
              className="font-extrabold text-white tracking-tight leading-[1.1] mb-6"
              style={{ fontSize: 'clamp(1.875rem, 4.5vw, 3rem)' }}
            >
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ background: 'rgba(0,81,213,0.25)', color: '#93c5fd' }}
                >
                  {post.author_name[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{post.author_name}</span>
              </div>
              {post.published_at && (
                <>
                  <span className="text-xs">·</span>
                  <span className="text-sm">{formatDate(post.published_at)}</span>
                </>
              )}
              {post.reading_time_mins && (
                <>
                  <span className="text-xs">·</span>
                  <span className="text-sm">{post.reading_time_mins} min read</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Cover image (below hero, if present) ─────────────────── */}
        {post.cover_image_url && (
          <div className="bg-[#060b18] px-6 pb-0">
            <div className="max-w-3xl mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full max-h-[460px] object-cover rounded-2xl"
                style={{ boxShadow: '0 24px 64px -16px rgba(0,0,0,0.5)' }}
              />
            </div>
          </div>
        )}

        {/* ── Content ──────────────────────────────────────────────── */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div
              data-blog-content
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </section>

        {/* ── Related posts ─────────────────────────────────────────── */}
        {relatedPosts.length > 0 && (
          <section className="bg-[#f8fafc] py-20 px-6 border-t border-gray-100">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">More from PortalKit</h2>
                <Link href="/blog" className="text-sm text-[#0051D5] font-medium hover:underline underline-offset-4">
                  All posts →
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
          <div className="relative max-w-xl mx-auto text-center space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to impress your clients?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.62)' }}>
              Set up your first portal in minutes. No code, no complexity.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center h-12 px-8 rounded bg-white text-[#003db5] text-base font-bold hover:brightness-95 transition-all"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
            >
              Start for free
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
