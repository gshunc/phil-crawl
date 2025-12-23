# PhilTreeCrawler: Vision and Concept

## Overview

PhilTreeCrawler is a "living" map of human thought—a dynamic, procedurally-generated journey through philosophy. Users traverse an ever-expanding graph of philosophical concepts, where each node provides a lesson and branches into related ideas. The graph grows through collective exploration: every user contributes to a shared knowledge base.

**Platform**: Desktop-first web application.

## Scope

The philosophical scope is intentionally broad and grows procedurally:

- **Western & Eastern traditions** (Plato to Zen Buddhism)
- **Historical figures** (Socrates, Kant, Confucius)
- **Abstract concepts** (Justice, Being, Consciousness)
- **Schools of thought** (Stoicism, Existentialism, Pragmatism)

---

## User Journey

### 1. Authentication

- **Method**: Email/password authentication.

### 2. Onboarding & Familiarity Assessment

On initial login, users complete a familiarity assessment to build their profile:

#### Step A: Text Familiarity

- Users are presented with a canonical list of common philosophical texts (sourced from an established online list).
- **Rating**: Binary—**Read** or **Not Read**.
- Examples: _Republic_, _Meditations_, _Critique of Pure Reason_, _Being and Time_, _Tao Te Ching_.

#### Step B: Category Exploration

- Users browse top-level philosophical categories (Ethics, Metaphysics, Epistemology, Aesthetics, Political Philosophy, Logic, etc.).
- Each category expands to reveal **4-5 common subtopics**.
- **Rating**: Three-tier scale—**Beginner**, **Intermediate**, **Advanced**.
- **"Help Me Decide" Option**: A fourth option triggers a short quiz that asks targeted questions until the system can assign a familiarity level.

#### Result: Familiarity Profile

This data compiles into a familiarity profile used to recommend personalized starting points.

### 3. Entering the Crawl

After onboarding, users can:

1. **Choose a recommended starting point** (based on familiarity profile)
2. **Search existing concepts** in the graph
3. **Enter a new concept** to learn about (triggers generation if not yet in graph)

---

## Core Mechanics

### 1. Node Interaction (Lessons)

When a user arrives at a concept, they see a **Lesson** containing:

- **Description**: A clear explanation of the concept, written to include **multiple scholarly perspectives** where debate exists. This ensures balanced, nuanced content.
- **Recommended Reading**: Suggested philosophical texts relevant to the concept.

**Important**: Lessons are **globally shared**. The same description is served to all users regardless of their journey path. This prevents storage explosion and ensures consistency.

At the bottom of the lesson, the user chooses:

- **Go Deeper**: Expand understanding of the current concept (see below).
- **Explore New Branch**: Move to a related concept (see Branching).

### 2. Go Deeper Options

When a user clicks "Go Deeper," they're presented with:

| Option                 | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| **Socratic Dialogue**  | An interactive Q&A exploration of the concept               |
| **Find Videos**        | Video content discovered via **Exa.ai API**                 |
| **Expand Description** | A more detailed, extended treatment of the concept          |
| **Find Books**         | Book recommendations with shopping links via **Exa.ai API** |

#### Session-Based Storage

- "Go Deeper" content is **ephemeral and stored client-side only**.
- Session = **browser tab lifetime**.
- If user revisits a concept within the same session, cached Go Deeper content is re-served.
- Content is **not** persisted to the database (avoids storage bloat).
- _Future consideration_: Improved session persistence mechanisms.

### 3. Branching and Traversal

When a user clicks "Explore New Branch," the system first attempts **embedding-based acceleration**:

#### Embedding-Based Nearest Neighbors

- Run a similarity check against existing graph nodes using vector embeddings.
- Present the **three nearest existing neighbors** with a prompt:
  > "Pick from these three concepts for a faster experience, or explore a brand new branch (which will take time to generate)."

#### New Branch Generation

If the user chooses "new branch," the LLM generates **four branch options**:

| Branch Type      | Description                                           |
| ---------------- | ----------------------------------------------------- |
| **Constructive** | A concept that builds upon or extends the current one |
| **Critique**     | A concept or thinker that challenges or opposes it    |
| **Author**       | A philosopher closely associated with the concept     |
| **Wildcard**     | An esoteric or unexpected conceptual connection       |

All edge types are treated equally in the graph structure (no typed relationships).

### 4. Rate Limiting

To prevent spam and manage LLM costs:

- **Generation Timeout**: 1-minute enforced wait when generating new concepts. This encourages users to engage with lessons rather than rapidly clicking through.
- **Hourly Limit**: Maximum of **10 new node generations per user per hour**.

### 5. Graph Evolution

The graph grows procedurally through user interaction:

- **Discovery**: New nodes and edges are created when users explore new branches.
- **Global Persistence**: All lessons and branch connections are stored globally—the same content is served to all users.
- **Analytics**: Track which branch types users choose (constructive, critique, author, wildcard).

---

## Navigation & Session Management

### Backtracking

- Users can navigate backward through their exploration path.
- Full path history is preserved for the session.
- Cached "Go Deeper" content is re-served if the user revisits a node.

### Graph View (Unlockable)

After exploring **10+ nodes**, users unlock a **2D graph visualization**:

- Displays all concepts the user has explored and their connections.
- Click any node to jump back to it.
- From the graph view, immediately access:
  - **Go Deeper** for any visited node
  - **Explore New Branch** from any visited node

> **Future Enhancement**: 3D visualization or embedding-space navigation (earmarked for later development).

---

## Analytics (Nice-to-Have)

- Display aggregate user behavior on branch choices, e.g.:
  > "64% of users clicked the Constructive option here"
- Purpose: Social proof, interesting UX, potential for future personalization or research insights.

---

## External Integrations

### YouTube Data API v3

Used for discovering video content:

- **Video Search**: Find philosophy lectures, explainers, and educational content.
- **Authentication**: API key (no OAuth required for public search).
- **Quota**: 100 searches/day on free tier.

### Exa.ai API

Used for discovering book content:

- **Book Search**: Find book recommendations with shopping/purchase links.
- **Authentication**: API key.

### Embedding Model

- **Choice**: OpenAI text-embedding-3-small
- Used for nearest-neighbor similarity search when suggesting existing concepts.

---

## Technical Stack

### Frontend

- **Framework**: Next.js (React)
- **Graph Visualization**: Cytoscape.js
- **Styling**: TBD (Tailwind, CSS Modules, etc.)

### Backend

- **API**: Next.js API Routes (extract to FastAPI if needed later)
- **Database**: Supabase (Postgres + pgvector)
- **Authentication**: Supabase Auth (email/password)

### AI Services

- **LLM**: Gemini Flash (lesson generation, branch generation, Socratic dialogue, expanded descriptions)
- **Embeddings**: OpenAI text-embedding-3-small (nearest-neighbor similarity search)

### External APIs

- **Exa.ai**: Video and book discovery with shopping links

### Infrastructure

- **Hosting**: Vercel (frontend + API routes)
- **Database**: Supabase (managed Postgres with pgvector + built-in auth)

---

## Architecture Rationale

### Why Postgres over Graph DB?

Our access patterns are simple:

- Fetch a single concept by ID/name
- Fetch edges (branches) from a concept
- Find N nearest neighbors by embedding similarity
- Store user data and analytics

We don't need complex multi-hop traversals—users move one hop at a time. Postgres with an adjacency list (concepts + edges tables) handles this efficiently. pgvector provides native embedding search, keeping everything in one database.

### Why Supabase?

- Managed Postgres with pgvector built-in
- Authentication out of the box (email/password)
- Row-level security for user data
- Real-time subscriptions if needed later
- Generous free tier for development

### Why Gemini Flash?

- Cost-effective for high-volume generation
- Fast response times
- Good quality for educational content

### Why OpenAI Embeddings?

- text-embedding-3-small is extremely cheap ($0.02/1M tokens)
- Well-documented, reliable
- Good quality for semantic similarity
