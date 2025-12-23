/**
 * PhilTreeCrawler Type Definitions
 *
 * Shared types for database entities, API requests/responses,
 * component props, session state, and external API responses.
 */

// =============================================
// DATABASE ENTITIES
// =============================================

/** Branch relationship types */
export type BranchType = "constructive" | "critique" | "author" | "wildcard";

/** Familiarity levels for onboarding */
export type FamiliarityLevel = "beginner" | "intermediate" | "advanced";

/** A philosophical concept node in the graph */
export interface Concept {
  id: string;
  name: string;
  slug: string;
  description: string;
  recommended_reading: string[] | null;
  embedding: number[] | null;
  created_at: string | null;
}

/** An edge connecting two concepts */
export interface Edge {
  id: string;
  source_id: string;
  target_id: string;
  branch_type: BranchType;
  description: string | null;
  created_at: string | null;
}

/** Extended edge with target concept data */
export interface EdgeWithTarget extends Edge {
  target: Concept;
}

/** User profile data */
export interface UserProfile {
  id: string;
  onboarding_complete: boolean;
  nodes_explored: number;
  graph_unlocked: boolean;
  created_at: string | null;
}

/** User's familiarity with a philosophical text */
export interface TextFamiliarity {
  id: string;
  user_id: string;
  text_name: string;
  has_read: boolean;
}

/** User's familiarity with a category/subtopic */
export interface CategoryFamiliarity {
  id: string;
  user_id: string;
  category: string;
  subtopic: string;
  familiarity: FamiliarityLevel;
}

/** Branch analytics for a concept */
export interface BranchAnalytics {
  id: string;
  concept_id: string;
  branch_type: BranchType;
  chosen_count: number;
}

/** User generation log entry for rate limiting */
export interface GenerationLog {
  id: string;
  user_id: string;
  generated_at: string;
}

// =============================================
// API REQUEST/RESPONSE TYPES
// =============================================

// Auth
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  } | null;
  session: {
    access_token: string;
    refresh_token: string;
  } | null;
  error?: string;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
  } | null;
  profile: UserProfile | null;
}

// Onboarding
export interface CanonicalText {
  title: string;
  author: string;
  year?: string;
}

export interface CategoryWithSubtopics {
  name: string;
  subtopics: string[];
}

export interface SaveFamiliarityRequest {
  texts: { text_name: string; has_read: boolean }[];
  categories: {
    category: string;
    subtopic: string;
    familiarity: FamiliarityLevel;
  }[];
}

export interface QuizAnswer {
  question: string;
  answer: string;
  level: FamiliarityLevel | "incorrect";
}

export interface QuizQuestionRequest {
  category: string;
  subtopic: string;
  priorAnswers?: QuizAnswer[];
}

export interface QuizQuestionResponse {
  question: string;
  options: { text: string; level: FamiliarityLevel | "incorrect" }[];
  explanation?: string;
}

export interface QuizResultResponse {
  familiarity: FamiliarityLevel;
  reasoning: string;
}

// Concepts
export interface ConceptWithEdges {
  concept: Concept;
  edges: EdgeWithTarget[];
}

export interface SearchConceptsResponse {
  concepts: Concept[];
}

export interface NearestConceptsRequest {
  conceptId: string;
  limit?: number;
}

export interface NearestConceptsResponse {
  concepts: Concept[];
}

export interface GenerateConceptRequest {
  name: string;
}

export interface GenerateConceptResponse {
  concept: Concept;
}

export interface GenerateBranchesResponse {
  edges: EdgeWithTarget[];
}

export interface ChooseBranchRequest {
  branchType: BranchType;
}

export interface BranchStatsResponse {
  stats: { type: BranchType; percentage: number; count: number }[];
}

// Go Deeper
export interface SocraticMessage {
  role: "assistant" | "user";
  content: string;
}

export interface SocraticStartRequest {
  conceptId: string;
}

export interface SocraticStartResponse {
  question: string;
  context: string;
}

export interface SocraticRespondRequest {
  conceptId: string;
  history: SocraticMessage[];
  answer: string;
}

export interface SocraticRespondResponse {
  response: string;
  question: string | null;
  isComplete: boolean;
  summary?: string;
}

export interface ExpandDescriptionRequest {
  conceptId: string;
}

export interface ExpandDescriptionResponse {
  expandedDescription: string;
}

export interface VideoSearchRequest {
  conceptId: string;
  conceptName: string;
}

export interface BookSearchRequest {
  conceptId: string;
  conceptName: string;
}

// User
export interface ExploreNodeRequest {
  conceptId: string;
}

export interface ExploreNodeResponse {
  nodesExplored: number;
  graphUnlocked: boolean;
}

export interface RateLimitResponse {
  allowed: boolean;
  remaining: number;
  resetAt: string | null;
}

// =============================================
// EXTERNAL API TYPES
// =============================================

/** YouTube video result */
export interface Video {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  watchUrl: string;
  embedUrl: string;
}

/** Book result from Exa.ai */
export interface Book {
  title: string;
  author: string;
  url: string;
  description?: string;
  imageUrl?: string;
}

// =============================================
// GEMINI RESPONSE TYPES
// =============================================

export interface LessonGeneration {
  description: string;
  recommended_reading: {
    title: string;
    author: string;
    year: string;
    relevance: string;
  }[];
}

export interface BranchGeneration {
  branches: {
    type: BranchType;
    target_name: string;
    description: string;
  }[];
}

export interface SocraticQuestionGeneration {
  question: string;
  context: string;
}

export interface SocraticResponseGeneration {
  response: string;
  question: string | null;
  is_complete: boolean;
  summary?: string;
}

export interface ExpandedDescriptionGeneration {
  expanded_description: string;
}

export interface QuizQuestionGeneration {
  question: string;
  options: { text: string; level: FamiliarityLevel | "incorrect" }[];
  explanation: string;
}

export interface QuizEvaluationGeneration {
  familiarity: FamiliarityLevel;
  reasoning: string;
}

// =============================================
// SESSION STATE TYPES
// =============================================

/** Cached Go Deeper content for a concept */
export interface DeeperCache {
  socratic?: SocraticMessage[];
  expanded?: string;
  videos?: Video[];
  books?: Book[];
}

/** Client-side session state */
export interface SessionState {
  /** Exploration path (stack of concept slugs) */
  path: string[];
  /** Cached Go Deeper content by concept ID */
  deeperCache: Record<string, DeeperCache>;
  /** Set of visited concept IDs */
  visitedNodes: Set<string>;
}

// =============================================
// GRAPH VISUALIZATION TYPES
// =============================================

/** Node data for Cytoscape.js */
export interface GraphNode {
  id: string;
  label: string;
  slug: string;
  visited: boolean;
}

/** Edge data for Cytoscape.js */
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  branchType: BranchType;
}

/** Combined graph data for visualization */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// =============================================
// COMPONENT PROP TYPES
// =============================================

export interface ConceptPageProps {
  params: { slug: string };
}

export interface BranchCardProps {
  edge: EdgeWithTarget;
  onSelect: (edge: EdgeWithTarget) => void;
  stats?: { percentage: number; count: number };
}

export interface LessonCardProps {
  concept: Concept;
}

export interface SocraticDialogueProps {
  conceptId: string;
  conceptName: string;
  history: SocraticMessage[];
  onSend: (message: string) => void;
  loading: boolean;
}

export interface VideoCardProps {
  video: Video;
}

export interface BookCardProps {
  book: Book;
}

// =============================================
// AUTH COMPONENT TYPES (Track B)
// =============================================

/** Props for AuthGuard component */
export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/** Props for AppShell layout component */
export interface AppShellProps {
  children: React.ReactNode;
}

/** Props for NavBar component */
export interface NavBarProps {
  onLogout?: () => void;
}

/** Auth user type (from Supabase) */
export interface AuthUser {
  id: string;
  email?: string;
  created_at?: string;
}

/** Login credentials */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Signup credentials */
export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword?: string;
}

/** Auth action response (for hook returns) */
export interface AuthActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: AuthUser;
}
