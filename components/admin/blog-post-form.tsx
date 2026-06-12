'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { slugify, calcReadingTime, type BlogPost } from '@/lib/blog'
import { ChevronDown, ChevronUp, Clock, Loader2, Trash2 } from 'lucide-react'

const BlogEditor = dynamic(() => import('./blog-editor'), { ssr: false })

interface BlogPostFormProps {
  mode: 'create' | 'edit'
  initialData?: BlogPost
}

export default function BlogPostForm({ mode, initialData }: BlogPostFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url ?? '')
  const [tagsInput, setTagsInput] = useState((initialData?.tags ?? []).join(', '))
  const [authorName, setAuthorName] = useState(initialData?.author_name ?? 'PortalKit Team')
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status ?? 'draft')
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title ?? '')
  const [seoDesc, setSeoDesc] = useState(initialData?.seo_description ?? '')
  const [seoOpen, setSeoOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const readingTime = calcReadingTime(content)

  const handleTitleBlur = useCallback(() => {
    if (!slug && title) setSlug(slugify(title))
  }, [title, slug])

  const buildPayload = (overrideStatus?: 'draft' | 'published') => ({
    slug: slug.trim(),
    title: title.trim(),
    excerpt: excerpt.trim() || null,
    content,
    cover_image_url: coverImageUrl.trim() || null,
    tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    status: overrideStatus ?? status,
    author_name: authorName.trim() || 'PortalKit Team',
    seo_title: seoTitle.trim() || null,
    seo_description: seoDesc.trim() || null,
  })

  const save = useCallback(async (overrideStatus?: 'draft' | 'published') => {
    if (!title.trim() || !slug.trim()) {
      toast.error('Title and slug are required')
      return
    }

    const payload = buildPayload(overrideStatus)
    const url = mode === 'create'
      ? '/api/admin/blog'
      : `/api/admin/blog/${initialData!.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? 'Save failed')
      return
    }

    const saved = await res.json()
    toast.success(payload.status === 'published' ? 'Post published!' : 'Draft saved')

    if (mode === 'create') {
      router.push('/admin/blog')
    } else {
      setStatus(saved.status)
    }
  }, [title, slug, content, excerpt, coverImageUrl, tagsInput, authorName, status, seoTitle, seoDesc, mode, initialData, router]) // eslint-disable-line

  const handleDelete = async () => {
    if (!window.confirm('Delete this post permanently?')) return
    setDeleting(true)
    const res = await fetch(`/api/admin/blog/${initialData!.id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Delete failed')
      setDeleting(false)
      return
    }
    toast.success('Post deleted')
    router.push('/admin/blog')
  }

  const inputCls = 'w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0051D5]/30 focus:border-[#0051D5] transition-colors'
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">

        {/* ── Main content column ── */}
        <div className="space-y-6">

          {/* Title */}
          <div>
            <label className={labelCls}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Post title"
              className={inputCls.replace('h-10', 'h-12') + ' text-[18px] font-semibold'}
            />
          </div>

          {/* Slug */}
          <div>
            <label className={labelCls}>Slug *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 shrink-0">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="url-slug"
                className={inputCls + ' flex-1 font-mono text-[13px]'}
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className={labelCls}>Excerpt</label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="A brief summary shown in the blog listing (≈160 chars)"
              rows={2}
              className={inputCls.replace('h-10', 'h-auto') + ' py-2 resize-none'}
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{excerpt.length}/200</p>
          </div>

          {/* Content editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls + ' mb-0'}>Content</label>
              {content && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} /> ~{readingTime} min read
                </span>
              )}
            </div>
            <BlogEditor
              value={content}
              onChange={setContent}
              placeholder="Write your post here…"
            />
          </div>

          {/* SEO (collapsible) */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
            >
              <span>SEO settings</span>
              {seoOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {seoOpen && (
              <div className="p-4 space-y-4 bg-white">
                <div>
                  <label className={labelCls}>SEO title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={e => setSeoTitle(e.target.value)}
                    placeholder="Defaults to post title"
                    className={inputCls}
                    maxLength={70}
                  />
                  <p className="text-xs text-gray-400 mt-1">{seoTitle.length}/70</p>
                </div>
                <div>
                  <label className={labelCls}>SEO description</label>
                  <textarea
                    value={seoDesc}
                    onChange={e => setSeoDesc(e.target.value)}
                    placeholder="Defaults to excerpt"
                    rows={2}
                    className={inputCls.replace('h-10', 'h-auto') + ' py-2 resize-none'}
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-400 mt-1">{seoDesc.length}/160</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5 lg:sticky lg:top-6">

          {/* Status */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <p className={labelCls + ' mb-0'}>Status</p>
            <div className="flex gap-2">
              {(['draft', 'published'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 h-9 rounded-lg text-sm font-semibold capitalize transition-colors ${
                    status === s
                      ? s === 'published'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => startTransition(() => save('draft'))}
                disabled={isPending}
                className="w-full h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && status === 'draft' ? <Loader2 size={14} className="animate-spin" /> : null}
                Save draft
              </button>
              <button
                type="button"
                onClick={() => startTransition(() => save('published'))}
                disabled={isPending}
                className="w-full h-10 rounded-lg bg-[#0051D5] hover:opacity-90 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                {mode === 'create' ? 'Publish post' : 'Save & publish'}
              </button>
            </div>
          </div>

          {/* Cover image */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <p className={labelCls + ' mb-0'}>Cover image URL</p>
            <input
              type="url"
              value={coverImageUrl}
              onChange={e => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
            {coverImageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={coverImageUrl}
                alt="Cover preview"
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>

          {/* Tags */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-2">
            <p className={labelCls + ' mb-0'}>Tags</p>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className={inputCls}
            />
            <p className="text-xs text-gray-400">Comma-separated</p>
          </div>

          {/* Author */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-2">
            <p className={labelCls + ' mb-0'}>Author</p>
            <input
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="PortalKit Team"
              className={inputCls}
            />
          </div>

          {/* Delete (edit mode only) */}
          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full h-10 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete post
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
