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
      analytics_events: {
        Row: {
          created_at: string | null
          event: string
          id: string
          properties: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event: string
          id?: string
          properties?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event?: string
          id?: string
          properties?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      avatars: {
        Row: {
          accessory: string | null
          background: string | null
          created_at: string | null
          hair: string | null
          id: string
          outfit: string | null
          skin: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accessory?: string | null
          background?: string | null
          created_at?: string | null
          hair?: string | null
          id?: string
          outfit?: string | null
          skin?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accessory?: string | null
          background?: string | null
          created_at?: string | null
          hair?: string | null
          id?: string
          outfit?: string | null
          skin?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_entries: {
        Row: {
          created_at: string | null
          date: string
          deep_work_minutes: number | null
          id: string
          journal_good: string | null
          journal_improve: string | null
          reading_minutes: number | null
          screen_hours: number | null
          sleep_hours: number | null
          study_minutes: number | null
          updated_at: string | null
          user_id: string
          workout_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          deep_work_minutes?: number | null
          id?: string
          journal_good?: string | null
          journal_improve?: string | null
          reading_minutes?: number | null
          screen_hours?: number | null
          sleep_hours?: number | null
          study_minutes?: number | null
          updated_at?: string | null
          user_id: string
          workout_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          deep_work_minutes?: number | null
          id?: string
          journal_good?: string | null
          journal_improve?: string | null
          reading_minutes?: number | null
          screen_hours?: number | null
          sleep_hours?: number | null
          study_minutes?: number | null
          updated_at?: string | null
          user_id?: string
          workout_minutes?: number | null
        }
        Relationships: []
      }
      feeding_history: {
        Row: {
          fed_at: string | null
          food_id: string
          id: string
          pet_id: string
          user_id: string
        }
        Insert: {
          fed_at?: string | null
          food_id: string
          id?: string
          pet_id: string
          user_id: string
        }
        Update: {
          fed_at?: string | null
          food_id?: string
          id?: string
          pet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeding_history_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeding_history_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          category: string | null
          description: string | null
          emoji: string
          energy_value: number | null
          happiness_value: number | null
          hunger_value: number | null
          id: string
          name: string
          premium_only: boolean | null
          price: number
          xp_value: number | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          emoji: string
          energy_value?: number | null
          happiness_value?: number | null
          hunger_value?: number | null
          id: string
          name: string
          premium_only?: boolean | null
          price: number
          xp_value?: number | null
        }
        Update: {
          category?: string | null
          description?: string | null
          emoji?: string
          energy_value?: number | null
          happiness_value?: number | null
          hunger_value?: number | null
          id?: string
          name?: string
          premium_only?: boolean | null
          price?: number
          xp_value?: number | null
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          coins_earned: number | null
          created_at: string | null
          date: string
          habit_id: string
          id: string
          updated_at: string | null
          user_id: string
          value: number
          xp_earned: number
        }
        Insert: {
          coins_earned?: number | null
          created_at?: string | null
          date: string
          habit_id: string
          id?: string
          updated_at?: string | null
          user_id: string
          value?: number
          xp_earned?: number
        }
        Update: {
          coins_earned?: number | null
          created_at?: string | null
          date?: string
          habit_id?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          value?: number
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "user_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string | null
          date: string
          free_notes: string | null
          id: string
          important_event: string | null
          learned: string | null
          proud_of: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          free_notes?: string | null
          id?: string
          important_event?: string | null
          learned?: string | null
          proud_of?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          free_notes?: string | null
          id?: string
          important_event?: string | null
          learned?: string | null
          proud_of?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_highlights: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          emoji: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          emoji?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          emoji?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_moods: {
        Row: {
          created_at: string | null
          date: string
          id: string
          mood: Database["public"]["Enums"]["mood_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          mood: Database["public"]["Enums"]["mood_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          mood?: Database["public"]["Enums"]["mood_type"]
          user_id?: string
        }
        Relationships: []
      }
      life_events: {
        Row: {
          created_at: string | null
          description: string | null
          emoji: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["life_event_type"]
          id: string
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["life_event_type"]
          id?: string
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          event_date?: string
          event_type?: Database["public"]["Enums"]["life_event_type"]
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_summaries: {
        Row: {
          created_at: string | null
          id: string
          month: number
          stats: Json | null
          summary: string
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: number
          stats?: Json | null
          summary: string
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: number
          stats?: Json | null
          summary?: string
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      pets: {
        Row: {
          accessory: string | null
          created_at: string | null
          energy: number | null
          id: string
          last_fed: string | null
          last_updated: string | null
          level: number | null
          name: string | null
          skin: string | null
          species: string | null
          stored_energy: number | null
          stored_happiness: number | null
          stored_hunger: number | null
          updated_at: string | null
          user_id: string
          xp: number | null
        }
        Insert: {
          accessory?: string | null
          created_at?: string | null
          energy?: number | null
          id?: string
          last_fed?: string | null
          last_updated?: string | null
          level?: number | null
          name?: string | null
          skin?: string | null
          species?: string | null
          stored_energy?: number | null
          stored_happiness?: number | null
          stored_hunger?: number | null
          updated_at?: string | null
          user_id: string
          xp?: number | null
        }
        Update: {
          accessory?: string | null
          created_at?: string | null
          energy?: number | null
          id?: string
          last_fed?: string | null
          last_updated?: string | null
          level?: number | null
          name?: string | null
          skin?: string | null
          species?: string | null
          stored_energy?: number | null
          stored_happiness?: number | null
          stored_hunger?: number | null
          updated_at?: string | null
          user_id?: string
          xp?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          coins: number | null
          created_at: string | null
          display_name: string | null
          email: string | null
          goals: string[] | null
          id: string
          last_check_in: string | null
          onboarded: boolean | null
          premium: boolean | null
          referral_code: string | null
          referred_by: string | null
          streak: number | null
          updated_at: string | null
          xp: number
        }
        Insert: {
          age?: number | null
          coins?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          goals?: string[] | null
          id: string
          last_check_in?: string | null
          onboarded?: boolean | null
          premium?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          streak?: number | null
          updated_at?: string | null
          xp?: number
        }
        Update: {
          age?: number | null
          coins?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          goals?: string[] | null
          id?: string
          last_check_in?: string | null
          onboarded?: boolean | null
          premium?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          streak?: number | null
          updated_at?: string | null
          xp?: number
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          created_at: string | null
          id: string
          referred_id: string | null
          referrer_id: string
          rewarded: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id: string
          rewarded?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id?: string
          rewarded?: boolean | null
        }
        Relationships: []
      }
      rewarded_dates: {
        Row: {
          coins_earned: number | null
          created_at: string | null
          date: string
          id: string
          user_id: string
        }
        Insert: {
          coins_earned?: number | null
          created_at?: string | null
          date: string
          id?: string
          user_id: string
        }
        Update: {
          coins_earned?: number | null
          created_at?: string | null
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          payload: Json | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          payload?: Json | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          payload?: Json | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_avatars: {
        Row: {
          accessory: string | null
          background: string | null
          created_at: string | null
          eye_color: string | null
          eye_style: string | null
          hair_color: string | null
          hair_style: string | null
          id: string
          outfit: string | null
          outfit_color: string | null
          skin_tone: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accessory?: string | null
          background?: string | null
          created_at?: string | null
          eye_color?: string | null
          eye_style?: string | null
          hair_color?: string | null
          hair_style?: string | null
          id?: string
          outfit?: string | null
          outfit_color?: string | null
          skin_tone?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accessory?: string | null
          background?: string | null
          created_at?: string | null
          eye_color?: string | null
          eye_style?: string | null
          hair_color?: string | null
          hair_style?: string | null
          id?: string
          outfit?: string | null
          outfit_color?: string | null
          skin_tone?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          coins: number | null
          id: string
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          coins?: number | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          coins?: number | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_cosmetics: {
        Row: {
          equipped: boolean | null
          id: string
          item_id: string
          owned: boolean | null
          purchased_at: string | null
          user_id: string | null
        }
        Insert: {
          equipped?: boolean | null
          id?: string
          item_id: string
          owned?: boolean | null
          purchased_at?: string | null
          user_id?: string | null
        }
        Update: {
          equipped?: boolean | null
          id?: string
          item_id?: string
          owned?: boolean | null
          purchased_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_foods: {
        Row: {
          acquired_at: string | null
          food_id: string
          id: string
          quantity: number | null
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          food_id: string
          id?: string
          quantity?: number | null
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          food_id?: string
          id?: string
          quantity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_foods_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          category: string
          color: string
          completed_at: string | null
          created_at: string | null
          current_value: number
          deadline: string | null
          description: string | null
          difficulty: string
          goal_type: string
          icon: string
          id: string
          reward_coins: number
          reward_item: string | null
          sort_order: number | null
          status: string
          target_value: number
          title: string
          unit: string
          updated_at: string | null
          user_id: string
          xp_reward: number
        }
        Insert: {
          category?: string
          color?: string
          completed_at?: string | null
          created_at?: string | null
          current_value?: number
          deadline?: string | null
          description?: string | null
          difficulty?: string
          goal_type?: string
          icon?: string
          id?: string
          reward_coins?: number
          reward_item?: string | null
          sort_order?: number | null
          status?: string
          target_value?: number
          title: string
          unit?: string
          updated_at?: string | null
          user_id: string
          xp_reward?: number
        }
        Update: {
          category?: string
          color?: string
          completed_at?: string | null
          created_at?: string | null
          current_value?: number
          deadline?: string | null
          description?: string | null
          difficulty?: string
          goal_type?: string
          icon?: string
          id?: string
          reward_coins?: number
          reward_item?: string | null
          sort_order?: number | null
          status?: string
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string | null
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      user_habits: {
        Row: {
          category: string
          color: string
          created_at: string | null
          difficulty: string
          icon: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          reward_per_unit: number
          sort_order: number | null
          target_per_day: number | null
          unit: string
          updated_at: string | null
          user_id: string
          xp_per_unit: number
        }
        Insert: {
          category?: string
          color?: string
          created_at?: string | null
          difficulty?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          reward_per_unit?: number
          sort_order?: number | null
          target_per_day?: number | null
          unit?: string
          updated_at?: string | null
          user_id: string
          xp_per_unit?: number
        }
        Update: {
          category?: string
          color?: string
          created_at?: string | null
          difficulty?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          reward_per_unit?: number
          sort_order?: number | null
          target_per_day?: number | null
          unit?: string
          updated_at?: string | null
          user_id?: string
          xp_per_unit?: number
        }
        Relationships: []
      }
      user_items: {
        Row: {
          id: string
          item_id: string
          purchased_at: string | null
          quantity: number | null
          user_id: string
        }
        Insert: {
          id?: string
          item_id: string
          purchased_at?: string | null
          quantity?: number | null
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string
          purchased_at?: string | null
          quantity?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      life_event_type:
        | "journal_highlight"
        | "goal_completed"
        | "trophy_unlocked"
        | "pet_evolved"
        | "milestone"
        | "streak"
      mood_type: "amazing" | "happy" | "good" | "neutral" | "tired" | "bad"
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
      life_event_type: [
        "journal_highlight",
        "goal_completed",
        "trophy_unlocked",
        "pet_evolved",
        "milestone",
        "streak",
      ],
      mood_type: ["amazing", "happy", "good", "neutral", "tired", "bad"],
    },
  },
} as const
