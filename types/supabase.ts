export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'customer' | 'admin';
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin';
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin';
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          created_at: string;
          updated_at: string;
          category_id: string | null;
          inventory_count: number;
          is_featured: boolean;
          stripe_product_id: string | null;
          discount_percent: number;
          specifications: Json;
          material: string | null;
          country_of_origin: string | null;
          care_instructions: string | null;
          season: 'spring-summer' | 'fall-winter' | 'all-season' | null;
          collection_year: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
          category_id?: string | null;
          inventory_count?: number;
          is_featured?: boolean;
          stripe_product_id?: string | null;
          discount_percent?: number;
          specifications?: Json;
          material?: string | null;
          country_of_origin?: string | null;
          care_instructions?: string | null;
          season?: 'spring-summer' | 'fall-winter' | 'all-season' | null;
          collection_year?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
          category_id?: string | null;
          inventory_count?: number;
          is_featured?: boolean;
          stripe_product_id?: string | null;
          discount_percent?: number;
          specifications?: Json;
          material?: string | null;
          country_of_origin?: string | null;
          care_instructions?: string | null;
          season?: 'spring-summer' | 'fall-winter' | 'all-season' | null;
          collection_year?: number | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          parent_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          parent_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          parent_id?: string | null;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'processing' | 'completed' | 'cancelled';
          total: number;
          created_at: string;
          updated_at: string;
          shipping_address: Json | null;
          payment_intent_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: 'pending' | 'processing' | 'completed' | 'cancelled';
          total: number;
          created_at?: string;
          updated_at?: string;
          shipping_address?: Json | null;
          payment_intent_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: 'pending' | 'processing' | 'completed' | 'cancelled';
          total?: number;
          created_at?: string;
          updated_at?: string;
          shipping_address?: Json | null;
          payment_intent_id?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_addresses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          street: string;
          city: string;
          state: string;
          zip: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          street: string;
          city: string;
          state: string;
          zip: string;
          country: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          street?: string;
          city?: string;
          state?: string;
          zip?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_intents: {
        Row: {
          id: string;
          stripe_payment_intent_id: string;
          user_id: string;
          amount: number;
          currency: string;
          status: string;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          stripe_payment_intent_id: string;
          user_id: string;
          amount: number;
          currency: string;
          status: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          stripe_payment_intent_id?: string;
          user_id?: string;
          amount?: number;
          currency?: string;
          status?: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
