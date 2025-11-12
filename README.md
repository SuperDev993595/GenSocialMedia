# AI Social Media Content Generator

A Next.js application that generates engaging social media content using OpenAI's API. Users can input a topic or prompt, and the application will generate platform-specific social media posts that are stored in a PostgreSQL database.

## Features

- 🤖 **AI-Powered Content Generation**: Uses OpenAI GPT-4o-mini to generate social media content
- 📱 **Platform-Specific Content**: Generate content tailored for Twitter/X, LinkedIn, Instagram, or Facebook
- 💾 **Post History**: View and manage previously generated posts
- 🔒 **Error Handling**: Comprehensive error handling for API failures and rate limits
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI API**: OpenAI (GPT-4o-mini)
- **Styling**: Tailwind CSS
- **Validation**: Zod

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ and npm/yarn
- PostgreSQL database (local or hosted)
- OpenAI API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GenSocialMeida
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/social_media_generator?schema=public"

# OpenAI API
OPENAI_API_KEY="your_openai_api_key_here"
```

**For hosted PostgreSQL (Supabase/Neon):**
- Get your connection string from your database provider
- Replace the `DATABASE_URL` with your connection string

**For OpenAI API Key:**
- Sign up at [OpenAI](https://platform.openai.com/)
- Generate an API key from the dashboard
- Add it to your `.env` file

### 4. Set Up the Database

Generate Prisma Client:

```bash
npm run db:generate
```

Push the schema to your database:

```bash
npm run db:push
```

Or run migrations:

```bash
npm run db:migrate
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
GenSocialMeida/
├── app/
│   ├── api/
│   │   ├── generate/      # API route for content generation
│   │   └── posts/          # API route for fetching posts
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── ContentGenerator.tsx   # Form component for generating content
│   └── PostHistory.tsx     # Component for displaying post history
├── lib/
│   ├── openai.ts           # OpenAI API integration
│   └── prisma.ts           # Prisma client singleton
├── prisma/
│   └── schema.prisma       # Database schema
└── README.md
```

## API Endpoints

### POST `/api/generate`

Generate social media content from a prompt.

**Request Body:**
```json
{
  "prompt": "Write a post about remote work benefits",
  "platform": "linkedin",  // optional
  "userId": "user123"       // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "prompt": "Write a post about remote work benefits",
    "content": "Generated content here...",
    "platform": "linkedin",
    "createdAt": "2024-11-16T10:00:00.000Z"
  }
}
```

### GET `/api/posts`

Fetch generated posts with pagination.

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `limit` (optional): Number of posts to return (default: 10)
- `offset` (optional): Number of posts to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## Database Schema

The `GeneratedPost` model stores:
- `id`: Unique identifier (CUID)
- `prompt`: User's input prompt
- `content`: Generated content
- `platform`: Target platform (optional)
- `userId`: User identifier (optional, for future multi-user support)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## Error Handling

The application handles various error scenarios:

- **Validation Errors**: Invalid input is caught and returned with 400 status
- **Rate Limits**: OpenAI rate limit errors return 429 status with a user-friendly message
- **API Errors**: OpenAI API errors are caught and returned with appropriate status codes
- **Database Errors**: Database connection and query errors are handled gracefully

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Prisma Studio

To view and manage your database visually:

```bash
npm run db:studio
```

This opens Prisma Studio at `http://localhost:5555`.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Node.js

Make sure to:
- Set all environment variables
- Run database migrations before deployment
- Ensure your database is accessible from the deployment platform

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Ensure your database is running and accessible
- Check firewall settings if using a remote database

### OpenAI API Issues

- Verify your API key is correct and has credits
- Check rate limits if you're getting 429 errors
- Ensure your OpenAI account has access to the API

### Build Errors

- Run `npm run db:generate` to regenerate Prisma Client
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## License

This project is created for evaluation purposes.

## Contact

For questions or issues, please open an issue in the repository.

