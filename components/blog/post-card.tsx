import Link from 'next/link'
import type { BlogPost } from '@/lib/blog'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function tagStyle(tag: string): { bg: string; color: string; border: string } {
  const t = tag.toLowerCase()
  if (t === 'getting paid')
    return { bg: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }
  if (t === 'client management')
    return { bg: 'rgba(59,130,246,0.08)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)' }
  if (t === 'freelance workflows')
    return { bg: 'rgba(139,92,246,0.08)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.2)' }
  if (t === 'business')
    return { bg: 'rgba(245,158,11,0.08)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)' }
  if (t === 'branding')
    return { bg: 'rgba(236,72,153,0.08)', color: '#db2777', border: '1px solid rgba(236,72,153,0.2)' }
  return { bg: 'rgba(0,0,0,0.04)', color: '#4b5563', border: '1px solid rgba(0,0,0,0.08)' }
}

export default function PostCard({ post }: { post: BlogPost }) {
  const primaryTag = post.tags?.[0]
  const ts = primaryTag ? tagStyle(primaryTag) : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white hover:border-[#0051D5]/20 hover:shadow-[0_8px_32px_-8px_rgba(0,81,213,0.12)] transition-all duration-300"
    >
      {/* Cover image / gradient placeholder */}
      {post.cover_image_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="w-full h-52 object-cover"
        />
      ) : (
        <div
          className="w-full h-52 shrink-0 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0,81,213,0.07) 0%, rgba(139,92,246,0.05) 100%)',
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-[#0051D5]/10 flex items-center justify-center">
            <svg
              width="18"
              height="18"
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
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        {primaryTag && ts && (
          <span
            className="inline-flex self-start text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: ts.bg, color: ts.color, border: ts.border }}
          >
            {primaryTag}
          </span>
        )}

        <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 mt-3 mb-2 group-hover:text-[#0051D5] transition-colors">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-700 shrink-0">
              {post.author_name[0].toUpperCase()}
            </div>
            <span className="text-xs text-gray-500">{post.author_name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            {post.reading_time_mins && <span>{post.reading_time_mins} min</span>}
            {post.reading_time_mins && post.published_at && (
              <span className="text-gray-300">·</span>
            )}
            {post.published_at && <span>{formatDate(post.published_at)}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
