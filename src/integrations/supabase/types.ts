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
      achievements: {
        Row: {
          code: string
          description: string
          id: string
          name: string
          requirement: string
        }
        Insert: {
          code: string
          description: string
          id?: string
          name: string
          requirement: string
        }
        Update: {
          code?: string
          description?: string
          id?: string
          name?: string
          requirement?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          description: string
          id: string
          level: string
          min_level: number
          position: number
          symbol: string
          title: string
        }
        Insert: {
          description: string
          id?: string
          level: string
          min_level?: number
          position?: number
          symbol?: string
          title: string
        }
        Update: {
          description?: string
          id?: string
          level?: string
          min_level?: number
          position?: number
          symbol?: string
          title?: string
        }
        Relationships: []
      }
      exercise_attempts: {
        Row: {
          answer: string | null
          assistance_level: number
          attempt_number: number
          correct: boolean
          created_at: string
          exercise_id: string
          id: string
          mode: string
          reasoning: string | null
          user_id: string
        }
        Insert: {
          answer?: string | null
          assistance_level?: number
          attempt_number?: number
          correct?: boolean
          created_at?: string
          exercise_id: string
          id?: string
          mode?: string
          reasoning?: string | null
          user_id: string
        }
        Update: {
          answer?: string | null
          assistance_level?: number
          attempt_number?: number
          correct?: boolean
          created_at?: string
          exercise_id?: string
          id?: string
          mode?: string
          reasoning?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_attempts_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          answer: string
          ask_reasoning: boolean
          concept: string
          created_at: string
          diagnostic: string | null
          difficulty: string
          equation: string | null
          hints: string[]
          id: string
          independent: boolean
          lesson_id: string
          position: number
          problem: string
          title: string
          transfer_answer: string | null
          transfer_problem: string | null
          xp: number
        }
        Insert: {
          answer: string
          ask_reasoning?: boolean
          concept: string
          created_at?: string
          diagnostic?: string | null
          difficulty?: string
          equation?: string | null
          hints?: string[]
          id?: string
          independent?: boolean
          lesson_id: string
          position?: number
          problem: string
          title: string
          transfer_answer?: string | null
          transfer_problem?: string | null
          xp?: number
        }
        Update: {
          answer?: string
          ask_reasoning?: boolean
          concept?: string
          created_at?: string
          diagnostic?: string | null
          difficulty?: string
          equation?: string | null
          hints?: string[]
          id?: string
          independent?: boolean
          lesson_id?: string
          position?: number
          problem?: string
          title?: string
          transfer_answer?: string | null
          transfer_problem?: string | null
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          concept: string
          course_id: string
          description: string
          id: string
          position: number
          title: string
        }
        Insert: {
          concept: string
          course_id: string
          description: string
          id?: string
          position?: number
          title: string
        }
        Update: {
          concept?: string
          course_id?: string
          description?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          last_active_date: string | null
          level: number
          name: string
          streak: number
          xp: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          last_active_date?: string | null
          level?: number
          name?: string
          streak?: number
          xp?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          last_active_date?: string | null
          level?: number
          name?: string
          streak?: number
          xp?: number
        }
        Relationships: []
      }
      progress: {
        Row: {
          completion: number
          id: string
          independent_passed: boolean
          lesson_id: string
          mastery: number
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          completion?: number
          id?: string
          independent_passed?: boolean
          lesson_id: string
          mastery?: number
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          completion?: number
          id?: string
          independent_passed?: boolean
          lesson_id?: string
          mastery?: number
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_metrics: { Args: never; Returns: Json }
      grant_achievement: {
        Args: { _code: string; _user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lesson_exercises: {
        Args: { p_lesson_id: string }
        Returns: {
          ask_reasoning: boolean
          concept: string
          difficulty: string
          equation: string
          hints: string[]
          id: string
          independent: boolean
          lesson_id: string
          order_index: number
          problem: string
          title: string
          transfer_problem: string
          xp: number
        }[]
      }
      level_for_xp: { Args: { _xp: number }; Returns: number }
      norm_answer: { Args: { _a: string }; Returns: string }
      retrieval_exercise: {
        Args: never
        Returns: {
          concept: string
          id: string
          lesson_id: string
          problem: string
          title: string
        }[]
      }
      submit_attempt: {
        Args: {
          p_answer: string
          p_assistance?: number
          p_exercise_id: string
          p_mode?: string
          p_reasoning?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "user" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["user", "admin"],
    },
  },
} as const
