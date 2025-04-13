"use client"

import type { PageButton, PageSection } from "./page-content-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

interface SectionProps {
  section: PageSection
  index: number
  buttons?: PageButton[] // Tous les boutons de la page
}

export function Section({ section, index, buttons = [] }: SectionProps) {
  const hasImage = section.imagePosition !== "none" && section.image

  // Filtrer les boutons pour cette section spécifique
  const sectionButtons = buttons.filter((button) => button.sectionId === section.id)
  const hasButtons = sectionButtons && sectionButtons.length > 0

  // Déterminer la largeur de l'image en fonction de sa taille
  let imageWidthClass = "md:w-1/4"
  let contentWidthClass = "md:w-3/4"

  if (section.imageSize === "small") {
    imageWidthClass = "md:w-1/5"
    contentWidthClass = "md:w-4/5"
  } else if (section.imageSize === "medium") {
    imageWidthClass = "md:w-1/3"
    contentWidthClass = "md:w-2/3"
  } else if (section.imageSize === "large") {
    imageWidthClass = "md:w-1/2"
    contentWidthClass = "md:w-1/2"
  }

  // Fonction pour formater le contenu avec le markdown simple
  const formatContent = (content: string) => {
    // Remplacer les balises de formatage par des balises HTML
    const formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Gras
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italique
      .replace(/__(.*?)__/g, "<u>$1</u>") // Souligné

    return formattedContent
  }

  // Fonction pour obtenir la classe de couleur du bouton
  const getButtonClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-600 hover:bg-blue-700 text-white"
      case "amber":
        return "bg-amber-600 hover:bg-amber-700 text-white"
      case "green":
        return "bg-green-600 hover:bg-green-700 text-white"
      case "red":
        return "bg-red-600 hover:bg-red-700 text-white"
      case "gray":
        return "bg-gray-600 hover:bg-gray-700 text-white"
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white"
    }
  }

  return (
    <div className={`py-6 ${index > 0 ? "border-t border-gray-200" : ""}`} id={`section-${section.id}`}>
      <h2 className="text-2xl font-bold mb-4">{section.title}</h2>

      {hasImage ? (
        <div
          className={`flex flex-col ${section.imagePosition === "left" ? "md:flex-row" : "md:flex-row-reverse"} gap-6`}
        >
          <div className={`${imageWidthClass} ${section.imagePosition === "left" ? "md:pr-4" : "md:pl-4"}`}>
            <img
              src={section.image || "/placeholder.svg?height=300&width=400"}
              alt={section.title}
              className="w-full rounded-lg shadow-md object-cover"
              style={{ maxHeight: "300px" }}
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=400"
              }}
            />
          </div>
          <div className={contentWidthClass}>
            <div className="prose max-w-none">
              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formatContent(section.content) }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatContent(section.content) }} />
        </div>
      )}

      {/* Afficher les boutons associés à cette section */}
      {hasButtons && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-3">
            {sectionButtons.map((button) => {
              const isExternal = button.url.startsWith("http")

              if (isExternal) {
                return (
                  <a
                    key={button.id}
                    href={button.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium ${getButtonClass(button.color)}`}
                  >
                    {button.label}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )
              }

              return (
                <Button key={button.id} asChild className={getButtonClass(button.color)}>
                  <Link href={button.url}>{button.label}</Link>
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
