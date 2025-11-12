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

export async function generateSocialMediaContent(
  params: GenerateContentParams
): Promise<string> {
  const { prompt, platform = 'general', maxTokens = 500 } = params

  const systemPrompt = `You are an expert social media content creator. Generate engaging, authentic social media posts based on the user's prompt. 
The content should be:
- Engaging and authentic
- Appropriate for the specified platform (${platform})
- Well-formatted and ready to post
- Between 100-500 words depending on the platform

Format your response as clean, ready-to-post content without any meta-commentary or explanations.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content generated from OpenAI')
    }

    return content.trim()
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

