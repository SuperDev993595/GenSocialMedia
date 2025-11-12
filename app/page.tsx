'use client'

import { useState } from 'react'
import ContentGenerator from '@/components/ContentGenerator'
import PostHistory from '@/components/PostHistory'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handlePostGenerated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Social Media Content Generator
          </h1>
          <p className="text-gray-600">
            Generate engaging social media posts with AI
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <ContentGenerator onPostGenerated={handlePostGenerated} />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <PostHistory key={refreshKey} />
        </div>
      </div>
    </main>
  )
}

