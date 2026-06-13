'use client'

import { useState } from 'react'
import PostCard from './post-card'
import type { BlogPost } from '@/lib/blog'

const TAGS = [
  'All',
  'Client management',
  'Getting paid',
  'Freelance workflows',
  'Portal setup',
  'Business',
  'Branding',
  'Client onboarding',
]

export default function PostsWithFilter({
  posts,
  featuredId,
}: {
  posts: BlogPost[]
  featuredId?: string
}) {
  const [activeTag, setActiveTag] = useState('All')

  const filtered =
    activeTag === 'All'
      ? posts.filter(p => p.id !== featuredId)
      : posts.filter(p =>
          p.tags?.some(t => t.toLowerCase() === activeTag.toLowerCase()),
        )

  return (
    <>
      {/* Filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-10 scrollbar-none">
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className="shrink-0 text-sm px-4 py-1.5 rounded-full border font-medium transition-all duration-200"
            style={
              activeTag === tag
                ? { background: '#0051D5', borderColor: '#0051D5', color: '#fff' }
                : { background: '#fff', borderColor: '#e5e7eb', color: '#4b5563' }
            }
          >
            {tag}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-gray-400 text-sm">
            No articles tagged &ldquo;{activeTag}&rdquo; yet — check back soon.
          </p>
        </div>
      )}
    </>
  )
}
