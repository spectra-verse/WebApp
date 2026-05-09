# Spectraverse

> Privacy-first AI chat application with local LLM processing

Spectraverse is a modern web application that allows users to interact with AI models running locally on their machines via Ollama. Built with Next.js 15, it emphasizes data ownership, security, and offline operation while providing a polished web interface for AI conversations.

## Key Features

- **100% Local AI Processing** - Your conversations never leave your machine
- **Multi-Model Support** - Switch between any installed Ollama model
- **Real-time Streaming** - Character-by-character response streaming for responsive UX
- **Multiple Authentication Methods** - Email/password, Google OAuth, and GitHub OAuth
- **Conversation Management** - Create, rename, and organize your chat history
- **Model Management** - Download, view, and delete Ollama models directly from the UI
- **Data Export** - Export your conversations to JSON or Excel format
- **Privacy-First Design** - No cloud AI costs, no data sharing, full user control
- **Dark/Light Mode** - Beautiful UI with theme switching
- **Offline Capable** - Works without internet connection (with local proxy mode)

## How It Works

### User Journey

**1. Landing & Authentication**

- Users land on the marketing page showcasing features
- Sign in with Google, GitHub OAuth, or email/password
- Sessions are securely managed with Better-Auth and stored in PostgreSQL

**2. Chat Interface**

- After authentication, users are directed to the chat interface
- Select from any installed Ollama model via dropdown
- Start conversations using prompt cards or custom input

**3. AI Conversation Flow**

```
User Input
    ↓
React Client Component
    ↓
Direct Fetch to Local Ollama (localhost:11434)
    ↓
Streaming Response (real-time character display)
    ↓
Save to PostgreSQL via Server Action
```

**4. Message Processing**

- Messages are sent directly from the browser to the user's local Ollama instance
- No server-side AI processing (ensures privacy and zero cloud costs)
- Responses stream in real-time for immediate feedback
- Both user messages and AI responses are persisted to the database

**5. Settings & Customization**

- Configure custom Ollama server URLs
- Test Ollama connection status
- Download new models from Ollama library
- Manage installed models (view details, delete)
- Export conversation data
- Bulk delete chat history

### Architecture Highlights

**Client-Server Separation:**

- **Client Components**: Handle all Ollama communication (chat interface, model management)
- **Server Components**: Handle authentication and data persistence
- This architecture allows direct localhost connections from the browser to Ollama

**Dual Storage Modes:**

1. **Cloud Mode (Default)**: PostgreSQL via Neon serverless - accessible from any device
2. **Local Proxy Mode**: SQLite database - fully offline operation

**Security:**

- Better-Auth handles authentication with industry-standard security
- OAuth tokens securely stored
- Session management with HTTP-only cookies
- All AI processing happens locally (no data sent to external services)

## Tech Stack

### Core Framework

- **Next.js 15** - React framework with App Router and Turbopack
- **React 19** - UI library
- **TypeScript 5** - Type safety

### Authentication

- **Better-Auth 1.3** - Modern authentication library
- **OAuth Providers** - GitHub and Google integration
- **crypto-js** - Encryption utilities

### Database & ORM

- **PostgreSQL** - Primary database (Neon serverless)
- **Drizzle ORM 0.44** - Type-safe database operations
- **SQLite** - Optional local storage (ollama-next.db)

### AI Integration

- **Vercel AI SDK 4.3** - Streaming utilities and message management
- **Ollama** - Local LLM runtime (user-installed)
- **@ai-sdk/openai-compatible** - OpenAI-compatible API adapter

### UI & Styling

- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Accessible, unstyled component primitives
- **Lucide React** - Icon library
- **next-themes** - Dark mode support

### Content & Data

- **react-markdown** - Markdown rendering with GitHub Flavored Markdown
- **xlsx** - Excel export functionality

## Third-Party Libraries

### Authentication & Security

- **better-auth** (^1.3.11) - Comprehensive authentication with OAuth, email/password, session management
- **crypto-js** (^4.2.0) - Encryption and secure data handling utilities

### AI & LLM Integration

- **ai** (^4.3.16) - Vercel AI SDK providing streaming utilities, message management, and React hooks
- **@ai-sdk/openai-compatible** (^0.2.14) - Adapter for OpenAI-compatible APIs (used for Ollama integration)
- **@ai-sdk/react** (^1.2.12) - React-specific hooks and components for AI SDK

### Database & ORM

- **drizzle-orm** (^0.44.5) - Type-safe ORM with excellent TypeScript support
- **drizzle-kit** (^0.31.4) - Database migration and schema management CLI
- **@neondatabase/serverless** (^1.0.1) - Neon PostgreSQL serverless driver
- **pg** (^8.16.3) - PostgreSQL client for Node.js

### UI Components (Radix UI Primitives)

- **@radix-ui/react-accordion** (^1.2.12) - Collapsible content sections
- **@radix-ui/react-hover-card** (^1.1.15) - Floating cards on hover
- **@radix-ui/react-label** (^2.1.7) - Accessible form labels
- **@radix-ui/react-popover** (^1.1.15) - Overlay panels and dropdowns
- **@radix-ui/react-progress** (^1.1.7) - Progress bars
- **@radix-ui/react-select** (^2.2.4) - Custom select dropdowns
- **@radix-ui/react-slot** (^1.1.2) - Component composition utility

### Styling & Utilities

- **tailwindcss** (^4) - Utility-first CSS framework
- **tailwindcss-animate** (^1.0.7) - Animation utilities for Tailwind
- **@tailwindcss/typography** (^0.5.16) - Beautiful typographic defaults for markdown
- **class-variance-authority** (^0.7.1) - CSS variant management for components
- **clsx** (^2.1.1) - Conditional className utility
- **tailwind-merge** (^3.3.1) - Intelligent Tailwind class merging (prevents conflicts)
- **next-themes** (^0.4.6) - Dark mode and theme switching

### Content Rendering

- **react-markdown** (^10.1.0) - Renders markdown as React components
- **remark-gfm** (^4.0.1) - GitHub Flavored Markdown support (tables, task lists, strikethrough)

### UI Interactions

- **swiper** (^12.0.1) - Touch-enabled carousel and slider component
- **lucide-react** (^0.474.0) - Beautiful, consistent icon library

### Data Export

- **xlsx** (^0.18.5) - Excel file generation for exporting conversations

### Development Utilities

- **dotenv** (^17.2.2) - Environment variable management
- **tsx** (^4.19.2) - TypeScript execution for migration scripts

## Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher recommended)
- **PostgreSQL Database** - Either:
  - Neon serverless account (recommended for cloud deployment)
  - Local PostgreSQL instance
- **Ollama** - [Install Ollama](https://ollama.com/) and ensure it's running on `localhost:11434`
- **OAuth Credentials** (optional, for social login):
  - GitHub OAuth App credentials
  - Google OAuth 2.0 credentials

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd spectraverse
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host/database"

# Authentication (generate a random secret)
BETTER_AUTH_SECRET="your-random-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: Use local storage mode
# NEXT_PUBLIC_USE_LOCAL_PROXY=true
```

**Getting OAuth Credentials:**

- **GitHub**: Create an OAuth App at [GitHub Developer Settings](https://github.com/settings/developers)
  - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

- **Google**: Create credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
  - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Database Setup

Run migrations to set up your database schema:

```bash
# Using Drizzle Kit
npm run db:push

# Or manually run migrations
npm run sql:migrate
```

This will create the necessary tables:

- `user`, `session`, `account`, `verification` (authentication)
- `conversations`, `messages` (chat data)
- `userSettings` (Ollama configuration)

### 4. Ollama Setup

Install and start Ollama:

```bash
# Install Ollama from https://ollama.com/

# Start Ollama (it runs on localhost:11434 by default)
ollama serve

# Pull a model (e.g., llama3.2)
ollama pull llama3.2
```

**CORS Configuration:**

For browser-based Ollama access, set the CORS origin:

```bash
# Linux/Mac
export OLLAMA_ORIGINS="http://localhost:3000"

# Windows (PowerShell)
$env:OLLAMA_ORIGINS="http://localhost:3000"
```

Or configure in Ollama settings (instructions provided in the app's Settings page).

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Database operations
npm run db:migrate    # Run Drizzle migrations
npm run db:push       # Push schema changes to database
npm run sql:migrate   # Run manual SQL migrations
```

## Project Structure

```
spectraverse/
├── app/                      # Next.js App Router
│   ├── (chat)/              # Protected chat routes
│   │   ├── chat/            # New chat page
│   │   ├── conversations/   # Existing conversations
│   │   └── settings/        # User settings
│   ├── auth/                # Authentication pages
│   ├── api/                 # API routes (Better-Auth, Ollama)
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── chat/               # Chat interface components
│   ├── sidebar/            # Sidebar navigation
│   ├── settings/           # Settings page components
│   ├── ui/                 # Reusable UI components
│   └── providers/          # React context providers
├── lib/                     # Core business logic
│   ├── actions/            # Server actions
│   ├── db/                 # Database utilities
│   ├── ollama/             # Ollama integration
│   ├── auth.ts             # Better-Auth configuration
│   └── auth-client.ts      # Client-side auth
├── hooks/                   # Custom React hooks
│   ├── useOllamaChat.ts    # Chat logic & streaming
│   └── useModelSelection.ts # Model management
├── db/                      # Database schema & migrations
│   └── schema.ts           # Drizzle schema definitions
└── styles/                  # Global styles
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**

```bash
git push origin main
```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your repository
   - Vercel auto-detects Next.js configuration

3. **Configure Environment Variables**

In Vercel project settings, add all environment variables from `.env.local`:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (use your Vercel domain)
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

4. **Update OAuth Callback URLs**

Update your OAuth app settings with production URLs:

- GitHub: `https://your-domain.vercel.app/api/auth/callback/github`
- Google: `https://your-domain.vercel.app/api/auth/callback/google`

5. **Deploy**

Vercel automatically deploys on push to main branch.

### Important Deployment Notes

- **Ollama Access**: Users must have Ollama running locally on their machines
- **CORS**: Users need to configure Ollama CORS to allow your domain
- **Database**: Ensure your PostgreSQL database is accessible from Vercel (Neon works great)
- **Build**: Next.js 15 with Turbopack is fully supported on Vercel

## Local Ollama Requirements

For the AI chat to work, users must:

1. **Install Ollama** from [ollama.com](https://ollama.com/)
2. **Pull at least one model**: `ollama pull llama3.2`
3. **Configure CORS** to allow the application domain
4. **Keep Ollama running** while using the chat interface

The Settings page in the app provides detailed instructions and connection testing.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [Better-Auth](https://www.better-auth.com/)
- AI powered by [Ollama](https://ollama.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
