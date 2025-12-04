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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_value: string | null
          old_value: string | null
          performed_by: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_by: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_by?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      flats: {
        Row: {
          area: number
          bathrooms: number
          bedrooms: number
          created_at: string
          created_by: string | null
          description: string | null
          flat_name: string
          floor: number | null
          id: string
          images: string[] | null
          location: string
          price: number
          status: string
          updated_at: string
        }
        Insert: {
          area: number
          bathrooms: number
          bedrooms: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          flat_name: string
          floor?: number | null
          id?: string
          images?: string[] | null
          location: string
          price: number
          status?: string
          updated_at?: string
        }
        Update: {
          area?: number
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          flat_name?: string
          floor?: number | null
          id?: string
          images?: string[] | null
          location?: string
          price?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      folio_summary: {
        Row: {
          current_units: number | null
          folio_no: string
          id: string
          investor: string
          net_gain_loss: number | null
          schemes_invested: number | null
          total_investment: number | null
          total_redemption: number | null
          transaction_count: number | null
          updated_at: string | null
        }
        Insert: {
          current_units?: number | null
          folio_no: string
          id?: string
          investor: string
          net_gain_loss?: number | null
          schemes_invested?: number | null
          total_investment?: number | null
          total_redemption?: number | null
          transaction_count?: number | null
          updated_at?: string | null
        }
        Update: {
          current_units?: number | null
          folio_no?: string
          id?: string
          investor?: string
          net_gain_loss?: number | null
          schemes_invested?: number | null
          total_investment?: number | null
          total_redemption?: number | null
          transaction_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gold: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          item_name: string
          price: number
          purchase_date: string
          purity: string
          status: string
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          item_name: string
          price: number
          purchase_date: string
          purity: string
          status?: string
          updated_at?: string
          weight: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          item_name?: string
          price?: number
          purchase_date?: string
          purity?: string
          status?: string
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      notification_history: {
        Row: {
          created_by: string | null
          error_message: string | null
          id: string
          notification_type: string
          property_name: string | null
          recipient_email: string
          sent_at: string
          status: string
          subject: string
          tenant_name: string | null
        }
        Insert: {
          created_by?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          property_name?: string | null
          recipient_email: string
          sent_at?: string
          status?: string
          subject: string
          tenant_name?: string | null
        }
        Update: {
          created_by?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          property_name?: string | null
          recipient_email?: string
          sent_at?: string
          status?: string
          subject?: string
          tenant_name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          folio: string | null
          id: string
          investor_name: string
          nav: number
          scheme: string
          transaction_type: string
          units: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          folio?: string | null
          id?: string
          investor_name: string
          nav: number
          scheme: string
          transaction_type: string
          units: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          folio?: string | null
          id?: string
          investor_name?: string
          nav?: number
          scheme?: string
          transaction_type?: string
          units?: number
        }
        Relationships: []
      }
      raw_transactions: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          folio_no: string | null
          id: string
          investor_name: string
          nav: number
          scheme_name: string
          transaction_type: string
          units: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          folio_no?: string | null
          id?: string
          investor_name: string
          nav: number
          scheme_name: string
          transaction_type: string
          units: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          folio_no?: string | null
          id?: string
          investor_name?: string
          nav?: number
          scheme_name?: string
          transaction_type?: string
          units?: number
        }
        Relationships: []
      }
      real_estate: {
        Row: {
          area: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          images: string[] | null
          location: string
          price: number
          property_name: string
          property_type: string
          status: string
          updated_at: string
        }
        Insert: {
          area: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          location: string
          price: number
          property_name: string
          property_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          area?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string
          price?: number
          property_name?: string
          property_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          folio: string | null
          id: string
          investor_name: string
          nav: number
          scheme: string
          transaction_type: string
          units: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          folio?: string | null
          id?: string
          investor_name: string
          nav: number
          scheme: string
          transaction_type: string
          units: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          folio?: string | null
          id?: string
          investor_name?: string
          nav?: number
          scheme?: string
          transaction_type?: string
          units?: number
        }
        Relationships: []
      }
      rental_properties: {
        Row: {
          area: number
          bathrooms: number
          bedrooms: number
          created_at: string
          created_by: string | null
          deposit: number
          description: string | null
          id: string
          images: string[] | null
          lease_end_date: string | null
          lease_start_date: string | null
          location: string
          monthly_rent: number
          property_name: string
          status: string
          tenant_name: string | null
          updated_at: string
        }
        Insert: {
          area: number
          bathrooms: number
          bedrooms: number
          created_at?: string
          created_by?: string | null
          deposit: number
          description?: string | null
          id?: string
          images?: string[] | null
          lease_end_date?: string | null
          lease_start_date?: string | null
          location: string
          monthly_rent: number
          property_name: string
          status?: string
          tenant_name?: string | null
          updated_at?: string
        }
        Update: {
          area?: number
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          created_by?: string | null
          deposit?: number
          description?: string | null
          id?: string
          images?: string[] | null
          lease_end_date?: string | null
          lease_start_date?: string | null
          location?: string
          monthly_rent?: number
          property_name?: string
          status?: string
          tenant_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_sidebar_items: {
        Row: {
          created_at: string | null
          id: string
          role_id: string
          sidebar_item_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role_id: string
          sidebar_item_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role_id?: string
          sidebar_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_sidebar_items_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_sidebar_items_sidebar_item_id_fkey"
            columns: ["sidebar_item_id"]
            isOneToOne: false
            referencedRelation: "sidebar_items"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system_role: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      scheme_summary: {
        Row: {
          current_units: number | null
          id: string
          latest_nav: number | null
          net_investment: number | null
          net_value: number | null
          scheme_name: string
          total_investors: number | null
          total_purchased: number | null
          total_redeemed: number | null
          updated_at: string | null
        }
        Insert: {
          current_units?: number | null
          id?: string
          latest_nav?: number | null
          net_investment?: number | null
          net_value?: number | null
          scheme_name: string
          total_investors?: number | null
          total_purchased?: number | null
          total_redeemed?: number | null
          updated_at?: string | null
        }
        Update: {
          current_units?: number | null
          id?: string
          latest_nav?: number | null
          net_investment?: number | null
          net_value?: number | null
          scheme_name?: string
          total_investors?: number | null
          total_purchased?: number | null
          total_redeemed?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sidebar_items: {
        Row: {
          created_at: string | null
          display_order: number | null
          href: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          href: string
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          href?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sidebar_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sidebar_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      delete_user: { Args: { _user_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "superAdmin" | "user"
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
      app_role: ["superAdmin", "user"],
    },
  },
} as const