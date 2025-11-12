import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const posts = await prisma.generatedPost.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        prompt: true,
        content: true,
        platform: true,
        createdAt: true,
      },
    })

    const total = await prisma.generatedPost.count({
      where: userId ? { userId } : undefined,
    })

    return NextResponse.json(
      {
        success: true,
        data: posts,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching posts:', error)

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
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch posts',
          message: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch posts',
      },
      { status: 500 }
    )
  }
}

