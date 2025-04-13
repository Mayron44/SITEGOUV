"use client"

import { useEffect, useState } from "react"
import { useParams, notFound, useRouter } from "next/navigation"
import { publicNavItems } from "@/lib/navigation"
import type { PageContent } from "@/components/page-content-provider"
import { PageButtons } from "@/components/page-buttons"
import { Section } from "@/components/page-section"

// Liste des slugs qui ont leur propre page
const pagesWithDedicatedComponents = [
  "actualites",
  "organigramme",
  "economie",
  "affaires-etrangeres",
  "evenements",
  "justice",
]

export default function GenericPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [pageContent, setPageContent] = useState<PageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Prevent this catch-all route from handling /intranet
    if (slug === "intranet") {
      router.push("/intranet")
      return
    }

    // Prevent this catch-all route from handling pages with dedicated components
    if (pagesWithDedicatedComponents.includes(slug)) {
      return
    }

    // Find the navigation item that matches the current slug
    const navItem = publicNavItems.find((item) => item.href === `/${slug}`)

    // If no matching navigation item is found, return 404
    if (!navItem) {
      notFound()
      return
    }

    // Try to get content from localStorage
    try {
      const siteContent = JSON.parse(localStorage.getItem("siteContent") || "{}")
      if (siteContent[slug]) {
        console.log(`Page ${slug} loaded with content:`, siteContent[slug])
        console.log(`Buttons:`, siteContent[slug].buttons || [])
        setPageContent(siteContent[slug])
      } else {
        setPageContent({
          title: navItem.title,
          content: "",
          images: [],
          sections: [],
          buttons: [],
        })
      }
    } catch (error) {
      console.error("Error parsing site content:", error)
      setPageContent({
        title: navItem.title,
        content: "",
        images: [],
        sections: [],
        buttons: [],
      })
    } finally {
      setIsLoading(false)
    }
  }, [slug, router])

  // Si nous sommes toujours en chargement, afficher un spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  // Si nous n'avons pas de contenu de page ou de navItem, ne rien afficher
  if (!pageContent) {
    return null
  }

  // Trouver le navItem correspondant pour l'icône
  const navItem = publicNavItems.find((item) => item.href === `/${slug}`)
  if (!navItem) return null

  // Vérifier s'il y a des sections ou du contenu ancien format
  const hasSections = pageContent.sections && pageContent.sections.length > 0
  const hasLegacyContent = pageContent.content && pageContent.content.trim() !== ""

  // Filtrer les boutons qui ne sont pas associés à une section
  const generalButtons = pageContent.buttons ? pageContent.buttons.filter((button) => !button.sectionId) : []

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-900">
            <navItem.icon className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold">{pageContent.title}</h1>
        </div>

        {/* Afficher les sections si elles existent */}
        {hasSections ? (
          <div className="space-y-12">
            {pageContent.sections.map((section, index) => (
              <Section key={section.id} section={section} index={index} buttons={pageContent.buttons || []} />
            ))}
          </div>
        ) : hasLegacyContent ? (
          // Afficher l'ancien contenu si pas de sections mais contenu existant
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{pageContent.content}</div>
          </div>
        ) : (
          // Message par défaut
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-amber-800">
            <h2 className="text-xl font-semibold mb-2">Page en cours de construction</h2>
            <p>
              Cette page est actuellement en cours de développement. Le contenu sera bientôt disponible. Merci de votre
              compréhension.
            </p>
          </div>
        )}

        {/* Afficher les boutons non associés à une section s'ils existent */}
        {generalButtons.length > 0 && <PageButtons buttons={generalButtons} />}

        {/* Afficher la galerie d'images si elle existe (ancien format) */}
        {pageContent?.images && pageContent.images.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Galerie</h2>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {pageContent.images.map((image, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-md">
                  <img
                    src={image || "/placeholder.svg?height=300&width=400"}
                    alt={`Image ${index + 1}`}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=400"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
