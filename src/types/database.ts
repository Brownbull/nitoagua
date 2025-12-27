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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_allowed_emails: {
        Row: {
          added_at: string
          added_by: string
          email: string
          notes: string | null
        }
        Insert: {
          added_at?: string
          added_by: string
          email: string
          notes?: string | null
        }
        Update: {
          added_at?: string
          added_by?: string
          email?: string
          notes?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "admin_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_ledger: {
        Row: {
          admin_id: string | null
          amount: number
          bank_reference: string | null
          created_at: string
          description: string | null
          id: string
          provider_id: string
          request_id: string | null
          type: string
        }
        Insert: {
          admin_id?: string | null
          amount: number
          bank_reference?: string | null
          created_at?: string
          description?: string | null
          id?: string
          provider_id: string
          request_id?: string | null
          type: string
        }
        Update: {
          admin_id?: string | null
          amount?: number
          bank_reference?: string | null
          created_at?: string
          description?: string | null
          id?: string
          provider_id?: string
          request_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_ledger_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_ledger_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_ledger_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "water_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      comunas: {
        Row: {
          active: boolean | null
          id: string
          name: string
          region: string
        }
        Insert: {
          active?: boolean | null
          id: string
          name: string
          region: string
        }
        Update: {
          active?: boolean | null
          id?: string
          name?: string
          region?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          accepted_at: string | null
          created_at: string
          delivery_window_end: string
          delivery_window_start: string
          expires_at: string
          id: string
          message: string | null
          provider_id: string
          request_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          delivery_window_end: string
          delivery_window_start: string
          expires_at: string
          id?: string
          message?: string | null
          provider_id: string
          request_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          delivery_window_end?: string
          delivery_window_start?: string
          expires_at?: string
          id?: string
          message?: string | null
          provider_id?: string
          request_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "water_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bank_account: string | null
          bank_name: string | null
          commission_override: number | null
          comuna_id: string | null
          created_at: string | null
          email: string | null
          id: string
          internal_notes: string | null
          is_available: boolean | null
          name: string
          phone: string
          price_10000l: number | null
          price_1000l: number | null
          price_100l: number | null
          price_5000l: number | null
          rejection_reason: string | null
          role: string
          service_area: string | null
          special_instructions: string | null
          suspension_reason: string | null
          updated_at: string | null
          vehicle_capacity: number | null
          vehicle_type: string | null
          verification_status: string | null
          working_days: string[] | null
          working_hours: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bank_account?: string | null
          bank_name?: string | null
          commission_override?: number | null
          comuna_id?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          internal_notes?: string | null
          is_available?: boolean | null
          name: string
          phone: string
          price_10000l?: number | null
          price_1000l?: number | null
          price_100l?: number | null
          price_5000l?: number | null
          rejection_reason?: string | null
          role: string
          service_area?: string | null
          special_instructions?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
          vehicle_capacity?: number | null
          vehicle_type?: string | null
          verification_status?: string | null
          working_days?: string[] | null
          working_hours?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bank_account?: string | null
          bank_name?: string | null
          commission_override?: number | null
          comuna_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          internal_notes?: string | null
          is_available?: boolean | null
          name?: string
          phone?: string
          price_10000l?: number | null
          price_1000l?: number | null
          price_100l?: number | null
          price_5000l?: number | null
          rejection_reason?: string | null
          role?: string
          service_area?: string | null
          special_instructions?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
          vehicle_capacity?: number | null
          vehicle_type?: string | null
          verification_status?: string | null
          working_days?: string[] | null
          working_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_comuna_id_fkey"
            columns: ["comuna_id"]
            isOneToOne: false
            referencedRelation: "comunas"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_documents: {
        Row: {
          expires_at: string | null
          id: string
          original_filename: string | null
          provider_id: string
          storage_path: string
          type: string
          uploaded_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          expires_at?: string | null
          id?: string
          original_filename?: string | null
          provider_id: string
          storage_path: string
          type: string
          uploaded_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          expires_at?: string | null
          id?: string
          original_filename?: string | null
          provider_id?: string
          storage_path?: string
          type?: string
          uploaded_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_documents_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_service_areas: {
        Row: {
          comuna_id: string
          provider_id: string
        }
        Insert: {
          comuna_id: string
          provider_id: string
        }
        Update: {
          comuna_id?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_service_areas_comuna_id_fkey"
            columns: ["comuna_id"]
            isOneToOne: false
            referencedRelation: "comunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_service_areas_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      water_requests: {
        Row: {
          accepted_at: string | null
          address: string
          amount: number
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          comuna_id: string | null
          consumer_id: string | null
          created_at: string | null
          decline_reason: string | null
          delivered_at: string | null
          delivery_window: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string
          id: string
          in_transit_at: string | null
          is_urgent: boolean | null
          latitude: number | null
          longitude: number | null
          payment_method: string | null
          special_instructions: string | null
          status: string
          supplier_id: string | null
          timed_out_at: string | null
          tracking_token: string | null
        }
        Insert: {
          accepted_at?: string | null
          address: string
          amount: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          comuna_id?: string | null
          consumer_id?: string | null
          created_at?: string | null
          decline_reason?: string | null
          delivered_at?: string | null
          delivery_window?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone: string
          id?: string
          in_transit_at?: string | null
          is_urgent?: boolean | null
          latitude?: number | null
          longitude?: number | null
          payment_method?: string | null
          special_instructions?: string | null
          status?: string
          supplier_id?: string | null
          timed_out_at?: string | null
          tracking_token?: string | null
        }
        Update: {
          accepted_at?: string | null
          address?: string
          amount?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          comuna_id?: string | null
          in_transit_at?: string | null
          consumer_id?: string | null
          created_at?: string | null
          decline_reason?: string | null
          delivered_at?: string | null
          delivery_window?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string
          id?: string
          is_urgent?: boolean | null
          latitude?: number | null
          longitude?: number | null
          payment_method?: string | null
          special_instructions?: string | null
          status?: string
          supplier_id?: string | null
          timed_out_at?: string | null
          tracking_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "water_requests_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "water_requests_comuna_id_fkey"
            columns: ["comuna_id"]
            isOneToOne: false
            referencedRelation: "comunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "water_requests_consumer_id_fkey"
            columns: ["consumer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "water_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          amount: number
          bank_reference: string | null
          created_at: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          provider_id: string
          receipt_path: string | null
          rejection_reason: string | null
          status: string | null
        }
        Insert: {
          amount: number
          bank_reference?: string | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          provider_id: string
          receipt_path?: string | null
          rejection_reason?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          bank_reference?: string | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          provider_id?: string
          receipt_path?: string | null
          rejection_reason?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
