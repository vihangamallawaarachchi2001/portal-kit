import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import type { BlogPost } from '@/lib/blog'
import { PenSquare, Plus, Eye, EyeOff } from 'lucide-react'

export const revalidate = 0

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
      status === 'published'
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-gray-100 text-gray-500 border border-gray-200'
    }`}>
      {status === 'published'
        ? <Eye size={10} />
        : <EyeOff size={10} />
      }
      {status}
    </span>
  )
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminBlogPage() {
  const service = createServiceClient()
  const { data: posts } = await service
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  const allPosts = (posts ?? []) as BlogPost[]
  const publishedCount = allPosts.filter(p => p.status === 'published').length
  const draftCount = allPosts.filter(p => p.status === 'draft').length

  return (
    <div className="min-h-screen bg-[#f8f9ff] p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Admin
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-xs text-gray-600 font-medium">Blog</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Blog posts</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {publishedCount} published · {draftCount} draft
            </p>
          </div>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-[#0051D5] text-white text-sm font-semibold hover:opacity-90 transition-all"
          >
            <Plus size={16} />
            New post
          </Link>
        </div>

        {/* Posts table */}
        {allPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <PenSquare size={22} className="text-[#0051D5]" />
            </div>
            <p className="text-base font-semibold text-gray-700 mb-1">No blog posts yet</p>
            <p className="text-sm text-gray-400 mb-6">Create your first post to get started.</p>
            <Link
              href="/admin/blog/new"
              className="flex items-center gap-2 h-9 px-5 rounded-lg bg-[#0051D5] text-white text-sm font-semibold hover:opacity-90 transition-all"
            >
              <Plus size={14} />
              Write first post
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_120px_140px_100px_60px] items-center px-5 py-3 bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <span>Title</span>
              <span>Status</span>
              <span>Published</span>
              <span>Tags</span>
              <span />
            </div>

            {/* Rows */}
            {allPosts.map((post, i) => (
              <div
                key={post.id}
                className={`grid grid-cols-[1fr_120px_140px_100px_60px] items-center px-5 py-4 gap-3 ${
                  i < allPosts.length - 1 ? 'border-b border-gray-100' : ''
                } hover:bg-gray-50 transition-colors`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate font-mono">/blog/{post.slug}</p>
                </div>
                <StatusBadge status={post.status} />
                <span className="text-sm text-gray-500">{formatDate(post.published_at)}</span>
                <div className="flex flex-wrap gap-1">
                  {(post.tags ?? []).slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {(post.tags ?? []).length > 2 && (
                    <span className="text-[10px] text-gray-400">+{post.tags.length - 2}</span>
                  )}
                </div>
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="flex items-center justify-center size-8 rounded-lg text-gray-400 hover:text-[#0051D5] hover:bg-blue-50 transition-colors"
                  title="Edit post"
                >
                  <PenSquare size={15} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
