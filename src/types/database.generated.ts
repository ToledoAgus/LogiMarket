export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          logo_path: string | null
          name: string
          organization_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_path?: string | null
          name: string
          organization_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_path?: string | null
          name?: string
          organization_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          organization_id: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_organization_id_parent_id_fkey"
            columns: ["organization_id", "parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          business_name: string
          created_at: string
          email: string | null
          id: string
          organization_id: string
          owner_name: string
          phone: string
          profile_id: string | null
          status: Database["public"]["Enums"]["customer_status"]
          updated_at: string
          zone: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          created_at?: string
          email?: string | null
          id?: string
          organization_id: string
          owner_name: string
          phone: string
          profile_id?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          updated_at?: string
          zone?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          created_at?: string
          email?: string | null
          id?: string
          organization_id?: string
          owner_name?: string
          phone?: string
          profile_id?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          updated_at?: string
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          available_quantity: number | null
          created_at: string
          id: string
          low_stock_threshold: number
          organization_id: string
          product_id: string
          quantity: number
          reserved_quantity: number
          status: Database["public"]["Enums"]["stock_status"] | null
          updated_at: string
        }
        Insert: {
          available_quantity?: number | null
          created_at?: string
          id?: string
          low_stock_threshold?: number
          organization_id: string
          product_id: string
          quantity?: number
          reserved_quantity?: number
          status?: Database["public"]["Enums"]["stock_status"] | null
          updated_at?: string
        }
        Update: {
          available_quantity?: number | null
          created_at?: string
          id?: string
          low_stock_threshold?: number
          organization_id?: string
          product_id?: string
          quantity?: number
          reserved_quantity?: number
          status?: Database["public"]["Enums"]["stock_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_organization_id_product_id_fkey"
            columns: ["organization_id", "product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "inventory_organization_id_product_id_fkey"
            columns: ["organization_id", "product_id"]
            isOneToOne: true
            referencedRelation: "public_catalog_products"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: Database["public"]["Enums"]["inventory_movement_kind"]
          organization_id: string
          product_id: string
          quantity_delta: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind: Database["public"]["Enums"]["inventory_movement_kind"]
          organization_id: string
          product_id: string
          quantity_delta: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["inventory_movement_kind"]
          organization_id?: string
          product_id?: string
          quantity_delta?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_organization_id_product_id_fkey"
            columns: ["organization_id", "product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "inventory_movements_organization_id_product_id_fkey"
            columns: ["organization_id", "product_id"]
            isOneToOne: false
            referencedRelation: "public_catalog_products"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          organization_id: string
          price_kind: Database["public"]["Enums"]["price_kind"]
          product_code: string
          product_id: string
          product_name: string
          quantity: number
          subtotal_cents: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          organization_id: string
          price_kind: Database["public"]["Enums"]["price_kind"]
          product_code: string
          product_id: string
          product_name: string
          quantity: number
          subtotal_cents: number
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          organization_id?: string
          price_kind?: Database["public"]["Enums"]["price_kind"]
          product_code?: string
          product_id?: string
          product_name?: string
          quantity?: number
          subtotal_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_organization_id_order_id_fkey"
            columns: ["organization_id", "order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "order_items_organization_id_product_id_fkey"
            columns: ["organization_id", "product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "order_items_organization_id_product_id_fkey"
            columns: ["organization_id", "product_id"]
            isOneToOne: false
            referencedRelation: "public_catalog_products"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          comment: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["order_status"]
          order_id: string
          organization_id: string
          previous_status: Database["public"]["Enums"]["order_status"] | null
        }
        Insert: {
          changed_by?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["order_status"]
          order_id: string
          organization_id: string
          previous_status?: Database["public"]["Enums"]["order_status"] | null
        }
        Update: {
          changed_by?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["order_status"]
          order_id?: string
          organization_id?: string
          previous_status?: Database["public"]["Enums"]["order_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_organization_id_order_id_fkey"
            columns: ["organization_id", "order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      orders: {
        Row: {
          business_name: string
          created_at: string
          currency_code: string
          customer_first_name: string
          customer_id: string
          customer_last_name: string
          delivery_address: string
          discount_cents: number
          email: string | null
          id: string
          notes: string | null
          order_number: string
          organization_id: string
          phone: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          business_name: string
          created_at?: string
          currency_code?: string
          customer_first_name: string
          customer_id: string
          customer_last_name: string
          delivery_address: string
          discount_cents?: number
          email?: string | null
          id?: string
          notes?: string | null
          order_number: string
          organization_id: string
          phone: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Update: {
          business_name?: string
          created_at?: string
          currency_code?: string
          customer_first_name?: string
          customer_id?: string
          customer_last_name?: string
          delivery_address?: string
          discount_cents?: number
          email?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          organization_id?: string
          phone?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_organization_id_customer_id_fkey"
            columns: ["organization_id", "customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          currency_code: string
          id: string
          is_active: boolean
          legal_name: string | null
          name: string
          slug: string
          timezone: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          currency_code?: string
          id?: string
          is_active?: boolean
          legal_name?: string | null
          name: string
          slug: string
          timezone?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          currency_code?: string
          id?: string
          is_active?: boolean
          legal_name?: string | null
          name?: string
          slug?: string
          timezone?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      price_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          new_amount_cents: number
          organization_id: string
          previous_amount_cents: number | null
          product_price_id: string
          reason: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_amount_cents: number
          organization_id: string
          previous_amount_cents?: number | null
          product_price_id: string
          reason?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_amount_cents?: number
          organization_id?: string
          previous_amount_cents?: number | null
          product_price_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_organization_id_product_price_id_fkey"
            columns: ["organization_id", "product_price_id"]
            isOneToOne: false
            referencedRelation: "product_prices"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      price_lists: {
        Row: {
          created_at: string
          currency_code: string
          id: string
          is_active: boolean
          name: string
          organization_id: string
          priority: number
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          currency_code?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          priority?: number
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          currency_code?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          priority?: number
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_lists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          is_active: boolean
          is_primary: boolean
          organization_id: string
          product_id: string
          sort_order: number
          storage_path: string
          updated_at: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          organization_id: string
          product_id: string
          sort_order?: number
          storage_path: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          organization_id?: string
          product_id?: string
          sort_order?: number
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_organization_id_product_id_fkey"
            columns: ["organization_id", "product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "product_images_organization_id_product_id_fkey"
            columns: ["organization_id", "product_id"]
            isOneToOne: false
            referencedRelation: "public_catalog_products"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      product_prices: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["price_kind"]
          organization_id: string
          price_list_id: string
          product_id: string
          units_included: number
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["price_kind"]
          organization_id: string
          price_list_id: string
          product_id: string
          units_included?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["price_kind"]
          organization_id?: string
          price_list_id?: string
          product_id?: string
          units_included?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_organization_id_price_list_id_fkey"
            columns: ["organization_id", "price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "product_prices_organization_id_product_id_fkey"
            columns: ["organization_id", "product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "product_prices_organization_id_product_id_fkey"
            columns: ["organization_id", "product_id"]
            isOneToOne: false
            referencedRelation: "public_catalog_products"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          internal_code: string
          is_active: boolean
          is_featured: boolean
          minimum_quantity: number
          name: string
          organization_id: string
          requires_minimum_purchase: boolean
          sales_unit: string
          slug: string
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          internal_code: string
          is_active?: boolean
          is_featured?: boolean
          minimum_quantity?: number
          name: string
          organization_id: string
          requires_minimum_purchase?: boolean
          sales_unit?: string
          slug: string
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          internal_code?: string
          is_active?: boolean
          is_featured?: boolean
          minimum_quantity?: number
          name?: string
          organization_id?: string
          requires_minimum_purchase?: boolean
          sales_unit?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_brand_id_fkey"
            columns: ["organization_id", "brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "products_organization_id_category_id_fkey"
            columns: ["organization_id", "category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotion_products: {
        Row: {
          created_at: string
          organization_id: string
          product_id: string
          promotion_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          organization_id: string
          product_id: string
          promotion_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          organization_id?: string
          product_id?: string
          promotion_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotion_products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_products_organization_id_product_id_fkey"
            columns: ["organization_id", "product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "promotion_products_organization_id_product_id_fkey"
            columns: ["organization_id", "product_id"]
            isOneToOne: false
            referencedRelation: "public_catalog_products"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "promotion_products_organization_id_promotion_id_fkey"
            columns: ["organization_id", "promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string
          discount_percentage: number | null
          ends_at: string | null
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["promotion_kind"]
          label: string
          name: string
          organization_id: string
          priority: number
          rules: Json
          starts_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percentage?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["promotion_kind"]
          label?: string
          name: string
          organization_id: string
          priority?: number
          rules?: Json
          starts_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percentage?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["promotion_kind"]
          label?: string
          name?: string
          organization_id?: string
          priority?: number
          rules?: Json
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_catalog_products: {
        Row: {
          available_quantity: number | null
          brand_id: string | null
          brand_name: string | null
          category_id: string | null
          category_name: string | null
          created_at: string | null
          description: string | null
          id: string | null
          internal_code: string | null
          is_featured: boolean | null
          minimum_quantity: number | null
          name: string | null
          organization_id: string | null
          requires_minimum_purchase: boolean | null
          sales_unit: string | null
          slug: string | null
          stock_status: Database["public"]["Enums"]["stock_status"] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_brand_id_fkey"
            columns: ["organization_id", "brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "products_organization_id_category_id_fkey"
            columns: ["organization_id", "category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_current_user_role:
        | { Args: never; Returns: Database["public"]["Enums"]["member_role"] }
        | {
            Args: { target_organization_id: string }
            Returns: Database["public"]["Enums"]["member_role"]
          }
      has_role: {
        Args: {
          allowed_roles: Database["public"]["Enums"]["member_role"][]
          target_organization_id: string
        }
        Returns: boolean
      }
      is_active_member: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
    }
    Enums: {
      customer_status: "pending" | "active" | "inactive" | "blocked"
      inventory_movement_kind:
        | "initial"
        | "purchase"
        | "sale"
        | "reservation"
        | "release"
        | "adjustment"
      member_role: "customer" | "subadmin" | "admin"
      membership_status: "pending" | "active" | "suspended"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "dispatched"
        | "delivered"
        | "cancelled"
      price_kind: "unit" | "box" | "display" | "bulk"
      promotion_kind: "discount" | "combo" | "featured"
      stock_status: "available" | "low_stock" | "out_of_stock"
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
      customer_status: ["pending", "active", "inactive", "blocked"],
      inventory_movement_kind: [
        "initial",
        "purchase",
        "sale",
        "reservation",
        "release",
        "adjustment",
      ],
      member_role: ["customer", "subadmin", "admin"],
      membership_status: ["pending", "active", "suspended"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "dispatched",
        "delivered",
        "cancelled",
      ],
      price_kind: ["unit", "box", "display", "bulk"],
      promotion_kind: ["discount", "combo", "featured"],
      stock_status: ["available", "low_stock", "out_of_stock"],
    },
  },
} as const

