"use client"

import { useEffect, useState } from "react"
import { publicNavItems } from "@/lib/navigation"
import type { OrgMember, PageContent } from "@/components/page-content-provider"
import { Section } from "@/components/page-section"
import { PageButtons } from "@/components/page-buttons"
import { getPageContent } from "@/lib/content-service"

export default function OrganigrammePage() {
  const [pageContent, setPageContent] = useState<PageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const slug = "organigramme"

  useEffect(() => {
    async function loadPageContent() {
      try {
        // Find the navigation item that matches the current slug
        const navItem = publicNavItems.find((item) => item.href === `/${slug}`)

        if (!navItem) {
          setIsLoading(false)
          return
        }

        // Try to get content from Supabase
        const content = await getPageContent(slug)

        if (content) {
          console.log(`Page ${slug} loaded with content:`, content)
          setPageContent(content)
        } else {
          // Initialize with default content if not found
          setPageContent({
            title: navItem.title,
            content: "",
            images: [],
            sections: [],
            orgMembers: [],
            buttons: [],
          })
        }
      } catch (error) {
        console.error("Error loading page content:", error)
        // Initialize with default content on error
        const navItem = publicNavItems.find((item) => item.href === `/${slug}`)
        if (navItem) {
          setPageContent({
            title: navItem.title,
            content: "",
            images: [],
            sections: [],
            orgMembers: [],
            buttons: [],
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadPageContent()
  }, [])

  // Si nous sommes toujours en chargement, afficher un spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  // Si nous n'avons pas de contenu de page, ne rien afficher
  if (!pageContent) {
    return null
  }

  // Trouver le navItem correspondant pour l'icône
  const navItem = publicNavItems.find((item) => item.href === `/${slug}`)
  if (!navItem) return null

  // Vérifier s'il y a des sections ou du contenu ancien format
  const hasSections = pageContent.sections && pageContent.sections.length > 0
  const hasLegacyContent = pageContent.content && pageContent.content.trim() !== ""
  const hasOrgMembers = pageContent.orgMembers && pageContent.orgMembers.length > 0

  // Filtrer les boutons qui ne sont pas associés à une section
  const generalButtons = pageContent.buttons ? pageContent.buttons.filter((button) => !button.sectionId) : []

  // Trier les membres par niveau et ordre
  const sortedMembers = [...(pageContent.orgMembers || [])].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level
    return a.order - b.order
  })

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
        {hasSections && (
          <div className="space-y-12 mb-12">
            {pageContent.sections.map((section, index) => (
              <Section key={section.id} section={section} index={index} buttons={pageContent.buttons || []} />
            ))}
          </div>
        )}

        {/* Afficher l'ancien contenu si pas de sections mais contenu existant */}
        {!hasSections && hasLegacyContent && (
          <div className="prose max-w-none mb-12">
            <div className="whitespace-pre-wrap">{pageContent.content}</div>
          </div>
        )}

        {/* Afficher l'organigramme */}
        {hasOrgMembers ? (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-8 text-center">Notre équipe</h2>

            {/* Affichage hiérarchique des membres */}
            <div className="space-y-12">
              {/* Niveau 0 (top) */}
              {sortedMembers.filter((m) => m.level === 0).length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-6 text-center text-blue-900">Gouverneur</h3>
                  <div className="flex flex-wrap justify-center gap-8">
                    {sortedMembers
                      .filter((m) => m.level === 0)
                      .map((member) => (
                        <OrgMemberCard key={member.id} member={member} isLarge={true} />
                      ))}
                  </div>
                </div>
              )}

              {/* Niveaux inférieurs */}
              {[...Array(3)].map((_, i) => {
                const level = i + 1
                const membersAtLevel = sortedMembers.filter((m) => m.level === level)
                if (membersAtLevel.length === 0) return null

                return (
                  <div key={level}>
                    <h3 className="text-xl font-semibold mb-6 text-center text-blue-900">
                      {level === 1 ? "Vice-Gouverneur" : `Niveau ${level}`}
                    </h3>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {membersAtLevel.map((member) => (
                        <OrgMemberCard key={member.id} member={member} isLarge={false} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-amber-800">
            <h2 className="text-xl font-semibold mb-2">Organigramme en cours de construction</h2>
            <p>
              L'organigramme est actuellement en cours de développement. Le contenu sera bientôt disponible. Merci de
              votre compréhension.
            </p>
          </div>
        )}

        {/* Afficher les boutons non associés à une section s'ils existent */}
        {generalButtons.length > 0 && <PageButtons buttons={generalButtons} />}
      </div>
    </div>
  )
}

// Composant pour afficher un membre de l'organigramme
function OrgMemberCard({ member, isLarge }: { member: OrgMember; isLarge: boolean }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1 ${isLarge ? "max-w-xs" : ""}`}
    >
      <div className={`overflow-hidden ${isLarge ? "h-56" : "h-40"}`}>
        <img
          src={member.photo || "/placeholder.svg?height=200&width=200"}
          alt={member.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=200"
          }}
        />
      </div>
      <div className="p-4 text-center">
        <h3 className={`${isLarge ? "text-xl" : "text-lg"} font-bold mb-1`}>{member.name}</h3>
        <p className="text-blue-900">{member.position}</p>
      </div>
    </div>
  )
}
