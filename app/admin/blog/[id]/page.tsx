import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import type { BlogPost } from '@/lib/blog'
import BlogPostForm from '@/components/admin/blog-post-form'

export const revalidate = 0

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params
  const service = createServiceClient()
  const { data, error } = await service
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const post = data as BlogPost

  return (
    <div className="min-h-screen bg-[#f8f9ff] p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Admin</Link>
              <span className="text-gray-300">/</span>
              <Link href="/admin/blog" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Blog</Link>
              <span className="text-gray-300">/</span>
              <span className="text-xs text-gray-600 font-medium">Edit</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">{post.title}</h1>
          </div>
          {post.status === 'published' && (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 hover:text-[#0051D5] hover:border-[#0051D5] transition-colors"
            >
              View live ↗
            </Link>
          )}
        </div>

        <BlogPostForm mode="edit" initialData={post} />
      </div>
    </div>
  )
}
