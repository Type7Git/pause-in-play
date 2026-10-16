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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_invites: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      badges_earned: {
        Row: {
          badge_key: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_key: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Update: {
          badge_key?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      colouring_saves: {
        Row: {
          image_url: string | null
          layer_colours: Json
          scene_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          image_url?: string | null
          layer_colours?: Json
          scene_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          image_url?: string | null
          layer_colours?: Json
          scene_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "colouring_saves_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "colouring_scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      colouring_scenes: {
        Row: {
          id: string
          is_plus: boolean
          key: string
          layer_order: Json
          name: string
          published: boolean
          sort: number
          svg: string
        }
        Insert: {
          id?: string
          is_plus?: boolean
          key: string
          layer_order?: Json
          name: string
          published?: boolean
          sort?: number
          svg: string
        }
        Update: {
          id?: string
          is_plus?: boolean
          key?: string
          layer_order?: Json
          name?: string
          published?: boolean
          sort?: number
          svg?: string
        }
        Relationships: []
      }
      cron_tokens: {
        Row: {
          name: string
          token: string
        }
        Insert: {
          name: string
          token?: string
        }
        Update: {
          name?: string
          token?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          also_called: string[]
          approved_at: string | null
          approved_by: string | null
          default_schedule: Json
          form: string
          id: string
          name: string
          status: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          also_called?: string[]
          approved_at?: string | null
          approved_by?: string | null
          default_schedule?: Json
          form?: string
          id: string
          name: string
          status?: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          also_called?: string[]
          approved_at?: string | null
          approved_by?: string | null
          default_schedule?: Json
          form?: string
          id?: string
          name?: string
          status?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      medicine_suggestions: {
        Row: {
          created_at: string
          for_what: string | null
          form: string | null
          id: string
          name: string
          status: string
        }
        Insert: {
          created_at?: string
          for_what?: string | null
          form?: string | null
          id?: string
          name: string
          status?: string
        }
        Update: {
          created_at?: string
          for_what?: string | null
          form?: string | null
          id?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      food_tips: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          focus: string
          id: string
          review_area: string
          sort: number
          status: string
          text: string
          title: string
          try_these: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          focus: string
          id?: string
          review_area?: string
          sort?: number
          status?: string
          text: string
          title: string
          try_these?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          focus?: string
          id?: string
          review_area?: string
          sort?: number
          status?: string
          text?: string
          title?: string
          try_these?: string
          updated_at?: string
        }
        Relationships: []
      }
      learn_content: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          body: string
          id: string
          kind: string
          quiz: Json
          review_label: string | null
          section: string
          status: string
          summary: string
          tier: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          body?: string
          id?: string
          kind: string
          quiz?: Json
          review_label?: string | null
          section?: string
          status?: string
          summary?: string
          tier?: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          body?: string
          id?: string
          kind?: string
          quiz?: Json
          review_label?: string | null
          section?: string
          status?: string
          summary?: string
          tier?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      library_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          body: string
          category: string
          id: string
          keywords: string[]
          linked_tool: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          body: string
          category?: string
          id?: string
          keywords?: string[]
          linked_tool?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          body?: string
          category?: string
          id?: string
          keywords?: string[]
          linked_tool?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      movement_sessions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          benefit_tags: string[]
          description: string
          energy: string
          is_plus: boolean
          key: string
          minutes: number
          review_area: string
          sort: number
          status: string
          title: string
          type: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          benefit_tags?: string[]
          description?: string
          energy: string
          is_plus?: boolean
          key: string
          minutes: number
          review_area?: string
          sort?: number
          status?: string
          title: string
          type: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          benefit_tags?: string[]
          description?: string
          energy?: string
          is_plus?: boolean
          key?: string
          minutes?: number
          review_area?: string
          sort?: number
          status?: string
          title?: string
          type?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      pal_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id?: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: []
      }
      pal_invites: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          name: string
          owner_id: string
          permissions: Json
          relationship: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code?: string
          created_at?: string
          expires_at: string
          id?: string
          name: string
          owner_id?: string
          permissions?: Json
          relationship?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          name?: string
          owner_id?: string
          permissions?: Json
          relationship?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      pal_links: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          pal_id: string
          relationship: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          pal_id: string
          relationship?: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          pal_id?: string
          relationship?: string
          status?: string
        }
        Relationships: []
      }
      pal_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          read_at: string | null
          recipient_id: string
          reported: boolean
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          kind?: string
          read_at?: string | null
          recipient_id: string
          reported?: boolean
          sender_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          read_at?: string | null
          recipient_id?: string
          reported?: boolean
          sender_id?: string
        }
        Relationships: []
      }
      pal_permissions: {
        Row: {
          cycle_summary: boolean
          garden: boolean
          link_id: string
          med_checkins: boolean
          messages: boolean
          miss_alert: boolean
          shared_reminders: boolean
          status: boolean
        }
        Insert: {
          cycle_summary?: boolean
          garden?: boolean
          link_id: string
          med_checkins?: boolean
          messages?: boolean
          miss_alert?: boolean
          shared_reminders?: boolean
          status?: boolean
        }
        Update: {
          cycle_summary?: boolean
          garden?: boolean
          link_id?: string
          med_checkins?: boolean
          messages?: boolean
          miss_alert?: boolean
          shared_reminders?: boolean
          status?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "pal_permissions_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: true
            referencedRelation: "pal_links"
            referencedColumns: ["id"]
          },
        ]
      }
      pal_reports: {
        Row: {
          created_at: string
          handled_at: string | null
          id: string
          message_id: string
          reason: string
          reporter_id: string
        }
        Insert: {
          created_at?: string
          handled_at?: string | null
          id?: string
          message_id: string
          reason?: string
          reporter_id?: string
        }
        Update: {
          created_at?: string
          handled_at?: string | null
          id?: string
          message_id?: string
          reason?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pal_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "pal_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      pal_settings: {
        Row: {
          adult_confirmed_at: string | null
          paused_all: boolean
          user_id: string
        }
        Insert: {
          adult_confirmed_at?: string | null
          paused_all?: boolean
          user_id: string
        }
        Update: {
          adult_confirmed_at?: string | null
          paused_all?: boolean
          user_id?: string
        }
        Relationships: []
      }
      pal_status: {
        Row: {
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      petal_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          enabled: boolean
          id: string
          label: string
          schedule: string
          user_id: string
        }
        Insert: {
          enabled?: boolean
          id?: string
          label: string
          schedule: string
          user_id?: string
        }
        Update: {
          enabled?: boolean
          id?: string
          label?: string
          schedule?: string
          user_id?: string
        }
        Relationships: []
      }
      session_moves: {
        Row: {
          caution_flag: string | null
          caution_text: string | null
          easier_version: string | null
          how: string
          id: string
          move: string
          order: number
          seconds: number
          session_key: string
          video_url: string | null
        }
        Insert: {
          caution_flag?: string | null
          caution_text?: string | null
          easier_version?: string | null
          how?: string
          id?: string
          move: string
          order: number
          seconds: number
          session_key: string
          video_url?: string | null
        }
        Update: {
          caution_flag?: string | null
          caution_text?: string | null
          easier_version?: string | null
          how?: string
          id?: string
          move?: string
          order?: number
          seconds?: number
          session_key?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_moves_session_key_fkey"
            columns: ["session_key"]
            isOneToOne: false
            referencedRelation: "movement_sessions"
            referencedColumns: ["key"]
          },
        ]
      }
      side_quests: {
        Row: {
          created_at: string
          doing: string
          done_at: string | null
          id: string
          next_step: string | null
          notified_at: string | null
          remind_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          doing: string
          done_at?: string | null
          id?: string
          next_step?: string | null
          notified_at?: string | null
          remind_at?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          doing?: string
          done_at?: string | null
          id?: string
          next_step?: string | null
          notified_at?: string | null
          remind_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sprout_usage: {
        Row: {
          bucket: string
          count: number
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          window_start: string
        }
        Update: {
          bucket?: string
          count?: number
          window_start?: string
        }
        Relationships: []
      }
      unanswered_questions: {
        Row: {
          created_at: string
          handled: boolean
          id: string
          question_text: string
        }
        Insert: {
          created_at?: string
          handled?: boolean
          id?: string
          question_text: string
        }
        Update: {
          created_at?: string
          handled?: boolean
          id?: string
          question_text?: string
        }
        Relationships: []
      }
      user_favourites: {
        Row: {
          activity_key: string
          created_at: string
          position: number
          user_id: string
        }
        Insert: {
          activity_key: string
          created_at?: string
          position?: number
          user_id: string
        }
        Update: {
          activity_key?: string
          created_at?: string
          position?: number
          user_id?: string
        }
        Relationships: []
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
      vit_items: {
        Row: {
          created_at: string
          id: string
          location: string
          thing: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location: string
          thing: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          thing?: string
          user_id?: string
        }
        Relationships: []
      }
      wyr_characters: {
        Row: {
          code: string
          name: string
          portrait_svg: string
          result_text: string
        }
        Insert: {
          code: string
          name: string
          portrait_svg?: string
          result_text: string
        }
        Update: {
          code?: string
          name?: string
          portrait_svg?: string
          result_text?: string
        }
        Relationships: []
      }
      wyr_questions: {
        Row: {
          category: string
          character_a: string
          character_b: string
          id: number
          option_a: string
          option_b: string
          status: string
        }
        Insert: {
          category: string
          character_a: string
          character_b: string
          id?: number
          option_a: string
          option_b: string
          status?: string
        }
        Update: {
          category?: string
          character_a?: string
          character_b?: string
          id?: number
          option_a?: string
          option_b?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "wyr_questions_character_a_fkey"
            columns: ["character_a"]
            isOneToOne: false
            referencedRelation: "wyr_characters"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "wyr_questions_character_b_fkey"
            columns: ["character_b"]
            isOneToOne: false
            referencedRelation: "wyr_characters"
            referencedColumns: ["code"]
          },
        ]
      }
      wyr_results: {
        Row: {
          character_code: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          character_code: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          character_code?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wyr_results_character_code_fkey"
            columns: ["character_code"]
            isOneToOne: false
            referencedRelation: "wyr_characters"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      pal_accept_invite: { Args: { _code: string }; Returns: string }
      pal_blocked: { Args: { _a: string; _b: string }; Returns: boolean }
      pal_can_message: { Args: { _a: string; _b: string }; Returns: boolean }
      pal_can_see: {
        Args: { _owner: string; _perm: string; _viewer: string }
        Returns: boolean
      }
      pal_garden: {
        Args: { _owner: string }
        Returns: {
          badges: string[]
          petals: number
        }[]
      }
      pal_invite_preview: {
        Args: { _code: string }
        Returns: {
          is_mine: boolean
          owner_name: string
          pal_name: string
          permissions: Json
          relationship: string
          valid: boolean
        }[]
      }
      pal_mark_read: { Args: { _other: string }; Returns: undefined }
      pal_overview: {
        Args: never
        Returns: {
          blocked: boolean
          i_share_link: string
          i_share_status: string
          last_at: string
          last_body: string
          other_id: string
          other_name: string
          relationship: string
          their_status: string
          they_share_link: string
          they_share_status: string
          unread: number
        }[]
      }
      search_library: {
        Args: { q: string }
        Returns: {
          approved_at: string | null
          approved_by: string | null
          body: string
          category: string
          id: string
          keywords: string[]
          linked_tool: string | null
          status: string
          title: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "library_entries"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      sprout_hit: { Args: { _bucket: string }; Returns: number }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
