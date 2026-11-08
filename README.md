Spectraverse

> Privacy-first AI assistant and coding agent on local, privately hosted open-source models

**Vision:** the experience of a modern AI coding agent, desktop app and web assistant — but running entirely on models you host yourself (on your Mac or your own server), with no data leaving your control.

Spectraverse is a modern web application that allows users to interact with AI models running locally on their machines via Ollama. Built with Next.js 15, it emphasizes data ownership, security, and offline operation while providing a polished web interface for AI conversations.

## Key Features

- **100% Local AI Processing** - Your conversations never leave your machine
- **Multi-Model Support** - Switch between any installed Ollama model
- **Real-time Streaming** - Character-by-character response streaming for responsive UX
- **Conversation Management** - Create, rename, and organize your chat history
- **Model Management** - Download, view, and delete Ollama models directly from the UI
- **Data Export** - Export your conversations to JSON or Excel format
- **Privacy-First Design** - No cloud AI costs, no data sharing, full user control
- **Dark/Light Mode** - Beautiful UI with theme switching

## How It Works

### User Journey

**1. Open & Start Chatting**

- Users land on the app and start immediately — no sign-in required
- A unique local user ID is auto-generated on first use and stored in the browser's localStorage
- Conversation history persists across sessions via the local database

**2. Chat Interface**

- Select from any installed Ollama model via dropdown
- Start conversations using prompt cards or custom input

**3. Message Processing**

- Messages are sent directly from the browser to the user's local Ollama instance
- No server-side AI processing (ensures privacy and zero cloud costs)
- Responses stream in real-time for immediate feedback
- Both user messages and AI responses are persisted to a local sqld database (libsql-server running in Docker on `localhost:8190`) via a client-side database call

**4. Settings & Customization**

- Configure custom Ollama server URLs
- Test Ollama connection status
- Download new models from Ollama library
- Manage installed models (view details, delete)
- Export conversation data
- Bulk delete chat history

## Tech Stack

### Core Framework

- **Next.js 15** - React framework with App Router and Turbopack
- **React 19** - UI library
- **TypeScript 5** - Type safety

### Database & ORM

- **sqld / LibSQL** - Local database server running in Docker on `localhost:8190`
- **@libsql/client** - Client-side LibSQL driver (web variant)
- **Drizzle ORM 0.44** - Type-safe database operations

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

### AI & LLM Integration

- **ai** (^4.3.16) - Vercel AI SDK providing streaming utilities, message management, and React hooks
- **@ai-sdk/openai-compatible** (^0.2.14) - Adapter for OpenAI-compatible APIs (used for Ollama integration)
- **@ai-sdk/react** (^1.2.12) - React-specific hooks and components for AI SDK

### Database & ORM

- **@libsql/client** - Client-side driver for sqld/LibSQL (web variant, connects to `localhost:8190`)
- **drizzle-orm** (^0.44.5) - Type-safe ORM with excellent TypeScript support
- **drizzle-kit** (^0.31.4) - Database migration and schema management CLI

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
- **Docker** - [Install Docker Desktop](https://www.docker.com/products/docker-desktop/) — used to run the local database (and Ollama, unless you use the macOS native script)

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/spectra-verse/WebApp.git
cd WebApp
npm install
```

### 2. Run the Setup Script

The setup script starts the local database (sqld) in Docker, runs schema migrations, installs Ollama with CORS enabled, and lets you choose which AI models to download (Gemma 4 by default).

| Platform | Command | Ollama runs |
|---|---|---|
| macOS (recommended) | `bash scripts/spectraverse-install-mac-native.sh` | Natively (Metal GPU) |
| macOS / Linux | `bash scripts/spectraverse-install.sh` | In Docker |
| Windows (PowerShell) | `powershell -ExecutionPolicy Bypass -File scripts\spectraverse-install.ps1` | In Docker |

This sets up:
- **Ollama** on `localhost:11434` with CORS enabled (so the browser app can reach it)
- **sqld** (LibSQL) container `spectraverse-db` on `localhost:8190` with the full database schema
- Your chosen Ollama models

**Keeping Ollama current.** The newest models need a recent Ollama (currently **0.40.15+**; each model's minimum is `requiresOllama` in the model list). The macOS native script updates Ollama automatically when it's older (Homebrew formula/cask, or by replacing `/Applications/Ollama.app` with the signed download). The Docker scripts always pull the latest `ollama/ollama` image. If a model fails to download, the script skips it and lists it at the end.

**Choosing models.** On macOS/Linux the script shows a numbered menu; press Enter for Gemma 4. To skip the menu (e.g. in CI) set `SPECTRAVERSE_MODELS`:

```bash
SPECTRAVERSE_MODELS="gemma4 qwen3.5" bash scripts/spectraverse-install-mac-native.sh
```

On Windows: `$env:SPECTRAVERSE_MODELS = "gemma4 qwen3.5"` before running the script.

## Supported Models

Any Ollama model works. The curated list shown on the landing page, in **Settings → Install New Models**, and in the install menus lives in [`lib/models/curated-models.json`](lib/models/curated-models.json) and is reviewed weekly against the [Ollama library](https://ollama.com/library). It is tuned for Apple Silicon MacBooks — every model lists the minimum unified memory it needs:

| Mac memory | Models |
|---|---|
| 8 GB+ | Bonsai 2 (Prism ML), Nemotron 3 Nano 4B (NVIDIA), LFM3 1.7B (Liquid AI) |
| 16 GB+ | **Gemma 4 (default, Google)**, Qwen 3.5 9B (Alibaba), Ornith 1.5 9B, Ministral 3 8B (Mistral AI), Granite 4.2 8B (IBM), LFM2.5 8B (Liquid AI), MiMo V2.6 (Xiaomi) |
| 24 GB+ | gpt-oss 20B (OpenAI) |
| 32 GB+ | Qwen 3.8 27B (Alibaba), Muse Glimmer 30B (Meta) |
| 48 GB+ | Laguna XS 2.1 (Poolside), Flint 40B MoE (Recursive) |

See [CHANGELOG.md](CHANGELOG.md) for updates.

### 3. Start Development Server

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
```

## Project Structure

```
spectraverse/
├── app/                      # Next.js App Router
│   ├── (chat)/              # Protected chat routes
│   │   ├── chat/            # New chat page
│   │   ├── conversations/   # Existing conversations
│   │   └── settings/        # User settings
│   ├── api/                 # API routes
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── chat/               # Chat interface components
│   ├── sidebar/            # Sidebar navigation
│   ├── settings/           # Settings page components
│   ├── ui/                 # Reusable UI components
│   └── providers/          # React context providers
├── lib/                     # Core business logic
│   ├── actions/            # Client-callable action functions
│   ├── db/                 # Database utilities
│   ├── client-db.ts        # LibSQL client (connects to localhost:8190)
│   └── ollama/             # Ollama integration
├── hooks/                   # Custom React hooks
│   ├── useOllamaChat.ts    # Chat logic & streaming
│   └── useModelSelection.ts # Model management
├── db/                      # Database schema & migrations
│   └── schema.ts           # Drizzle schema definitions
└── styles/                  # Global styles
```

## Deployment

### Important Deployment Notes

- **Ollama Access**: Users must have Ollama running locally on their machines
- **CORS**: Users need to configure Ollama CORS to allow your domain

## Local Ollama Requirements

For the AI chat to work, users must:

1. **Run the setup script** (see [Run the Setup Script](#2-run-the-setup-script)), which installs Ollama with CORS pre-configured and lets you choose models to download
2. **Keep Ollama and the database running** while using the chat interface — Docker install: `docker start ollama spectraverse-db`; macOS native: open the Ollama app and `docker start spectraverse-db`
3. **If chat can't connect** on macOS native, Ollama is probably running without CORS (the Ollama menu-bar app ignores `OLLAMA_ORIGINS`): quit the Ollama app and run `OLLAMA_ORIGINS="*" ollama serve`, or re-run the setup script

The Settings page in the app provides connection testing and lets you pull additional models.

## License

MIT © [Spectraverse Inc.](LICENSE)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Ollama](https://ollama.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
