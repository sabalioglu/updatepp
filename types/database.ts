export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          prep_time: number | null
          cook_time: number | null
          servings: number | null
          image: string | null
          tags: string[] | null
          favorite: boolean | null
          difficulty: string | null
          cuisine: string | null
          dietary_tags: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          image?: string | null
          tags?: string[] | null
          favorite?: boolean | null
          difficulty?: string | null
          cuisine?: string | null
          dietary_tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          image?: string | null
          tags?: string[] | null
          favorite?: boolean | null
          difficulty?: string | null
          cuisine?: string | null
          dietary_tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          name: string
          quantity: number | null
          unit: string | null
          optional: boolean | null
          order_index: number | null
        }
        Insert: {
          id?: string
          recipe_id: string
          name: string
          quantity?: number | null
          unit?: string | null
          optional?: boolean | null
          order_index?: number | null
        }
        Update: {
          id?: string
          recipe_id?: string
          name?: string
          quantity?: number | null
          unit?: string | null
          optional?: boolean | null
          order_index?: number | null
        }
      }
      recipe_instructions: {
        Row: {
          id: string
          recipe_id: string
          instruction: string
          order_index: number | null
        }
        Insert: {
          id?: string
          recipe_id: string
          instruction: string
          order_index?: number | null
        }
        Update: {
          id?: string
          recipe_id?: string
          instruction?: string
          order_index?: number | null
        }
      }
      recipe_nutrition: {
        Row: {
          id: string
          recipe_id: string
          calories: number | null
          protein: number | null
          carbs: number | null
          fat: number | null
          fiber: number | null
          sugar: number | null
          sodium: number | null
        }
        Insert: {
          id?: string
          recipe_id: string
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
          fiber?: number | null
          sugar?: number | null
          sodium?: number | null
        }
        Update: {
          id?: string
          recipe_id?: string
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
          fiber?: number | null
          sugar?: number | null
          sodium?: number | null
        }
      }
      pantry_items: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string | null
          quantity: number | null
          unit: string | null
          purchase_date: string | null
          expiry_date: string | null
          notes: string | null
          image: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string | null
          quantity?: number | null
          unit?: string | null
          purchase_date?: string | null
          expiry_date?: string | null
          notes?: string | null
          image?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string | null
          quantity?: number | null
          unit?: string | null
          purchase_date?: string | null
          expiry_date?: string | null
          notes?: string | null
          image?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          date: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      meals: {
        Row: {
          id: string
          meal_plan_id: string
          type: string
          recipe_id: string | null
          recipe_name: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          meal_plan_id: string
          type: string
          recipe_id?: string | null
          recipe_name: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          meal_plan_id?: string
          type?: string
          recipe_id?: string | null
          recipe_name?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          avatar: string | null
          dietary_preferences: string[] | null
          allergies: string[] | null
          intolerances: string[] | null
          dietary_restrictions: string[] | null
          cuisine_preferences: string[] | null
          cooking_skill_level: string | null
          preferred_meal_types: string[] | null
          weekly_meal_frequency: number | null
          serving_size_preference: number | null
          disliked_ingredients: string[] | null
          health_goals: string[] | null
          activity_level: string | null
          height: number | null
          weight: number | null
          target_weight: number | null
          age: number | null
          gender: string | null
          health_conditions: string[] | null
          daily_caloric_needs: number | null
          onboarding_completed: boolean | null
          privacy_settings: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          avatar?: string | null
          dietary_preferences?: string[] | null
          allergies?: string[] | null
          intolerances?: string[] | null
          dietary_restrictions?: string[] | null
          cuisine_preferences?: string[] | null
          cooking_skill_level?: string | null
          preferred_meal_types?: string[] | null
          weekly_meal_frequency?: number | null
          serving_size_preference?: number | null
          disliked_ingredients?: string[] | null
          health_goals?: string[] | null
          activity_level?: string | null
          height?: number | null
          weight?: number | null
          target_weight?: number | null
          age?: number | null
          gender?: string | null
          health_conditions?: string[] | null
          daily_caloric_needs?: number | null
          onboarding_completed?: boolean | null
          privacy_settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          avatar?: string | null
          dietary_preferences?: string[] | null
          allergies?: string[] | null
          intolerances?: string[] | null
          dietary_restrictions?: string[] | null
          cuisine_preferences?: string[] | null
          cooking_skill_level?: string | null
          preferred_meal_types?: string[] | null
          weekly_meal_frequency?: number | null
          serving_size_preference?: number | null
          disliked_ingredients?: string[] | null
          health_goals?: string[] | null
          activity_level?: string | null
          height?: number | null
          weight?: number | null
          target_weight?: number | null
          age?: number | null
          gender?: string | null
          health_conditions?: string[] | null
          daily_caloric_needs?: number | null
          onboarding_completed?: boolean | null
          privacy_settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      shopping_list_items: {
        Row: {
          id: string
          user_id: string
          name: string
          quantity: number | null
          unit: string | null
          category: string
          checked: boolean | null
          source: string | null
          recipe_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          quantity?: number | null
          unit?: string | null
          category: string
          checked?: boolean | null
          source?: string | null
          recipe_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          quantity?: number | null
          unit?: string | null
          category?: string
          checked?: boolean | null
          source?: string | null
          recipe_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
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