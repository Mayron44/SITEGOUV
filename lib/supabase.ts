import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Client Supabase singleton
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  // Si le client n'a pas encore été initialisé
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Vérification si les variables d'environnement sont définies
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Erreur : Les variables d'environnement Supabase ne sont pas définies.")
      throw new Error("Supabase URL ou Anon Key non définis")
    }

    console.log("Initialisation de Supabase avec l'URL:", supabaseUrl)

    // Création du client Supabase
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}

// Vérification de la configuration de Supabase
export function isSupabaseConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
