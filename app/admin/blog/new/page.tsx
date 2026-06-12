import Link from 'next/link'
import BlogPostForm from '@/components/admin/blog-post-form'

export const metadata = { title: 'New Post — Admin' }

export default function NewBlogPostPage() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Admin</Link>
            <span className="text-gray-300">/</span>
            <Link href="/admin/blog" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Blog</Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs text-gray-600 font-medium">New post</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Write new post</h1>
        </div>

        <BlogPostForm mode="create" />
      </div>
    </div>
  )
}
