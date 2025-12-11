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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          block_message: string | null
          block_table_reservations: boolean | null
          booking_percentage: number | null
          category: string
          created_at: string
          date: string
          description: string
          dj: string | null
          external_reservation_url: string | null
          featured: boolean
          host: string | null
          id: string
          image_url: string | null
          is_recurring: boolean | null
          price: string
          price_range: string
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          sold_out: boolean
          tickets_url: string | null
          time: string
          title: string
          updated_at: string
        }
        Insert: {
          block_message?: string | null
          block_table_reservations?: boolean | null
          booking_percentage?: number | null
          category: string
          created_at?: string
          date: string
          description: string
          dj?: string | null
          external_reservation_url?: string | null
          featured?: boolean
          host?: string | null
          id?: string
          image_url?: string | null
          is_recurring?: boolean | null
          price: string
          price_range: string
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          sold_out?: boolean
          tickets_url?: string | null
          time: string
          title: string
          updated_at?: string
        }
        Update: {
          block_message?: string | null
          block_table_reservations?: boolean | null
          booking_percentage?: number | null
          category?: string
          created_at?: string
          date?: string
          description?: string
          dj?: string | null
          external_reservation_url?: string | null
          featured?: boolean
          host?: string | null
          id?: string
          image_url?: string | null
          is_recurring?: boolean | null
          price?: string
          price_range?: string
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          sold_out?: boolean
          tickets_url?: string | null
          time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_data: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          form_data: Json
          form_type: string
          full_name: string
          id: string
          status: string
          submission_date: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          form_data?: Json
          form_type: string
          full_name: string
          id?: string
          status?: string
          submission_date?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          form_data?: Json
          form_type?: string
          full_name?: string
          id?: string
          status?: string
          submission_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          alt: string
          category: string
          created_at: string
          gallery_type: string
          id: string
          src: string
          updated_at: string
        }
        Insert: {
          alt: string
          category: string
          created_at?: string
          gallery_type: string
          id?: string
          src: string
          updated_at?: string
        }
        Update: {
          alt?: string
          category?: string
          created_at?: string
          gallery_type?: string
          id?: string
          src?: string
          updated_at?: string
        }
        Relationships: []
      }
      home_modals: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean
          primary_button_action: string
          primary_button_text: string
          secondary_button_action: string
          secondary_button_text: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          primary_button_action?: string
          primary_button_text?: string
          secondary_button_action?: string
          secondary_button_text?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          primary_button_action?: string
          primary_button_text?: string
          secondary_button_action?: string
          secondary_button_text?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          availability: string
          city_state: string
          cover_letter_url: string | null
          created_at: string
          email: string
          experience_summary: string
          full_name: string
          id: string
          job_id: string
          late_night_ok: boolean
          phone: string
          resume_url: string | null
          start_date: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          availability: string
          city_state: string
          cover_letter_url?: string | null
          created_at?: string
          email: string
          experience_summary: string
          full_name: string
          id?: string
          job_id: string
          late_night_ok?: boolean
          phone: string
          resume_url?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          availability?: string
          city_state?: string
          cover_letter_url?: string | null
          created_at?: string
          email?: string
          experience_summary?: string
          full_name?: string
          id?: string
          job_id?: string
          late_night_ok?: boolean
          phone?: string
          resume_url?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          compensation: string | null
          created_at: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          full_description: string
          id: string
          location: string
          requirements: string
          short_description: string
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
        }
        Insert: {
          compensation?: string | null
          created_at?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          full_description: string
          id?: string
          location?: string
          requirements: string
          short_description: string
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
        }
        Update: {
          compensation?: string | null
          created_at?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          full_description?: string
          id?: string
          location?: string
          requirements?: string
          short_description?: string
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership_levels: {
        Row: {
          card_image_url: string | null
          created_at: string
          description: string
          duration_months: number
          id: string
          max_daily_scans: number
          multi_user_enabled: boolean
          name: string
          perks: Json
          premium_1_month: number
          premium_2_months: number
          premium_3_months: number
          price: number
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          card_image_url?: string | null
          created_at?: string
          description?: string
          duration_months?: number
          id?: string
          max_daily_scans?: number
          multi_user_enabled?: boolean
          name: string
          perks?: Json
          premium_1_month?: number
          premium_2_months?: number
          premium_3_months?: number
          price?: number
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          card_image_url?: string | null
          created_at?: string
          description?: string
          duration_months?: number
          id?: string
          max_daily_scans?: number
          multi_user_enabled?: boolean
          name?: string
          perks?: Json
          premium_1_month?: number
          premium_2_months?: number
          premium_3_months?: number
          price?: number
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership_scan_logs: {
        Row: {
          created_at: string
          event_name: string | null
          id: string
          membership_id: string
          scan_status: string
          scanned_at: string
          scanned_by: string | null
        }
        Insert: {
          created_at?: string
          event_name?: string | null
          id?: string
          membership_id: string
          scan_status: string
          scanned_at?: string
          scanned_by?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string | null
          id?: string
          membership_id?: string
          scan_status?: string
          scanned_at?: string
          scanned_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_scan_logs_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          active: boolean
          created_at: string
          email: string
          expiration_date: string
          full_name: string
          id: string
          last_scan_reset_date: string
          membership_level_id: string
          payment_status: string
          phone: string | null
          purchase_date: string
          qr_code_token: string
          remaining_daily_scans: number
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          expiration_date: string
          full_name: string
          id?: string
          last_scan_reset_date?: string
          membership_level_id: string
          payment_status?: string
          phone?: string | null
          purchase_date?: string
          qr_code_token: string
          remaining_daily_scans?: number
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          expiration_date?: string
          full_name?: string
          id?: string
          last_scan_reset_date?: string
          membership_level_id?: string
          payment_status?: string
          phone?: string | null
          purchase_date?: string
          qr_code_token?: string
          remaining_daily_scans?: number
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_membership_level_id_fkey"
            columns: ["membership_level_id"]
            isOneToOne: false
            referencedRelation: "membership_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string
          created_at: string
          description: string
          dietary: string[]
          id: string
          image_url: string | null
          ingredients: string[]
          name: string
          price: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          dietary: string[]
          id?: string
          image_url?: string | null
          ingredients: string[]
          name: string
          price: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          dietary?: string[]
          id?: string
          image_url?: string | null
          ingredients?: string[]
          name?: string
          price?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          notification_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          notification_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          notification_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          reservation_id: string | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          reservation_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          reservation_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "table_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      physical_card_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          membership_id: string
          picked_up_at: string | null
          ready_at: string | null
          requested_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          membership_id: string
          picked_up_at?: string | null
          ready_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          membership_id?: string
          picked_up_at?: string | null
          ready_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "physical_card_requests_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      table_reservations: {
        Row: {
          birthday_package: boolean | null
          checked_in_at: string | null
          checked_in_by: string | null
          checked_out_at: string | null
          checked_out_by: string | null
          created_at: string
          event_id: string | null
          expires_at: string | null
          guest_count: number
          guest_email: string
          guest_name: string
          guest_phone: string | null
          id: string
          payment_status: string | null
          reservation_type: string | null
          screen_display_image_url: string | null
          special_requests: string | null
          status: string
          stripe_session_id: string | null
          table_id: string
          time_slot: string | null
          total_price: number | null
          updated_at: string
        }
        Insert: {
          birthday_package?: boolean | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_out_at?: string | null
          checked_out_by?: string | null
          created_at?: string
          event_id?: string | null
          expires_at?: string | null
          guest_count: number
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          id?: string
          payment_status?: string | null
          reservation_type?: string | null
          screen_display_image_url?: string | null
          special_requests?: string | null
          status?: string
          stripe_session_id?: string | null
          table_id: string
          time_slot?: string | null
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          birthday_package?: boolean | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_out_at?: string | null
          checked_out_by?: string | null
          created_at?: string
          event_id?: string | null
          expires_at?: string | null
          guest_count?: number
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          id?: string
          payment_status?: string | null
          reservation_type?: string | null
          screen_display_image_url?: string | null
          special_requests?: string | null
          status?: string
          stripe_session_id?: string | null
          table_id?: string
          time_slot?: string | null
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_reservations_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "table_reservations_checked_out_by_fkey"
            columns: ["checked_out_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "table_reservations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "venue_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_tables: {
        Row: {
          created_at: string
          height: number
          id: string
          is_available: boolean
          location: string | null
          max_guests: number
          position_x: number
          position_y: number
          reservation_price: number | null
          table_number: number
          updated_at: string
          width: number
        }
        Insert: {
          created_at?: string
          height?: number
          id?: string
          is_available?: boolean
          location?: string | null
          max_guests?: number
          position_x?: number
          position_y?: number
          reservation_price?: number | null
          table_number: number
          updated_at?: string
          width?: number
        }
        Update: {
          created_at?: string
          height?: number
          id?: string
          is_available?: boolean
          location?: string | null
          max_guests?: number
          position_x?: number
          position_y?: number
          reservation_price?: number | null
          table_number?: number
          updated_at?: string
          width?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_reservations: { Args: never; Returns: undefined }
      create_admin_user: {
        Args: { p_email: string; p_role?: string }
        Returns: Json
      }
      delete_admin_user: { Args: { p_user_id: string }; Returns: undefined }
      has_temporary_password: { Args: { user_id: string }; Returns: boolean }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_table_available: {
        Args: { p_event_id: string; p_table_id: string }
        Returns: boolean
      }
      mark_password_changed: { Args: { user_id: string }; Returns: undefined }
      reset_admin_password: { Args: { p_user_id: string }; Returns: string }
      reset_membership_daily_scans: { Args: never; Returns: undefined }
      update_admin_user_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: undefined
      }
      validate_membership_scan: {
        Args: {
          p_event_name?: string
          p_qr_token: string
          p_scanned_by?: string
        }
        Returns: Json
      }
    }
    Enums: {
      application_status:
        | "new"
        | "reviewing"
        | "interview"
        | "rejected"
        | "hired"
      employment_type: "full-time" | "part-time" | "gig" | "contractor"
      job_status: "active" | "archived"
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
      application_status: [
        "new",
        "reviewing",
        "interview",
        "rejected",
        "hired",
      ],
      employment_type: ["full-time", "part-time", "gig", "contractor"],
      job_status: ["active", "archived"],
    },
  },
} as const
