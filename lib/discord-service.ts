// Service pour l'envoi de messages Discord
import type { Newsletter, NewsletterSubscriber } from "@/components/page-content-provider"
import { getSupabaseClient } from "@/lib/supabase"
const supabase = getSupabaseClient()
// Configuration du bot Discord
interface DiscordConfig {
  token: string
  enabled: boolean
}

// Fonction pour formater le contenu avec le markdown simple
const formatContentForDiscord = (content: string): string => {
  // Discord utilise déjà le markdown, donc on peut simplement adapter notre format
  // ** pour le gras, * pour l'italique, __ pour le souligné
  return content
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**") // HTML vers Discord markdown
    .replace(/<em>(.*?)<\/em>/g, "*$1*")
    .replace(/<u>(.*?)<\/u>/g, "__$1__")
}

// Fonction pour envoyer un message privé à un utilisateur Discord
export async function sendDirectMessage(
  discordId: string,
  content: string,
  config: DiscordConfig,
): Promise<{ success: boolean; error?: string }> {
  if (!config.enabled) {
    console.log(`[SIMULATION] Envoi d'un message à ${discordId}: ${content.substring(0, 50)}...`)
    return { success: true }
  }

  try {
    // Utiliser notre API Route pour envoyer le message
    const response = await fetch("/api/discord/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        discordId,
        content,
        token: config.token,
      }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Erreur lors de l'envoi du message Discord")
    }

    return { success: true }
  } catch (error) {
    console.error("Erreur lors de l'envoi du message Discord:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" }
  }
}

// Fonction pour envoyer une newsletter à tous les abonnés
export async function sendNewsletterToSubscribers(
  newsletter: Newsletter,
  subscribers: NewsletterSubscriber[],
  config: DiscordConfig,
): Promise<{ success: boolean; sent: number; failed: number; errors: Record<string, string> }> {
  const results = {
    success: true,
    sent: 0,
    failed: 0,
    errors: {} as Record<string, string>,
  }

  // Préparer le contenu de la newsletter pour Discord
  let messageContent = `**${newsletter.title}**\n\n`

  if (newsletter.image) {
    messageContent += `${newsletter.image}\n\n`
  }

  messageContent += formatContentForDiscord(newsletter.content)
  messageContent += `\n\n---\nGouvernement de San Andreas\nNewsletter officielle - Ne pas répondre à ce message\n\nPour vous désinscrire: https://bdg/newsletter/unsubscribe.vercel.app`

  // Envoyer à chaque abonné
  for (const subscriber of subscribers) {
    try {
      const result = await sendDirectMessage(subscriber.discordId, messageContent, config)

      if (result.success) {
        results.sent++
      } else {
        results.failed++
        results.errors[subscriber.discordId] = result.error || "Erreur inconnue"
      }

      // Ajouter un délai pour éviter de dépasser les limites de l'API Discord
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      results.failed++
      results.errors[subscriber.discordId] = error instanceof Error ? error.message : "Erreur inconnue"
    }
  }

  results.success = results.failed === 0
  return results
}

// Fonction pour obtenir la configuration Discord depuis Supabase
export async function getDiscordConfig(): Promise<DiscordConfig> {
  try {
    const { data, error } = await supabase
      .from("discord_config")
      .select("*")
      .order("id", { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    if (data) {
      return {
        token: data.token,
        enabled: data.enabled,
      }
    }
  } catch (error) {
    console.error("Error loading Discord config:", error)
  }

  // Configuration par défaut (simulation)
  return {
    token: "",
    enabled: false,
  }
}

// Fonction pour sauvegarder la configuration Discord dans Supabase
export async function saveDiscordConfig(config: DiscordConfig): Promise<boolean> {
  try {
    const { error } = await supabase.from("discord_config").upsert({
      token: config.token,
      enabled: config.enabled,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error saving Discord config:", error)
    return false
  }
}
