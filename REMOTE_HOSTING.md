# Remote Hosting with Local Ollama

This document explains how the application supports remote hosting while connecting to local Ollama instances.

## Architecture Overview

The application now uses a **client-side connection architecture** where:
- The browser connects directly to the user's local Ollama instance
- The remote server handles authentication, database operations, and UI
- Each user can configure their own Ollama URL in settings

## How It Works

### Previous Architecture (Local Only)
```
Browser → Next.js Server (localhost) → Ollama (localhost)
```
This only worked when everything ran on the same machine.

### New Architecture (Remote + Local Ollama)
```
Browser → Remote Next.js Server (spectraverse.net) [Auth & Database]
Browser → Local Ollama (localhost:11434) [AI Chat]
```

## Key Changes

### 1. Client-Side Ollama Integration
- **File**: `lib/ollama/clientOllama.ts`
- Direct API calls from browser to Ollama
- Streaming support for chat responses
- Model fetching and connection testing

### 2. Custom Chat Hook
- **File**: `hooks/useOllamaChat.ts`
- Replaces AI SDK's `useChat` with direct Ollama streaming
- Handles message persistence via server actions
- Works with user-configured Ollama URLs

### 3. Updated Components
- **Chat component**: Uses client-side Ollama connection
- **Settings page**: Includes CORS configuration instructions
- **Model management**: Client-side model fetching

## User Setup Requirements

### CORS Configuration
Ollama must be configured to allow browser connections. Users need to:

1. Set the environment variable:
   ```bash
   export OLLAMA_ORIGINS=*
   ```

   For production, use specific domain:
   ```bash
   export OLLAMA_ORIGINS=https://spectraverse.net
   ```

2. Restart Ollama

### Platform-Specific Instructions

**macOS/Linux:**
```bash
export OLLAMA_ORIGINS=*
ollama serve
```

**Windows:**
```powershell
$env:OLLAMA_ORIGINS="*"
ollama serve
```

**Docker:**
```bash
docker run -d -e OLLAMA_ORIGINS=* -p 11434:11434 ollama/ollama
```

## Deployment

When deploying to a remote server:

1. Deploy the Next.js app to any hosting platform (Vercel, Railway, etc.)
2. Configure environment variables for database and OAuth
3. Users access the app at `https://spectraverse.net`
4. Each user configures their local Ollama URL in settings
5. Users must enable CORS on their local Ollama instance

## Security Considerations

- **CORS**: In production, set `OLLAMA_ORIGINS` to your specific domain instead of `*`
- **Local Network**: Ollama typically runs on localhost, not exposed to internet
- **No Authentication**: Ollama doesn't require authentication by default
- **User Data**: Chat messages are saved to the remote database after completion

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Ensure Ollama is running with CORS enabled:
   ```bash
   export OLLAMA_ORIGINS=*
   ollama serve
   ```

3. Configure Ollama URL in settings (default: `http://localhost:11434/v1`)
4. Test connection in settings page
5. Start a chat conversation

## Troubleshooting

### Connection Failed
- Verify Ollama is running: `ollama list`
- Check CORS is enabled: `echo $OLLAMA_ORIGINS`
- Verify URL in settings is correct
- Check browser console for CORS errors

### Models Not Loading
- Ensure at least one model is installed: `ollama pull llama3.2`
- Refresh the models list in settings
- Check Ollama URL configuration

### Chat Not Streaming
- Verify CORS configuration
- Check browser console for errors
- Test connection in settings page first

## Future Improvements

- [ ] Option to use remote Ollama instance
- [ ] WebSocket connection for better reliability
- [ ] Encrypted tunnel support (ngrok, Cloudflare Tunnel)
- [ ] Multiple Ollama instance support
