import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Récupérer les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Créer le client Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Fonction utilitaire pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && supabaseUrl.length > 0 && supabaseAnonKey.length > 0
}
