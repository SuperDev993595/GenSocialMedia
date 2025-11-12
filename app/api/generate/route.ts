import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateSocialMediaContent } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const generateSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt is too long'),
  platform: z.string().optional(),
  userId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, platform, userId } = generateSchema.parse(body)

    // Generate content using OpenAI
    const content = await generateSocialMediaContent({
      prompt,
      platform: platform || 'general',
    })

    // Store in database
    const generatedPost = await prisma.generatedPost.create({
      data: {
        prompt,
        content,
        platform: platform || null,
        userId: userId || null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: generatedPost.id,
          prompt: generatedPost.prompt,
          content: generatedPost.content,
          platform: generatedPost.platform,
          createdAt: generatedPost.createdAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error generating content:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    // Handle Prisma connection errors
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          message: 'Please check your DATABASE_URL in the .env file. Make sure your database is running and the credentials are correct.',
          details: process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'Database connection error. Check your configuration.',
        },
        { status: 503 }
      )
    }

    if (error instanceof Error) {
      // Handle rate limit errors
      if (error.message.includes('Rate limit')) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 429 }
        )
      }

      // Handle other errors
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to generate content',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

