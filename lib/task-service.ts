import { getSupabaseClient } from "@/lib/supabase"
import { getCurrentUser } from "./auth-service"
const supabase = getSupabaseClient()
export interface Task {
  id: string
  title: string
  status: "pending" | "completed"
  user_id: string
  created_at: string
}

// Fonction pour récupérer toutes les tâches de l'utilisateur
export async function getTasks(): Promise<Task[]> {
  try {
    const user = getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur lors de la récupération des tâches:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches:", error)
    return []
  }
}

// Fonction pour ajouter une tâche
export async function addTask(title: string): Promise<Task | null> {
  try {
    const user = getCurrentUser()
    if (!user) return null

    const task: Omit<Task, "id" | "created_at"> = {
      title,
      status: "pending",
      user_id: user.id,
    }

    const { data, error } = await supabase.from("tasks").insert(task).select().single()

    if (error) {
      console.error("Erreur lors de l'ajout de la tâche:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erreur lors de l'ajout de la tâche:", error)
    return null
  }
}

// Fonction pour mettre à jour le statut d'une tâche
export async function updateTaskStatus(taskId: string, status: "pending" | "completed"): Promise<boolean> {
  try {
    const user = getCurrentUser()
    if (!user) return false

    const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId).eq("user_id", user.id)

    if (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche:", error)
    return false
  }
}

// Fonction pour supprimer une tâche
export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const user = getCurrentUser()
    if (!user) return false

    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", user.id)

    if (error) {
      console.error("Erreur lors de la suppression de la tâche:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche:", error)
    return false
  }
}
