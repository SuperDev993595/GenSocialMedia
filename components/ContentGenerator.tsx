'use client'

import { useState } from 'react'

interface GeneratedPost {
  id: string
  prompt: string
  content: string
  structuredContent?: {
    caption: string
    hashtags: string[]
  }
  platform: string | null
  createdAt: string
}

interface ContentGeneratorProps {
  onPostGenerated?: () => void
}

export default function ContentGenerator({
  onPostGenerated,
}: ContentGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [platform, setPlatform] = useState('general')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(
    null
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setGeneratedPost(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          platform: platform !== 'general' ? platform : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content')
      }

      if (data.success) {
        setGeneratedPost(data.data)
        setPrompt('')
        if (onPostGenerated) {
          onPostGenerated()
        }
      } else {
        throw new Error(data.error || 'Failed to generate content')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Generate New Content
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="platform"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Platform (Optional)
          </label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="general">General</option>
            <option value="twitter">Twitter/X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Topic or Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., 'Write a post about the benefits of remote work'"
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Content'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {generatedPost && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Generated Content
          </h3>
          
          {generatedPost.structuredContent ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Caption:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {generatedPost.structuredContent.caption}
                </p>
              </div>
              {generatedPost.structuredContent.hashtags.length > 0 && (
                <div className="bg-white p-4 rounded border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Hashtags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedPost.structuredContent.hashtags.map((hashtag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm"
                      >
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-4 rounded border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">
                {generatedPost.content}
              </p>
            </div>
          )}
          
          {generatedPost.platform && (
            <p className="mt-2 text-sm text-gray-600">
              Platform: <span className="font-medium">{generatedPost.platform}</span>
            </p>
          )}
          <p className="mt-2 text-sm text-gray-600">
            Generated at:{' '}
            <span className="font-medium">
              {new Date(generatedPost.createdAt).toLocaleString()}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

