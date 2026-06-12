import Link from 'next/link'
import type { BlogPost } from '@/lib/blog'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function PostCard({ post }: { post: BlogPost }) {
  const primaryTag = post.tags?.[0]

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-[#0051D5]/30 hover:shadow-[0_8px_32px_-8px_rgba(0,81,213,0.12)] transition-all duration-300"
    >
      {/* Cover image / gradient placeholder */}
      {post.cover_image_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div
          className="w-full h-48 shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0,81,213,0.08) 0%, rgba(18,104,255,0.04) 50%, rgba(139,92,246,0.06) 100%)',
          }}
        >
          <div className="h-full flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#0051D5]/10 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0051D5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 space-y-3">
        {primaryTag && (
          <span className="inline-flex self-start text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {primaryTag}
          </span>
        )}

        <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#0051D5] transition-colors">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#0051D5]/10 flex items-center justify-center text-[10px] font-bold text-[#0051D5] shrink-0">
              {post.author_name[0].toUpperCase()}
            </div>
            <span className="text-xs text-gray-500">{post.author_name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {post.reading_time_mins && <span>{post.reading_time_mins} min read</span>}
            {post.published_at && <span>{formatDate(post.published_at)}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
