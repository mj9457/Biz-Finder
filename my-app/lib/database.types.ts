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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          address: string | null
          business_number: string | null
          ceo_name: string | null
          company_name: string | null
          company_type: string | null
          created_at: string
          description: string | null
          dm_excluded: string | null
          email: string | null
          employee_count: number | null
          established_date: string | null
          executive: string | null
          executive_priority: number | null
          fax: string | null
          id: number
          industry_chamber: string | null
          industry_code: string | null
          is_closed: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          main_products: string | null
          member_type_2026: string | null
          phone: string | null
          position: string | null
          postal_code: string | null
          primary_category: string | null
          region: string | null
          search_text: string | null
          standard_industry: string | null
          tags: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          business_number?: string | null
          ceo_name?: string | null
          company_name?: string | null
          company_type?: string | null
          created_at?: string
          description?: string | null
          dm_excluded?: string | null
          email?: string | null
          employee_count?: number | null
          established_date?: string | null
          executive?: string | null
          executive_priority?: number | null
          fax?: string | null
          id?: number
          industry_chamber?: string | null
          industry_code?: string | null
          is_closed?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          main_products?: string | null
          member_type_2026?: string | null
          phone?: string | null
          position?: string | null
          postal_code?: string | null
          primary_category?: string | null
          region?: string | null
          search_text?: string | null
          standard_industry?: string | null
          tags?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          business_number?: string | null
          ceo_name?: string | null
          company_name?: string | null
          company_type?: string | null
          created_at?: string
          description?: string | null
          dm_excluded?: string | null
          email?: string | null
          employee_count?: number | null
          established_date?: string | null
          executive?: string | null
          executive_priority?: number | null
          fax?: string | null
          id?: number
          industry_chamber?: string | null
          industry_code?: string | null
          is_closed?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          main_products?: string | null
          member_type_2026?: string | null
          phone?: string | null
          position?: string | null
          postal_code?: string | null
          primary_category?: string | null
          region?: string | null
          search_text?: string | null
          standard_industry?: string | null
          tags?: string | null
          website?: string | null
        }
        Relationships: []
      }
      executive_import: {
        Row: {
          company_name: string | null
          executive: string | null
        }
        Insert: {
          company_name?: string | null
          executive?: string | null
        }
        Update: {
          company_name?: string | null
          executive?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      derive_company_category: {
        Args: {
          p_company_type: string
          p_current_primary_category?: string
          p_industry_chamber: string
          p_industry_code: string
          p_standard_industry: string
        }
        Returns: string
      }
      derive_company_region: {
        Args: { p_address: string; p_location: string }
        Returns: string
      }
      get_company_filtered_facets: {
        Args: {
          p_categories?: string[]
          p_employee_ranges?: string[]
          p_executive_only?: boolean
          p_executive_roles?: string[]
          p_region?: string
        }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
