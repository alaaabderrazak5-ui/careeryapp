export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string
          cover_letter: string | null
          cv_url: string | null
          id: string
          job_id: string
          match_score: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          cover_letter?: string | null
          cv_url?: string | null
          id?: string
          job_id: string
          match_score?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          cover_letter?: string | null
          cv_url?: string | null
          id?: string
          job_id?: string
          match_score?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      career_goals: {
        Row: {
          created_at: string
          goal: string
          id: string
          target_role: string | null
          timeline: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          goal: string
          id?: string
          target_role?: string | null
          timeline?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          goal?: string
          id?: string
          target_role?: string | null
          timeline?: string | null
          user_id?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          credential_url: string | null
          expires_at: string | null
          id: string
          issued_at: string | null
          issuer: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credential_url?: string | null
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          issuer?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          credential_url?: string | null
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          issuer?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      cms_blocks: {
        Row: {
          block_type: string
          content: Json
          id: string
          is_visible: boolean
          page_id: string
          position: number
          updated_at: string
        }
        Insert: {
          block_type: string
          content?: Json
          id?: string
          is_visible?: boolean
          page_id: string
          position?: number
          updated_at?: string
        }
        Update: {
          block_type?: string
          content?: Json
          id?: string
          is_visible?: boolean
          page_id?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_blocks_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_navigation: {
        Row: {
          id: string
          is_visible: boolean
          label: string
          location: string
          position: number
          url: string
        }
        Insert: {
          id?: string
          is_visible?: boolean
          label: string
          location: string
          position?: number
          url: string
        }
        Update: {
          id?: string
          is_visible?: boolean
          label?: string
          location?: string
          position?: number
          url?: string
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          id: string
          is_published: boolean
          meta_description: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          id?: string
          is_published?: boolean
          meta_description?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_published?: boolean
          meta_description?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string
          owner_id: string
          size: string | null
          slug: string
          updated_at: string
          verified: boolean
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          size?: string | null
          slug: string
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          size?: string | null
          slug?: string
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          id: string
          member_role: string
          user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          member_role: string
          user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          member_role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      education: {
        Row: {
          created_at: string
          degree: string | null
          description: string | null
          end_date: string | null
          field: string | null
          id: string
          institution: string
          is_current: boolean | null
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          degree?: string | null
          description?: string | null
          end_date?: string | null
          field?: string | null
          id?: string
          institution: string
          is_current?: boolean | null
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          degree?: string | null
          description?: string | null
          end_date?: string | null
          field?: string | null
          id?: string
          institution?: string
          is_current?: boolean | null
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          company: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          location: string | null
          start_date: string | null
          title: string
          updated_at: string
          user_id: string
          work_mode: string | null
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          start_date?: string | null
          title: string
          updated_at?: string
          user_id: string
          work_mode?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          work_mode?: string | null
        }
        Relationships: []
      }
      job_skills: {
        Row: {
          id: string
          is_required: boolean
          job_id: string
          min_level: number | null
          skill_id: string
          weight: number
        }
        Insert: {
          id?: string
          is_required?: boolean
          job_id: string
          min_level?: number | null
          skill_id: string
          weight?: number
        }
        Update: {
          id?: string
          is_required?: boolean
          job_id?: string
          min_level?: number | null
          skill_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      job_tags: {
        Row: {
          id: string
          job_id: string
          tag: string
        }
        Insert: {
          id?: string
          job_id: string
          tag: string
        }
        Update: {
          id?: string
          job_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_tags_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          description: string
          education_level: string | null
          experience_level: string | null
          expires_at: string | null
          id: string
          location: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          status: string
          title: string
          updated_at: string
          work_mode: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          description: string
          education_level?: string | null
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          location?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          title: string
          updated_at?: string
          work_mode?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string
          education_level?: string | null
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          location?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          title?: string
          updated_at?: string
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      match_scores: {
        Row: {
          breakdown: Json | null
          computed_at: string
          id: string
          job_id: string
          score: number
          user_id: string
        }
        Insert: {
          breakdown?: Json | null
          computed_at?: string
          id?: string
          job_id: string
          score: number
          user_id: string
        }
        Update: {
          breakdown?: Json | null
          computed_at?: string
          id?: string
          job_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_scores_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_links: {
        Row: {
          id: string
          label: string
          link_type: string | null
          url: string
          user_id: string
        }
        Insert: {
          id?: string
          label: string
          link_type?: string | null
          url: string
          user_id: string
        }
        Update: {
          id?: string
          label?: string
          link_type?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          completion_pct: number
          created_at: string
          cv_url: string | null
          full_name: string | null
          headline: string | null
          id: string
          location: string | null
          onboarded: boolean
          remote_preference: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          completion_pct?: number
          created_at?: string
          cv_url?: string | null
          full_name?: string | null
          headline?: string | null
          id: string
          location?: string | null
          onboarded?: boolean
          remote_preference?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          completion_pct?: number
          created_at?: string
          cv_url?: string | null
          full_name?: string | null
          headline?: string | null
          id?: string
          location?: string | null
          onboarded?: boolean
          remote_preference?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          label: string
          name: Database["public"]["Enums"]["app_role"]
          permissions: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          label: string
          name: Database["public"]["Enums"]["app_role"]
          permissions?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          name?: Database["public"]["Enums"]["app_role"]
          permissions?: Json
        }
        Relationships: []
      }
      saved_candidates: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          notes: string | null
          saved_by: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          notes?: string | null
          saved_by: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          saved_by?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_categories: {
        Row: {
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_approved: boolean
          is_custom: boolean
          name: string
          slug: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_approved?: boolean
          is_custom?: boolean
          name: string
          slug: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_approved?: boolean
          is_custom?: boolean
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "skill_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      study_paths: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          program: string
          school: string | null
          status: string | null
          target_career: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          program: string
          school?: string | null
          status?: string | null
          target_career?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          program?: string
          school?: string | null
          status?: string | null
          target_career?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          id: string
          interest: string
          user_id: string
        }
        Insert: {
          id?: string
          interest: string
          user_id: string
        }
        Update: {
          id?: string
          interest?: string
          user_id?: string
        }
        Relationships: []
      }
      user_languages: {
        Row: {
          id: string
          language: string
          proficiency: string | null
          user_id: string
        }
        Insert: {
          id?: string
          language: string
          proficiency?: string | null
          user_id: string
        }
        Update: {
          id?: string
          language?: string
          proficiency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          id: string
          level: number
          skill_id: string
          user_id: string
          years: number | null
        }
        Insert: {
          id?: string
          level?: number
          skill_id: string
          user_id: string
          years?: number | null
        }
        Update: {
          id?: string
          level?: number
          skill_id?: string
          user_id?: string
          years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company: string; _uid: string }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "student" | "job_seeker" | "employer" | "admin" | "recruiter"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "job_seeker", "employer", "admin", "recruiter"],
    },
  },
} as const
