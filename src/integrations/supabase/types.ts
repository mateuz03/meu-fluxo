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
      accounts: {
        Row: {
          archived: boolean
          color: string
          created_at: string
          currency: string
          id: string
          institution: string | null
          name: string
          opening_balance_cents: number
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          color?: string
          created_at?: string
          currency?: string
          id?: string
          institution?: string | null
          name: string
          opening_balance_cents?: number
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          color?: string
          created_at?: string
          currency?: string
          id?: string
          institution?: string | null
          name?: string
          opening_balance_cents?: number
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          limit_cents: number
          month: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          limit_cents?: number
          month: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          limit_cents?: number
          month?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      card_installments: {
        Row: {
          created_at: string
          credit_card_id: string | null
          description: string
          first_charge_on: string
          id: string
          installments_paid: number
          installments_total: number
          total_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_card_id?: string | null
          description: string
          first_charge_on?: string
          id?: string
          installments_paid?: number
          installments_total: number
          total_cents: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credit_card_id?: string | null
          description?: string
          first_charge_on?: string
          id?: string
          installments_paid?: number
          installments_total?: number
          total_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_installments_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          archived: boolean
          color: string
          created_at: string
          icon: string | null
          id: string
          kind: Database["public"]["Enums"]["category_kind"]
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["category_kind"]
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["category_kind"]
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_cards: {
        Row: {
          archived: boolean
          brand: string | null
          closing_day: number
          color: string
          created_at: string
          due_day: number
          id: string
          limit_cents: number
          name: string
          payment_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          brand?: string | null
          closing_day?: number
          color?: string
          created_at?: string
          due_day?: number
          id?: string
          limit_cents?: number
          name: string
          payment_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          brand?: string | null
          closing_day?: number
          color?: string
          created_at?: string
          due_day?: number
          id?: string
          limit_cents?: number
          name?: string
          payment_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_cards_payment_account_id_fkey"
            columns: ["payment_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          balance_cents: number
          created_at: string
          creditor: string | null
          id: string
          installment_cents: number
          interest_rate: number | null
          name: string
          remaining_installments: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_cents?: number
          created_at?: string
          creditor?: string | null
          id?: string
          installment_cents?: number
          interest_rate?: number | null
          name: string
          remaining_installments?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_cents?: number
          created_at?: string
          creditor?: string | null
          id?: string
          installment_cents?: number
          interest_rate?: number | null
          name?: string
          remaining_installments?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          created_at: string
          current_cents: number
          deadline: string | null
          id: string
          name: string
          target_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_cents?: number
          deadline?: string | null
          id?: string
          name: string
          target_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_cents?: number
          deadline?: string | null
          id?: string
          name?: string
          target_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goal_contributions: {
        Row: {
          amount_cents: number
          created_at: string
          goal_id: string
          id: string
          occurred_on: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          goal_id: string
          id?: string
          occurred_on?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          goal_id?: string
          id?: string
          occurred_on?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "financial_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_assets: {
        Row: {
          asset_class: string
          created_at: string
          current_cents: number
          id: string
          invested_cents: number
          name: string
          notes: string | null
          updated_at: string
          user_id: string
          value_updated_on: string
        }
        Insert: {
          asset_class?: string
          created_at?: string
          current_cents?: number
          id?: string
          invested_cents?: number
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
          value_updated_on?: string
        }
        Update: {
          asset_class?: string
          created_at?: string
          current_cents?: number
          id?: string
          invested_cents?: number
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          value_updated_on?: string
        }
        Relationships: []
      }
      net_worth_assets: {
        Row: {
          created_at: string
          id: string
          kind: string
          name: string
          updated_at: string
          user_id: string
          value_cents: number
          value_updated_on: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          name: string
          updated_at?: string
          user_id: string
          value_cents?: number
          value_updated_on?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          name?: string
          updated_at?: string
          user_id?: string
          value_cents?: number
          value_updated_on?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          currency: string
          full_name: string | null
          id: string
          main_goal: string | null
          monthly_income_cents: number
          onboarding_done: boolean
          payday: number | null
          theme: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          full_name?: string | null
          id: string
          main_goal?: string | null
          monthly_income_cents?: number
          onboarding_done?: boolean
          payday?: number | null
          theme?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          full_name?: string | null
          id?: string
          main_goal?: string | null
          monthly_income_cents?: number
          onboarding_done?: boolean
          payday?: number | null
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          amount_cents: number
          created_at: string
          done: boolean
          due_on: string
          id: string
          kind: Database["public"]["Enums"]["category_kind"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          done?: boolean
          due_on: string
          id?: string
          kind?: Database["public"]["Enums"]["category_kind"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          done?: boolean
          due_on?: string
          id?: string
          kind?: Database["public"]["Enums"]["category_kind"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          account_id: string | null
          active: boolean
          amount_cents: number
          category_id: string | null
          created_at: string
          day_of_month: number
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          active?: boolean
          amount_cents?: number
          category_id?: string | null
          created_at?: string
          day_of_month?: number
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          active?: boolean
          amount_cents?: number
          category_id?: string | null
          created_at?: string
          day_of_month?: number
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount_cents: number
          category_id: string | null
          created_at: string
          credit_card_id: string | null
          currency: string
          description: string
          id: string
          installment_id: string | null
          installment_label: string | null
          notes: string | null
          occurred_on: string
          status: Database["public"]["Enums"]["tx_status"]
          transfer_group_id: string | null
          type: Database["public"]["Enums"]["tx_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount_cents: number
          category_id?: string | null
          created_at?: string
          credit_card_id?: string | null
          currency?: string
          description: string
          id?: string
          installment_id?: string | null
          installment_label?: string | null
          notes?: string | null
          occurred_on?: string
          status?: Database["public"]["Enums"]["tx_status"]
          transfer_group_id?: string | null
          type: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount_cents?: number
          category_id?: string | null
          created_at?: string
          credit_card_id?: string | null
          currency?: string
          description?: string
          id?: string
          installment_id?: string | null
          installment_label?: string | null
          notes?: string | null
          occurred_on?: string
          status?: Database["public"]["Enums"]["tx_status"]
          transfer_group_id?: string | null
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_account_transfer: {
        Args: { p_transfer_group_id: string }
        Returns: undefined
      }
      save_account_transfer: {
        Args: {
          p_amount_cents: number
          p_description: string
          p_from_account_id: string
          p_notes: string
          p_occurred_on: string
          p_to_account_id: string
          p_transfer_group_id: string | null
        }
        Returns: string
      }
    }
    Enums: {
      account_type:
        | "corrente"
        | "poupanca"
        | "carteira"
        | "investimento"
        | "outro"
      category_kind: "receita" | "despesa"
      tx_status: "pago" | "pendente" | "cancelado"
      tx_type: "receita" | "despesa" | "transferencia"
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
      account_type: [
        "corrente",
        "poupanca",
        "carteira",
        "investimento",
        "outro",
      ],
      category_kind: ["receita", "despesa"],
      tx_status: ["pago", "pendente", "cancelado"],
      tx_type: ["receita", "despesa", "transferencia"],
    },
  },
} as const
