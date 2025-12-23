# PhilTreeCrawler - Folder Structure Checkpoint

**Date**: 2025-12-22
**Status**: Complete

## Overview

The complete folder structure for PhilTreeCrawler has been set up according to TECH_SPEC.md. All directories contain placeholder `index.ts` files with descriptive comments explaining their purpose.

## Complete Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                   # Auth route group (login, signup)
│   ├── (main)/                   # Main app routes (onboarding, explore, graph)
│   └── api/                      # API routes
│       ├── auth/                 # Authentication endpoints
│       ├── onboarding/           # User familiarity assessment
│       ├── concepts/             # Concept CRUD and generation
│       ├── deeper/               # Go Deeper features (Socratic, videos, books)
│       └── user/                 # User profile and progress
│
├── components/                    # React components
│   ├── layout/                   # AppShell, NavBar, BackButton, PathBreadcrumbs
│   ├── auth/                     # LoginForm, SignupForm, AuthGuard
│   ├── onboarding/               # TextFamiliarityList, CategoryAccordion, QuizQuestion
│   ├── explore/                  # LessonCard, BranchOptions, BranchCard
│   ├── deeper/                   # SocraticDialogue, VideoResults, BookResults
│   └── graph/                    # GraphCanvas, GraphNode, GraphControls
│
├── hooks/                         # Custom React hooks
│   └── index.ts                  # useAuth, useConcept, useGenerateBranches, etc.
│
├── lib/                           # Utility libraries
│   ├── supabase/                 # Database client and queries
│   ├── gemini/                   # Gemini Flash LLM integration
│   ├── openai/                   # OpenAI embeddings
│   ├── youtube/                  # YouTube Data API v3
│   └── exa/                      # Exa.ai book search
│
├── types/                         # TypeScript type definitions
│   └── index.ts                  # Shared types for DB, API, components
│
└── store/                         # Client-side state management
    └── index.ts                  # Session state (exploration path, cache)
```

## Files Created

Total: 21 placeholder `index.ts` files with descriptive comments

### App Routes (7 files)
- `/Users/georgeharris/Development/PhilTreeCrawler/src/app/(auth)/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/app/(main)/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/app/api/auth/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/app/api/onboarding/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/app/api/concepts/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/app/api/deeper/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/app/api/user/index.ts`

### Components (6 files)
- `/Users/georgeharris/Development/PhilTreeCrawler/src/components/layout/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/components/auth/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/components/onboarding/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/components/explore/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/components/deeper/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/components/graph/index.ts`

### Utilities & State (8 files)
- `/Users/georgeharris/Development/PhilTreeCrawler/src/hooks/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/lib/supabase/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/lib/gemini/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/lib/openai/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/lib/youtube/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/lib/exa/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/types/index.ts`
- `/Users/georgeharris/Development/PhilTreeCrawler/src/store/index.ts`

## Key Features by Directory

### App Routes
- **Authentication**: Signup, login, logout, user profile
- **Onboarding**: Text familiarity, category assessment, quiz flow, recommendations
- **Concepts**: CRUD operations, search, generation, branch management, analytics
- **Go Deeper**: Socratic dialogue, expanded descriptions, video/book discovery
- **User**: Profile management, exploration tracking, rate limiting

### Components
- **Layout**: Consistent navigation and app shell
- **Auth**: Forms and route protection
- **Onboarding**: Multi-step familiarity assessment UI
- **Explore**: Main concept crawl interface with branching
- **Deeper**: Deep-dive exploration tools
- **Graph**: 2D visualization with Cytoscape.js (unlockable)

### Libraries
- **Supabase**: Postgres database and authentication
- **Gemini Flash**: LLM for lessons, dialogue, quizzes
- **OpenAI**: Text embeddings for semantic search
- **YouTube**: Video discovery via Data API v3
- **Exa.ai**: Book and article recommendations

## Next Steps

1. **Environment Setup**: Configure `.env.local` with API keys
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY`
   - `YOUTUBE_API_KEY`
   - `EXA_API_KEY`

2. **Database Setup**: Run Supabase migrations for schema
   - Create tables (concepts, edges, user_profiles, etc.)
   - Enable pgvector extension
   - Set up RLS policies

3. **Core Implementation**: Begin with foundational layers
   - Supabase client setup (`src/lib/supabase/`)
   - Type definitions (`src/types/`)
   - Authentication flow (`src/app/api/auth/`, `src/components/auth/`)

4. **Feature Development**: Build user-facing features
   - Onboarding flow
   - Concept exploration and generation
   - Go Deeper features
   - Graph visualization

## Notes

- All directories use Next.js App Router conventions
- Route groups `(auth)` and `(main)` organize pages without affecting URLs
- Placeholder files preserve structure and document purpose
- Ready for implementation following TECH_SPEC.md requirements
