"use client"

import { useEffect, useState } from "react"
import { publicNavItems } from "@/lib/navigation"
import type { PageContent } from "@/components/page-content-provider"
import { Section } from "@/components/page-section"
import { PageButtons } from "@/components/page-buttons"
import { getPageContent } from "@/lib/content-service"

export default function EconomiePage() {
  const [pageContent, setPageContent] = useState<PageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const slug = "economie"

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
            economicData: [],
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
            economicData: [],
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
  const hasEconomicData = pageContent.economicData && pageContent.economicData.length > 0

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

        {/* Afficher les données économiques */}
        {hasEconomicData ? (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-8 text-center">Données économiques</h2>

            {/* Graphique des données économiques */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-xl font-bold mb-4">Revenus et dépenses</h3>
              <div className="h-80 relative">
                {(pageContent.economicData ?? []).map((data, index) => {
                  const maxValue = Math.max(...pageContent.economicData!.map((d) => Math.max(d.revenues, d.expenses)))
                  const revenueHeight = (data.revenues / maxValue) * 100
                  const expenseHeight = (data.expenses / maxValue) * 100
                  const barWidth = 100 / (pageContent.economicData!.length * 3) // 3 = 1 revenue bar + 1 expense bar + 1 space

                  return (
                    <div
                      key={data.id}
                      className="absolute bottom-0 flex items-end"
                      style={{
                        left: `${index * barWidth * 3}%`,
                        width: `${barWidth * 2}%`,
                        height: "100%",
                      }}
                    >
                      <div
                        className="bg-green-500 rounded-t-sm mx-1"
                        style={{
                          height: `${revenueHeight}%`,
                          width: "45%",
                        }}
                        title={`Revenus: ${data.revenues}`}
                      ></div>
                      <div
                        className="bg-red-500 rounded-t-sm mx-1"
                        style={{
                          height: `${expenseHeight}%`,
                          width: "45%",
                        }}
                        title={`Dépenses: ${data.expenses}`}
                      ></div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-4">
                {(pageContent.economicData ?? []).map((data) => (
                  <div
                    key={data.id}
                    className="text-xs text-center"
                    style={{ width: `${100 / pageContent.economicData!.length}%` }}
                  >
                    {data.week}
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-6 gap-8">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
                  <span>Revenus</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-sm mr-2"></div>
                  <span>Dépenses</span>
                </div>
              </div>
            </div>

            {/* Tableau des données économiques */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="border border-blue-800 p-2 text-left">Semaine</th>
                    <th className="border border-blue-800 p-2 text-left">Revenus ($)</th>
                    <th className="border border-blue-800 p-2 text-left">Dépenses ($)</th>
                    <th className="border border-blue-800 p-2 text-left">Solde ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {(pageContent.economicData ?? []).map((data) => (
                    <tr key={data.id} className="hover:bg-gray-50">
                      <td className="border p-2">{data.week}</td>
                      <td className="border p-2 text-green-600 font-medium">{data.revenues}</td>
                      <td className="border p-2 text-red-600 font-medium">{data.expenses}</td>
                      <td
                        className={`border p-2 font-bold ${data.revenues - data.expenses >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {data.revenues - data.expenses}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-amber-800">
            <h2 className="text-xl font-semibold mb-2">Données économiques en cours de construction</h2>
            <p>
              Les données économiques sont actuellement en cours de développement. Le contenu sera bientôt disponible.
              Merci de votre compréhension.
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
