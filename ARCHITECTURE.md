# Architecture Document

## Overview

This document outlines the architectural decisions, trade-offs, and scaling considerations for the AI Social Media Content Generator application. The application is built as a Next.js full-stack application that integrates with OpenAI's API to generate social media content and stores the results in PostgreSQL.

## Technology Stack

### Core Technologies

1. **Next.js 14 (App Router)**
   - **Decision**: Use Next.js 14 with App Router for modern React development
   - **Rationale**: 
     - Server-side rendering and API routes in one framework
     - Built-in optimizations for performance
     - TypeScript support out of the box
     - Easy deployment to Vercel

2. **TypeScript**
   - **Decision**: Use TypeScript for type safety
   - **Rationale**: 
     - Catch errors at compile time
     - Better IDE support and autocomplete
     - Improved code maintainability

3. **PostgreSQL with Prisma ORM**
   - **Decision**: Use PostgreSQL as the database with Prisma as the ORM
   - **Rationale**: 
     - PostgreSQL is robust and scalable
     - Prisma provides type-safe database access
     - Excellent migration system
     - Works well with Next.js

4. **OpenAI API (GPT-4o)**
   - **Decision**: Use OpenAI's GPT-4o model via their official SDK
   - **Rationale**: 
     - High-quality content generation
     - Reliable API with good documentation
     - JSON response format support for structured output
     - Industry-standard AI service

5. **Tailwind CSS**
   - **Decision**: Use Tailwind CSS for styling
   - **Rationale**: 
     - Utility-first approach for rapid development
     - Consistent design system
     - Small bundle size with purging

## Application Architecture

### Directory Structure

```
GenSocialMedia/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── generate/      # Content generation endpoint
│   │   └── posts/         # Posts retrieval endpoint
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ContentGenerator.tsx
│   └── PostHistory.tsx
├── lib/                  # Utility libraries
│   ├── openai.ts         # OpenAI integration
│   └── prisma.ts         # Prisma client singleton
└── prisma/
    └── schema.prisma     # Database schema
```

### Data Flow

1. **Content Generation Flow**:
   ```
   User Input → ContentGenerator Component 
   → POST /api/generate 
   → OpenAI API (generateSocialMediaContent)
   → Parse JSON Response
   → Store in Database
   → Return to Frontend
   ```

2. **Post Retrieval Flow**:
   ```
   PostHistory Component 
   → GET /api/posts 
   → Prisma Query
   → Return Posts with Pagination
   ```

### API Design

#### POST `/api/generate`

**Purpose**: Generate social media content from a user prompt

**Request**:
```typescript
{
  prompt: string
  platform?: string
  userId?: string
}
```

**Response**:
```typescript
{
  success: boolean
  data: {
    id: string
    prompt: string
    content: string
    structuredContent: {
      caption: string
      hashtags: string[]
    }
    platform: string | null
    createdAt: string
  }
}
```

**Error Handling**:
- 400: Validation errors (Zod schema validation)
- 429: Rate limit errors from OpenAI
- 500: Server errors
- 503: Database connection errors

#### GET `/api/posts`

**Purpose**: Retrieve generated posts with pagination

**Query Parameters**:
- `userId` (optional): Filter by user
- `limit` (optional): Number of posts (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response**:
```typescript
{
  success: boolean
  data: Post[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}
```

### Database Schema

```prisma
model GeneratedPost {
  id          String   @id @default(cuid())
  prompt      String
  content     String   @db.Text
  platform    String?
  userId      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([createdAt])
}
```

**Design Decisions**:
- Use CUID for IDs (better than auto-increment for distributed systems)
- Store full content as Text (supports long posts)
- Optional platform and userId for flexibility
- Indexes on userId and createdAt for query performance

### OpenAI Integration

**Structured Output**:
- Uses `response_format: { type: 'json_object' }` to ensure JSON responses
- Expected format:
  ```json
  {
    "caption": "Main caption text",
    "hashtags": ["#hashtag1", "#hashtag2"]
  }
  ```
- Fallback handling if JSON parsing fails

**Error Handling**:
- Rate limit detection (429 status)
- API error handling with user-friendly messages
- Fallback to plain text if structured output fails

## Security Considerations

1. **API Key Management**:
   - OpenAI API key stored in environment variables
   - Never exposed to client-side code
   - Should be rotated periodically

2. **Input Validation**:
   - Zod schema validation for all API inputs
   - Prompt length limits (max 1000 characters)
   - SQL injection prevention via Prisma ORM

3. **Error Messages**:
   - Detailed errors in development
   - Generic errors in production
   - No sensitive information in error responses

## Performance Considerations

1. **Database**:
   - Indexes on frequently queried fields
   - Pagination to limit result sets
   - Connection pooling via Prisma

2. **API Calls**:
   - OpenAI API calls are synchronous (blocking)
   - Consider async job queue for production scale
   - Rate limiting should be implemented

3. **Frontend**:
   - Client-side state management
   - Optimistic UI updates
   - Loading states for better UX

## Scalability Considerations

### Current Limitations

1. **Synchronous API Calls**: OpenAI API calls block the request
2. **No Caching**: Every request hits the database
3. **No Rate Limiting**: Users can make unlimited requests
4. **Single Database**: No read replicas

### Future Improvements

1. **Background Jobs**:
   - Move OpenAI calls to background jobs (BullMQ, AWS SQS)
   - Webhook or polling for job completion
   - Better user experience for long-running generations

2. **Caching**:
   - Redis cache for frequently accessed posts
   - Cache OpenAI responses for similar prompts
   - CDN for static assets

3. **Rate Limiting**:
   - Implement per-user rate limits
   - Use middleware like `@upstash/ratelimit`
   - Protect against abuse

4. **Database Scaling**:
   - Read replicas for GET requests
   - Connection pooling optimization
   - Consider sharding for very large datasets

5. **Monitoring**:
   - Error tracking (Sentry)
   - Performance monitoring (Vercel Analytics)
   - OpenAI API usage tracking

## Deployment Architecture

### Recommended: Vercel

**Why Vercel**:
- Zero-config Next.js deployment
- Automatic HTTPS
- Edge functions support
- Built-in environment variable management
- Database connection pooling

### Alternative Platforms

- **Railway**: Good for full-stack apps with databases
- **Netlify**: Similar to Vercel, good Next.js support
- **AWS Amplify**: For AWS ecosystem integration
- **Self-hosted**: Docker containers on VPS/cloud

### Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key

Optional:
- `NODE_ENV`: Environment (development/production)

## Testing Strategy

### Current State
- No automated tests currently implemented

### Recommended Testing

1. **Unit Tests**:
   - Test OpenAI integration with mocks
   - Test Prisma queries
   - Test utility functions

2. **Integration Tests**:
   - Test API routes end-to-end
   - Test database operations
   - Test error handling

3. **E2E Tests**:
   - Test user flows with Playwright/Cypress
   - Test content generation flow
   - Test post history display

## Error Handling Strategy

1. **API Errors**:
   - Try-catch blocks in all API routes
   - Specific error types (ZodError, PrismaError, OpenAIError)
   - Appropriate HTTP status codes
   - User-friendly error messages

2. **Frontend Errors**:
   - Error boundaries for React components
   - Loading and error states
   - User feedback for all actions

3. **Database Errors**:
   - Connection error detection
   - Retry logic for transient errors
   - Graceful degradation

## Future Enhancements

1. **Multi-user Support**:
   - Authentication system (NextAuth.js)
   - User-specific post filtering
   - User preferences

2. **Content Features**:
   - Edit generated content
   - Save drafts
   - Export to different formats
   - Scheduled posting

3. **AI Enhancements**:
   - Multiple AI model support
   - Custom prompts/templates
   - A/B testing for content
   - Analytics on generated content

4. **Platform-Specific Features**:
   - Character count limits per platform
   - Platform-specific formatting
   - Image generation integration
   - Link previews

## Conclusion

This architecture provides a solid foundation for a social media content generation application. The use of modern technologies (Next.js, TypeScript, Prisma) ensures maintainability and scalability. The structured approach to error handling and API design makes the application robust and user-friendly.

For production deployment, consider implementing the scalability improvements mentioned above, especially background job processing and rate limiting.

