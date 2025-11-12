import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GenerateContentParams {
  prompt: string
  platform?: string
  maxTokens?: number
}

export interface StructuredContent {
  caption: string
  hashtags: string[]
  fullText?: string // Combined caption + hashtags for backward compatibility
}

export async function generateSocialMediaContent(
  params: GenerateContentParams
): Promise<StructuredContent> {
  const { prompt } = params

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        { role: 'user', content: prompt },
      ],
      
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content generated from OpenAI')
    }

    try {
      const parsed = JSON.parse(content.trim()) as StructuredContent
      
      // Validate structure
      if (!parsed.caption || !Array.isArray(parsed.hashtags)) {
        throw new Error('Invalid response structure from OpenAI')
      }

      // Create full text for backward compatibility
      const hashtagsText = parsed.hashtags.join(' ')
      parsed.fullText = `${parsed.caption}\n\n${hashtagsText}`

      return parsed
    } catch (parseError) {
      // Fallback: if JSON parsing fails, treat as plain text
      return {
        caption: content.trim(),
        hashtags: [],
        fullText: content.trim(),
      }
    }
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      // Handle rate limits
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.')
      }
      // Handle other API errors
      throw new Error(`OpenAI API error: ${error.message}`)
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred while generating content')
  }
}

