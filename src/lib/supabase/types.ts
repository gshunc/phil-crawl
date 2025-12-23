/**
 * Database types for PhilTreeCrawler
 *
 * This is a placeholder type definition. To generate full types from your Supabase schema:
 *
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Link your project: supabase link --project-ref your-project-ref
 * 4. Generate types: supabase gen types typescript --local > src/lib/supabase/types.ts
 *
 * Or if using the remote database:
 *    supabase gen types typescript --project-id your-project-id --schema public > src/lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      concepts: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          recommended_reading: string[] | null;
          embedding: number[] | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          recommended_reading?: string[] | null;
          embedding?: number[] | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          recommended_reading?: string[] | null;
          embedding?: number[] | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      edges: {
        Row: {
          id: string;
          source_id: string | null;
          target_id: string | null;
          branch_type:
            | "constructive"
            | "critique"
            | "author"
            | "wildcard"
            | null;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          source_id?: string | null;
          target_id?: string | null;
          branch_type?:
            | "constructive"
            | "critique"
            | "author"
            | "wildcard"
            | null;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          source_id?: string | null;
          target_id?: string | null;
          branch_type?:
            | "constructive"
            | "critique"
            | "author"
            | "wildcard"
            | null;
          description?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "edges_source_id_fkey";
            columns: ["source_id"];
            referencedRelation: "concepts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "edges_target_id_fkey";
            columns: ["target_id"];
            referencedRelation: "concepts";
            referencedColumns: ["id"];
          }
        ];
      };
      user_profiles: {
        Row: {
          id: string;
          onboarding_complete: boolean | null;
          nodes_explored: number | null;
          graph_unlocked: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          onboarding_complete?: boolean | null;
          nodes_explored?: number | null;
          graph_unlocked?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          onboarding_complete?: boolean | null;
          nodes_explored?: number | null;
          graph_unlocked?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      user_text_familiarity: {
        Row: {
          id: string;
          user_id: string | null;
          text_name: string;
          has_read: boolean | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          text_name: string;
          has_read?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          text_name?: string;
          has_read?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_text_familiarity_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_category_familiarity: {
        Row: {
          id: string;
          user_id: string | null;
          category: string;
          subtopic: string;
          familiarity: "beginner" | "intermediate" | "advanced" | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          category: string;
          subtopic: string;
          familiarity?: "beginner" | "intermediate" | "advanced" | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          category?: string;
          subtopic?: string;
          familiarity?: "beginner" | "intermediate" | "advanced" | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_category_familiarity_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      branch_analytics: {
        Row: {
          id: string;
          concept_id: string | null;
          branch_type:
            | "constructive"
            | "critique"
            | "author"
            | "wildcard"
            | null;
          chosen_count: number | null;
        };
        Insert: {
          id?: string;
          concept_id?: string | null;
          branch_type?:
            | "constructive"
            | "critique"
            | "author"
            | "wildcard"
            | null;
          chosen_count?: number | null;
        };
        Update: {
          id?: string;
          concept_id?: string | null;
          branch_type?:
            | "constructive"
            | "critique"
            | "author"
            | "wildcard"
            | null;
          chosen_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "branch_analytics_concept_id_fkey";
            columns: ["concept_id"];
            referencedRelation: "concepts";
            referencedColumns: ["id"];
          }
        ];
      };
      user_generation_log: {
        Row: {
          id: string;
          user_id: string | null;
          generated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          generated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          generated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_generation_log_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_concepts: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: string;
          name: string;
          slug: string;
          description: string;
          recommended_reading: string[] | null;
          embedding: number[] | null;
          created_at: string | null;
          similarity: number;
        }[];
      };
      increment_branch_stat: {
        Args: {
          p_concept_id: string;
          p_branch_type: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for table operations
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
