'use client'

import { useState, useEffect } from 'react'

interface Post {
  id: string
  prompt: string
  content: string
  platform: string | null
  createdAt: string
}

export default function PostHistory() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/posts?limit=10')
      const data = await response.json()

      if (data.success) {
        setPosts(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch posts')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to fetch posts')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading post history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Recent Posts
      </h2>

      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <p>No posts generated yet. Create your first post above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Prompt:</span> {post.prompt}
                  </p>
                  {post.platform && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                      {post.platform}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-100">
                <p className="text-gray-700 whitespace-pre-wrap text-sm">
                  {post.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

