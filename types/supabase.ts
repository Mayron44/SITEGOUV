export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      site_content: {
        Row: {
          id: number
          slug: string
          content: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          slug: string
          content: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          slug?: string
          content?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          username: string
          role: string
          password: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          role: string
          password: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          role?: string
          password?: string
          created_at?: string
          updated_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          discord_id: string
          name: string
          subscribed_at: string
        }
        Insert: {
          id?: string
          discord_id: string
          name: string
          subscribed_at?: string
        }
        Update: {
          id?: string
          discord_id?: string
          name?: string
          subscribed_at?: string
        }
      }
      newsletters: {
        Row: {
          id: string
          title: string
          content: string
          image: string | null
          created_at: string
          sent_at: string | null
          status: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          image?: string | null
          created_at?: string
          sent_at?: string | null
          status: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          image?: string | null
          created_at?: string
          sent_at?: string | null
          status?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          status: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          status: string
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          status?: string
          created_at?: string
          user_id?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          time: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          time: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          time?: string
          user_id?: string
          created_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          title: string
          url: string
          type: string
          order: number
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          url: string
          type: string
          order: number
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          url?: string
          type?: string
          order?: number
          created_at?: string
          user_id?: string
        }
      }
      discord_config: {
        Row: {
          id: number
          token: string
          enabled: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          token: string
          enabled: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          token?: string
          enabled?: boolean
          updated_at?: string
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
  }
}
