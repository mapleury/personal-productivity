# wanei. — personal productivity OS

wanei. is a local-first productivity dashboard for planning the day, tracking deep work, and staying oriented without a noisy app ecosystem. It combines a focus timer, task board, calendar, weekly planning, local music playback, and a lightweight AI assistant into a single calm workspace.

This project is built with Next.js App Router, React 19, TypeScript, Zustand, and Tailwind CSS. The app is designed to run fully in-browser with optional server-side enhancements for AI and speech features.

## What this app does

- Keeps your daily work visible in one place
- Helps you manage tasks, priorities, and workload
- Tracks deep-focus sessions and productivity rhythms
- Gives you a simple weekly planning flow
- Lets you play local music without uploading files anywhere
- Uses a local or API-backed assistant to answer questions about your plan

## Core features

### Focus and work tracking
- Pomodoro-style focus timer with short and long breaks
- Resume, pause, reset, and skip controls
- Per-session logging into productivity stats
- Browser title countdown while the tab is active
- Session data stored locally so state survives reloads

### Tasks and prioritization
- Task creation with title, description, due date, priority, status, tags, and notes
- Priority categories from low to critical
- Drag-and-drop task board and queue view
- "Today focus" and Eisenhower-style prioritization flow

### Planning and calendar
- Weekly goals and plan layout
- Calendar pages with day, week, and month views
- Daily timeline with task and event categories
- Right-side overview panels for quick context

### Productivity insight
- Heatmap-style activity views
- Daily, weekly, monthly, and yearly trends
- Focus-time and completion analytics
- Goal progress and planned-vs-completed summaries

### Music and ambient work flow
- Upload local audio files in common formats
- Persistent music bar across navigation
- Playback controls including shuffle, repeat, queue, seek, and volume
- Audio stored in IndexedDB on the device; nothing is uploaded by default

### AI assistant
- Local fallback assistant that answers using your actual task and schedule context
- Optional Gemini integration for smarter responses
- Optional ElevenLabs voice output with browser fallback when keys are not configured
- Speech recognition via the browser when supported

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Zustand for state management
- IndexedDB for local audio stores
- localStorage for persisted app data

## Requirements

- Node.js 20 or newer
- npm 10+

## Getting started

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

The app seeds demo content on first run so the dashboard is populated immediately.

## Optional AI configuration

The app works without any environment variables. If you want Gemini or ElevenLabs support, create a `.env.local` file in the project root.

Example:

```bash
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_MODEL=eleven_multilingual_v2
```

### Behavior when keys are missing
- `GEMINI_API_KEY` absent: assistant falls back to a local rule-based response engine
- `ELEVENLABS_API_KEY` absent: TTS falls back to the browser speech API
- Client code never receives the API keys directly; they are read server-side in the API route handlers

## Data and persistence

The app is intentionally local-first.

- Tasks, goals, calendar entries, productivity data, and settings are stored in browser localStorage
- Music files are stored in IndexedDB under the app’s local database
- The settings page includes exporting or resetting local data

This means the app is best used as a personal device-local workspace rather than a multi-user service.

## Project structure

```text
src/
  app/
    api/
      assistant/
      config/
      tts/
    analytics/
    assistant/
    calendar/
    focus/
    goals/
    music/
    priorities/
    productivity/
    profile/
    sessions/
    settings/
    tasks/
    today/
    weekly-plan/
  components/
    features/
    shell/
    ui/
  lib/
    store/
    briefing.ts
    context.ts
    score.ts
    seed.ts
    time.ts
    types.ts
    useNow.ts
```

## Available scripts

```bash
npm run dev     # start the dev server
npm run build   # create a production build
npm run start   # run the production build
npm run lint    # run ESLint checks
```

## Notes for contributors

- UI state is split by domain: tasks, calendar, productivity, music, timer, assistant, and settings
- Keep the app local-first; avoid introducing server-side storage unless necessary
- Prefer lightweight, reusable UI primitives from the components directory
- The assistant should always reason from the user’s actual local context and avoid inventing data

## License

This project is private and intended for local personal use unless otherwise specified by the repository owner.
