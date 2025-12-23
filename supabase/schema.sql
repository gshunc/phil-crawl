-- PhilTreeCrawler Database Schema
-- Supabase PostgreSQL with pgvector extension

-- =============================================
-- EXTENSIONS
-- =============================================

-- Enable pgvector for embedding similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================
-- TABLES
-- =============================================

-- Core concept storage
CREATE TABLE concepts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT UNIQUE NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT NOT NULL,
  recommended_reading TEXT[],
  embedding       VECTOR(1536),          -- OpenAI text-embedding-3-small
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Edges between concepts (adjacency list)
CREATE TABLE edges (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id       UUID REFERENCES concepts(id) ON DELETE CASCADE,
  target_id       UUID REFERENCES concepts(id) ON DELETE CASCADE,
  branch_type     TEXT CHECK (branch_type IN ('constructive', 'critique', 'author', 'wildcard')),
  description     TEXT,                   -- How target relates to source
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_id, target_id)
);

-- User accounts (managed by Supabase Auth, extended here)
CREATE TABLE user_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  nodes_explored  INTEGER DEFAULT 0,
  graph_unlocked  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Onboarding: text familiarity
CREATE TABLE user_text_familiarity (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  text_name       TEXT NOT NULL,
  has_read        BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, text_name)
);

-- Onboarding: category familiarity
CREATE TABLE user_category_familiarity (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  category        TEXT NOT NULL,
  subtopic        TEXT NOT NULL,
  familiarity     TEXT CHECK (familiarity IN ('beginner', 'intermediate', 'advanced')),
  UNIQUE(user_id, category, subtopic)
);

-- Analytics: branch choice tracking
CREATE TABLE branch_analytics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_id      UUID REFERENCES concepts(id) ON DELETE CASCADE,
  branch_type     TEXT CHECK (branch_type IN ('constructive', 'critique', 'author', 'wildcard')),
  chosen_count    INTEGER DEFAULT 0,
  UNIQUE(concept_id, branch_type)
);

-- Rate limiting
CREATE TABLE user_generation_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  generated_at    TIMESTAMP DEFAULT NOW()
);


-- =============================================
-- INDEXES
-- =============================================

-- Index for vector similarity search on embeddings
-- Using ivfflat index for approximate nearest neighbor search
CREATE INDEX idx_concepts_embedding ON concepts
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for concept lookups
CREATE INDEX idx_concepts_slug ON concepts(slug);
CREATE INDEX idx_concepts_name ON concepts(name);

-- Indexes for edge queries
CREATE INDEX idx_edges_source_id ON edges(source_id);
CREATE INDEX idx_edges_target_id ON edges(target_id);
CREATE INDEX idx_edges_branch_type ON edges(branch_type);

-- Indexes for user data
CREATE INDEX idx_user_text_familiarity_user_id ON user_text_familiarity(user_id);
CREATE INDEX idx_user_category_familiarity_user_id ON user_category_familiarity(user_id);

-- Index for analytics queries
CREATE INDEX idx_branch_analytics_concept_id ON branch_analytics(concept_id);

-- Index for rate limiting queries (find recent generations)
CREATE INDEX idx_user_generation_log_user_id_time ON user_generation_log(user_id, generated_at DESC);


-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_text_familiarity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_category_familiarity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_generation_log ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (triggered on signup)
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- user_text_familiarity policies
-- Users can read their own text familiarity data
CREATE POLICY "Users can view own text familiarity"
  ON user_text_familiarity
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own text familiarity data
CREATE POLICY "Users can insert own text familiarity"
  ON user_text_familiarity
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own text familiarity data
CREATE POLICY "Users can update own text familiarity"
  ON user_text_familiarity
  FOR UPDATE
  USING (auth.uid() = user_id);

-- user_category_familiarity policies
-- Users can read their own category familiarity data
CREATE POLICY "Users can view own category familiarity"
  ON user_category_familiarity
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own category familiarity data
CREATE POLICY "Users can insert own category familiarity"
  ON user_category_familiarity
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own category familiarity data
CREATE POLICY "Users can update own category familiarity"
  ON user_category_familiarity
  FOR UPDATE
  USING (auth.uid() = user_id);

-- user_generation_log policies
-- Users can read their own generation log
CREATE POLICY "Users can view own generation log"
  ON user_generation_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert to their own generation log
CREATE POLICY "Users can insert own generation log"
  ON user_generation_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public read access for concepts and edges (no RLS needed - all users can read)
-- But we don't enable RLS on these tables, allowing full public read access

-- Analytics table doesn't need RLS (public read, controlled write via backend)
-- Only backend service role can write to branch_analytics


-- =============================================
-- FUNCTIONS
-- =============================================

-- Trigger function to create user_profile on new auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Vector similarity search function for finding nearest concepts
-- Uses cosine distance with pgvector's <=> operator
CREATE OR REPLACE FUNCTION public.match_concepts(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  recommended_reading TEXT[],
  embedding VECTOR(1536),
  created_at TIMESTAMP,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.slug,
    c.description,
    c.recommended_reading,
    c.embedding,
    c.created_at,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM concepts c
  WHERE c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


-- Increment branch analytics counter (upsert pattern)
CREATE OR REPLACE FUNCTION public.increment_branch_stat(
  p_concept_id UUID,
  p_branch_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO branch_analytics (concept_id, branch_type, chosen_count)
  VALUES (p_concept_id, p_branch_type, 1)
  ON CONFLICT (concept_id, branch_type)
  DO UPDATE SET chosen_count = branch_analytics.chosen_count + 1;
END;
$$;


-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE concepts IS 'Core philosophical concepts with embeddings for similarity search';
COMMENT ON TABLE edges IS 'Directed edges between concepts representing different types of relationships';
COMMENT ON TABLE user_profiles IS 'Extended user profile data beyond Supabase Auth';
COMMENT ON TABLE user_text_familiarity IS 'Tracks which canonical texts users have read during onboarding';
COMMENT ON TABLE user_category_familiarity IS 'Stores user familiarity levels for philosophical categories';
COMMENT ON TABLE branch_analytics IS 'Aggregated statistics on which branch types users choose';
COMMENT ON TABLE user_generation_log IS 'Tracks when users generate new nodes for rate limiting';

COMMENT ON COLUMN concepts.embedding IS 'Vector embedding from OpenAI text-embedding-3-small (1536 dimensions)';
COMMENT ON COLUMN edges.branch_type IS 'Type of relationship: constructive (builds on), critique (challenges), author (same thinker), wildcard (unexpected connection)';
COMMENT ON COLUMN user_profiles.nodes_explored IS 'Count of unique concepts user has visited';
COMMENT ON COLUMN user_profiles.graph_unlocked IS 'Whether user has explored enough nodes to access graph view';
