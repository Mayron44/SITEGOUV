import { supabase } from "./supabase"
import type { PageContent } from "@/components/page-content-provider"

// Fonction pour récupérer tout le contenu du site
export async function getAllSiteContent(): Promise<Record<string, PageContent>> {
  try {
    const { data, error } = await supabase.from("site_content").select("slug, content")

    if (error) {
      console.error("Erreur lors de la récupération du contenu:", error)
      return {}
    }

    const siteContent: Record<string, PageContent> = {}
    data.forEach((item) => {
      siteContent[item.slug] = item.content as PageContent
    })

    return siteContent
  } catch (error) {
    console.error("Erreur lors de la récupération du contenu:", error)
    return {}
  }
}

// Fonction pour récupérer le contenu d'une page spécifique
export async function getPageContent(slug: string): Promise<PageContent | null> {
  try {
    const { data, error } = await supabase.from("site_content").select("content").eq("slug", slug).single()

    if (error) {
      console.error(`Erreur lors de la récupération du contenu pour ${slug}:`, error)
      return null
    }

    return data.content as PageContent
  } catch (error) {
    console.error(`Erreur lors de la récupération du contenu pour ${slug}:`, error)
    return null
  }
}

// Fonction pour sauvegarder le contenu d'une page
export async function savePageContent(slug: string, content: PageContent): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("site_content")
      .upsert({ slug, content, updated_at: new Date().toISOString() }, { onConflict: "slug" })

    if (error) {
      console.error(`Erreur lors de la sauvegarde du contenu pour ${slug}:`, error)
      return false
    }

    return true
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde du contenu pour ${slug}:`, error)
    return false
  }
}

// Fonction pour sauvegarder tout le contenu du site
export async function saveAllSiteContent(content: Record<string, PageContent>): Promise<boolean> {
  try {
    const promises = Object.entries(content).map(([slug, pageContent]) => {
      return supabase
        .from("site_content")
        .upsert({ slug, content: pageContent, updated_at: new Date().toISOString() }, { onConflict: "slug" })
    })

    const results = await Promise.all(promises)
    const hasError = results.some((result) => result.error)

    if (hasError) {
      console.error(
        "Erreurs lors de la sauvegarde du contenu:",
        results.filter((r) => r.error).map((r) => r.error),
      )
      return false
    }

    return true
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du contenu:", error)
    return false
  }
}
