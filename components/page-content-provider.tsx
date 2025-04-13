"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getAllSiteContent, saveAllSiteContent } from "@/lib/content-service"
import { publicNavItems } from "@/lib/navigation"

// Types pour les boutons de page
export type PageButton = {
  id: string
  label: string
  url: string
  color: string
  sectionId?: string
  order: number
}

// Types pour les sections de page
export type PageSection = {
  id: string
  title: string
  content: string
  image?: string
  imagePosition: "left" | "right" | "none"
  imageSize: "small" | "medium" | "large"
}

// Types pour les membres de l'organigramme
export type OrgMember = {
  id: string
  name: string
  position: string
  photo?: string
  level: number
  order: number
  parentId?: string
}

// Types pour les données économiques
export type EconomicData = {
  id: string
  week: string
  revenues: number
  expenses: number
}

// Types pour les newsletters
export type Newsletter = {
  id: string
  title: string
  content: string
  image?: string
  createdAt: Date
  sentAt?: Date
  status: "draft" | "sent"
}

// Types pour les abonnés à la newsletter
export type NewsletterSubscriber = {
  id: string
  discordId: string
  name: string
  subscribedAt: Date
}

// Type pour le contenu d'une page
export type PageContent = {
  title: string
  content: string
  images: string[]
  sections: PageSection[]
  carouselImages?: string[]
  orgMembers?: OrgMember[]
  economicData?: EconomicData[]
  buttons: PageButton[]
}

// Contenu par défaut (utilisé uniquement si aucun contenu n'est trouvé dans Supabase)
const defaultContent: { [key: string]: PageContent } = {
  accueil: {
    title: "Gouvernement de San Andreas",
    content: "Au service des citoyens pour un avenir prospère et sécurisé",
    images: [],
    sections: [],
    buttons: [],
    carouselImages: [
      "/placeholder.svg?height=600&width=1200",
      "/placeholder.svg?height=600&width=1200",
      "/placeholder.svg?height=600&width=1200",
    ],
  },
}

// Contexte pour le contenu du site
const PageContentContext = createContext<{
  siteContent: { [key: string]: PageContent }
  isLoading: boolean
  setSiteContent: React.Dispatch<React.SetStateAction<{ [key: string]: PageContent }>>
  saveContent: () => Promise<boolean>
}>({
  siteContent: defaultContent,
  isLoading: true,
  setSiteContent: () => {},
  saveContent: async () => false,
})

// Hook pour utiliser le contexte
export const usePageContent = () => useContext(PageContentContext)

// Fournisseur de contenu
export function PageContentProvider({ children }: { children: React.ReactNode }) {
  const [siteContent, setSiteContent] = useState<{ [key: string]: PageContent }>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Charger le contenu de Supabase au montage du composant
    const loadContent = async () => {
      try {
        const content = await getAllSiteContent()

        // Si aucun contenu n'est trouvé, utiliser le contenu par défaut
        if (Object.keys(content).length === 0) {
          // Initialiser le contenu par défaut pour chaque page
          const defaultSiteContent: Record<string, PageContent> = {}

          publicNavItems.forEach((item) => {
            const key = item.href.replace("/", "") || "accueil"
            defaultSiteContent[key] = {
              title: item.title,
              content: "",
              images: [],
              sections: [],
              buttons: [],
              carouselImages: key === "accueil" ? defaultContent.accueil.carouselImages : undefined,
              orgMembers: key === "organigramme" ? [] : undefined,
              economicData: key === "economie" ? [] : undefined,
            }
          })

          setSiteContent(defaultSiteContent)

          // Sauvegarder le contenu par défaut dans Supabase
          await saveAllSiteContent(defaultSiteContent)
        } else {
          // Vérifier que chaque page a les propriétés nécessaires
          const updatedContent = { ...content }

          publicNavItems.forEach((item) => {
            const key = item.href.replace("/", "") || "accueil"

            if (!updatedContent[key]) {
              updatedContent[key] = {
                title: item.title,
                content: "",
                images: [],
                sections: [],
                buttons: [],
                carouselImages: key === "accueil" ? defaultContent.accueil.carouselImages : undefined,
                orgMembers: key === "organigramme" ? [] : undefined,
                economicData: key === "economie" ? [] : undefined,
              }
            } else {
              // Assurer que chaque page a un tableau de sections
              if (!updatedContent[key].sections) {
                updatedContent[key].sections = []
              }

              // Assurer que la page d'accueil a un tableau d'images pour le carrousel
              if (key === "accueil" && !updatedContent[key].carouselImages) {
                updatedContent[key].carouselImages = updatedContent[key].images || defaultContent.accueil.carouselImages
              }

              // Assurer que la page organigramme a un tableau de membres
              if (key === "organigramme" && !updatedContent[key].orgMembers) {
                updatedContent[key].orgMembers = []
              }

              // Assurer que la page économie a un tableau de données économiques
              if (key === "economie" && !updatedContent[key].economicData) {
                updatedContent[key].economicData = []
              }

              // Assurer que chaque page a un tableau de boutons
              if (!updatedContent[key].buttons) {
                updatedContent[key].buttons = []
              }
            }
          })

          setSiteContent(updatedContent)
        }
      } catch (error) {
        console.error("Erreur lors du chargement du contenu:", error)
        setSiteContent(defaultContent)
      } finally {
        setIsLoading(false)
      }
    }

    loadContent()
  }, [])

  // Fonction pour sauvegarder le contenu dans Supabase
  const saveContent = async (): Promise<boolean> => {
    try {
      const success = await saveAllSiteContent(siteContent)
      return success
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du contenu:", error)
      return false
    }
  }

  return (
    <PageContentContext.Provider value={{ siteContent, isLoading, setSiteContent, saveContent }}>
      {children}
    </PageContentContext.Provider>
  )
}
