# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a travel planning web application built with React, TypeScript, Vite, and shadcn-ui. The application features an interactive 3D globe powered by Mapbox, an AI-powered travel chatbot using OpenAI, and travel analytics tools.

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (runs on http://[::]:8080)
npm run dev

# Build for production
npm run build

# Build for development (with component tagger)
npm run build:dev

# Lint the codebase
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Application Structure

The app uses React Router with the following pages:
- `/` - Index page (main travel planner interface)
- `/analytics` - Analytics dashboard
- `/mytrip` - Trip management page
- `*` - 404 NotFound page

Routes are defined in `src/App.tsx` with React Query for data fetching and Tanstack Query Client for state management.

### Key Components

**Index Page Layout** (`src/pages/Index.tsx`):
The main page is a full-screen layout with overlaid components:
- `Map` - Interactive Mapbox globe (bottom layer)
- `Navigation` - Top navigation bar
- `InfoBox` - Visitor analytics widget (top-right, position: fixed)
- `WeatherBox` - Weather forecast widget (top-right, below InfoBox)
- `ChatBox` - AI travel assistant (bottom-right)

**Map Component** (`src/components/Map.tsx`):
- Uses Mapbox GL JS with 3D globe projection
- Implements auto-rotating globe that stops on user interaction
- Requires Mapbox token stored in `localStorage` or `VITE_MAPBOX_KEY` environment variable
- Token input screen shown if no token is available
- Uses dark theme (`mapbox://styles/mapbox/dark-v11`) with custom fog effects

**ChatBox Component** (`src/components/ChatBox.tsx`):
- AI travel assistant powered by OpenAI GPT-4o-mini
- API key stored in `localStorage` or `VITE_OPENAI_API_KEY` environment variable
- Shows API key input form if not configured
- Maintains conversation history with role-based messages (user/assistant)
- Expandable/collapsible interface

**InfoBox & WeatherBox Components**:
- Both are collapsible cards with expand/collapse buttons (`+` / `−`)
- Currently use mock data
- InfoBox shows visitor analytics with Recharts line chart
- WeatherBox displays weekly weather forecast with icons

### State Management

- **React Query** (`@tanstack/react-query`) for async state management
- **Local Storage** for persisting:
  - Mapbox API token (`mapbox_token`)
  - OpenAI API key (`openai_api_key`)
- Component-level state with `useState` for UI interactions

### Styling

- **Tailwind CSS** with custom theme configuration
- **shadcn-ui** component library (Radix UI primitives)
- Path alias `@/` points to `src/` directory
- Custom color scheme using CSS variables (HSL format)
- Glass morphism effects: `bg-card/70 backdrop-blur-xl border-glass-border`
- Dark mode support via `next-themes` with class-based toggling

### API Integrations

**Mapbox GL JS**:
- Token required from https://mapbox.com/
- Globe rotation: 360° per 120 seconds
- Stops rotation when zoom > 5 or user interacts

**OpenAI API**:
- Direct API calls to `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4o-mini`
- System prompt: "You are a helpful travel planning assistant..."

**Supabase** (configured but not actively used):
- Client setup in `src/integrations/supabase/client.ts`
- URL: `https://hczdbhxsgztmfmqkcqki.supabase.co`
- Auth storage in localStorage with session persistence

### Component Library (shadcn-ui)

All UI components are in `src/components/ui/`. The project uses a comprehensive set of Radix UI-based components configured via `components.json`. When adding new shadcn components, use the standard shadcn-ui CLI.

### TypeScript Configuration

- Strict mode enabled
- Path alias: `@` → `./src`
- React 18 with SWC compilation for fast refresh

## Important Patterns

1. **API Key Management**: Both Mapbox and OpenAI tokens follow the same pattern:
   - Check environment variable first (e.g., `VITE_MAPBOX_KEY`)
   - Fall back to localStorage
   - Show input form if neither exists
   - Validate format before saving (e.g., OpenAI keys start with `sk-`)

2. **Collapsible Cards**: InfoBox and WeatherBox use a consistent pattern:
   - Toggle button in CardHeader showing `+` or `−`
   - Conditional rendering of CardContent based on `isExpanded` state
   - State must be synced if components need to coordinate

3. **Toast Notifications**: Use `sonner` for toast notifications via the `toast()` function from `@/hooks/use-toast`

4. **Routing**: When adding routes, add them ABOVE the catch-all `*` route in `src/App.tsx`

## Environment Variables

Create a `.env` file for local development:

```
VITE_MAPBOX_KEY=pk.your_token_here
VITE_OPENAI_API_KEY=sk-your_key_here
```

## Deployment

This project is managed via Lovable (https://lovable.dev). Changes can be made through:
- Lovable's web interface
- Direct code edits pushed to Git
- GitHub Codespaces

Deploy via Lovable Project Settings → Share → Publish
