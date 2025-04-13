import { getSupabaseClient } from "./supabase"
import { getCurrentUser } from "./auth-service"

export interface Event {
  id: string
  title: string
  description: string | null
  date: string
  time: string
  user_id: string
  created_at: string
}

// Fonction pour récupérer tous les événements
export async function getEvents(): Promise<Event[]> {
  try {
    const user = getCurrentUser()
    if (!user) return []

    const supabase = getSupabaseClient() // ✅ Création locale du client

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })

    if (error) {
      console.error("Erreur lors de la récupération des événements:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error)
    return []
  }
}

// Fonction pour ajouter un événement
export async function addEvent(
  title: string,
  description: string | null,
  date: string,
  time: string,
): Promise<Event | null> {
  try {
    const user = getCurrentUser()
    if (!user) return null

    const supabase = getSupabaseClient() // ✅ Création locale du client

    const event: Omit<Event, "id" | "created_at"> = {
      title,
      description,
      date,
      time,
      user_id: user.id,
    }

    const { data, error } = await supabase.from("events").insert(event).select().single()

    if (error) {
      console.error("Erreur lors de l'ajout de l'événement:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'événement:", error)
    return null
  }
}

// Fonction pour supprimer un événement
export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    const user = getCurrentUser()
    if (!user) return false

    const supabase = getSupabaseClient() // ✅ Création locale du client

    const { error } = await supabase.from("events").delete().eq("id", eventId)

    if (error) {
      console.error("Erreur lors de la suppression de l'événement:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error)
    return false
  }
}
