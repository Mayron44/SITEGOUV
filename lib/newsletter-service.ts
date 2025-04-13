import { getSupabaseClient } from "./supabase"
import type { Newsletter, NewsletterSubscriber } from "@/components/page-content-provider"

// Fonction pour récupérer toutes les newsletters
export async function getNewsletters(): Promise<Newsletter[]> {
  try {
    const supabase = getSupabaseClient() // ✅ Création locale du client

    const { data, error } = await supabase.from("newsletters").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur lors de la récupération des newsletters:", error)
      return []
    }

    return (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      image: item.image || undefined,
      createdAt: new Date(item.created_at),
      sentAt: item.sent_at ? new Date(item.sent_at) : undefined,
      status: item.status,
    }))
  } catch (error) {
    console.error("Erreur lors de la récupération des newsletters:", error)
    return []
  }
}

// Fonction pour récupérer une newsletter par son ID
export async function getNewsletterById(id: string): Promise<Newsletter | null> {
  try {
    const supabase = getSupabaseClient() // ✅ Création locale du client

    const { data, error } = await supabase.from("newsletters").select("*").eq("id", id).single()

    if (error) {
      console.error("Erreur lors de la récupération de la newsletter:", error)
      return null
    }

    if (!data) return null

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      image: data.image || undefined,
      createdAt: new Date(data.created_at),
      sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
      status: data.status,
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la newsletter:", error)
    return null
  }
}

// Fonction pour créer une nouvelle newsletter
export async function createNewsletter(title: string, content: string, image?: string): Promise<Newsletter | null> {
  try {
    const supabase = getSupabaseClient() // ✅ Création locale du client

    const newNewsletter = {
      title,
      content,
      image: image || null,
      status: "draft",
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("newsletters").insert(newNewsletter).select().single()

    if (error) {
      console.error("Erreur lors de la création de la newsletter:", error)
      return null
    }

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      image: data.image || undefined,
      createdAt: new Date(data.created_at),
      status: data.status,
    }
  } catch (error) {
    console.error("Erreur lors de la création de la newsletter:", error)
    return null
  }
}

// Fonction pour mettre à jour une newsletter
export async function updateNewsletter(id: string, title: string, content: string, image?: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient() // ✅ Création locale du client

    const updates = {
      title,
      content,
      image: image || null,
      // Ne pas inclure updated_at car la colonne n'existe pas
    }

    const { error } = await supabase.from("newsletters").update(updates).eq("id", id)

    if (error) {
      console.error("Erreur lors de la mise à jour de la newsletter:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la newsletter:", error)
    return false
  }
}

// Fonction pour marquer une newsletter comme envoyée
export async function markNewsletterAsSent(id: string): Promise<boolean> {
  try {
    console.log("Tentative de mise à jour du statut de la newsletter:", id)

    // Ne pas inclure updated_at car la colonne n'existe pas
    const updates = {
      status: "sent",
      sent_at: new Date().toISOString(),
    }

    console.log("Données de mise à jour:", updates)

    // Vérifier d'abord si la newsletter existe
    const supabase = getSupabaseClient() // ✅ Création locale du client

    const { data: existingData, error: checkError } = await supabase
      .from("newsletters")
      .select("id")
      .eq("id", id)
      .single()

    if (checkError) {
      console.error("Erreur lors de la vérification de la newsletter:", checkError)
      return false
    }

    if (!existingData) {
      console.error("Newsletter introuvable avec l'ID:", id)
      return false
    }

    // Procéder à la mise à jour
    const { error } = await supabase.from("newsletters").update(updates).eq("id", id)

    if (error) {
      console.error("Erreur détaillée lors de la mise à jour:", JSON.stringify(error, null, 2))
      return false
    }

    console.log("Newsletter marquée comme envoyée avec succès:", id)
    return true
  } catch (error) {
    console.error("Exception lors de la mise à jour du statut de la newsletter:", error)
    return false
  }
}

// Fonction pour supprimer une newsletter
export async function deleteNewsletter(id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient() // ✅ Création locale du client

    const { error } = await supabase.from("newsletters").delete().eq("id", id)

    if (error) {
      console.error("Erreur lors de la suppression de la newsletter:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erreur lors de la suppression de la newsletter:", error)
    return false
  }
}

// Fonction pour récupérer tous les abonnés à la newsletter
export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const supabase = getSupabaseClient() // ✅ Création locale du client

    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false })

    if (error) {
      console.error("Erreur lors de la récupération des abonnés:", error)
      return []
    }

    return (data || []).map((item) => ({
      id: item.id,
      discordId: item.discord_id,
      name: item.name,
      subscribedAt: new Date(item.subscribed_at),
    }))
  } catch (error) {
    console.error("Erreur lors de la récupération des abonnés:", error)
    return []
  }
}

// Fonction pour ajouter un nouvel abonné
export async function addNewsletterSubscriber(name: string, discordId: string): Promise<NewsletterSubscriber | null> {
  try {
    const supabase = getSupabaseClient() // ✅ Création locale du client

    const newSubscriber = {
      name,
      discord_id: discordId,
      subscribed_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("newsletter_subscribers").insert(newSubscriber).select().single()

    if (error) {
      console.error("Erreur lors de l'ajout de l'abonné:", error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      discordId: data.discord_id,
      subscribedAt: new Date(data.subscribed_at),
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'abonné:", error)
    return null
  }
}

// Fonction pour supprimer un abonné
export async function deleteNewsletterSubscriber(id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient() // ✅ Création locale du client

    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id)

    if (error) {
      console.error("Erreur lors de la suppression de l'abonné:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erreur lors de la suppression de l'abonné:", error)
    return false
  }
}
