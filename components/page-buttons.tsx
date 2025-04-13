"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
import type { PageButton } from "./page-content-provider"
import { Button } from "@/components/ui/button"

interface PageButtonsProps {
  buttons: PageButton[]
  showTitle?: boolean // Afficher le titre "Liens utiles" (par défaut: true)
}

export function PageButtons({ buttons, showTitle = true }: PageButtonsProps) {
  // Si pas de boutons, ne rien afficher
  if (!buttons || buttons.length === 0) {
    return null
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
    <div className="mt-4">
      {showTitle && <h3 className="text-xl font-bold mb-4">Liens utiles</h3>}
      <div className="flex flex-wrap gap-3">
        {buttons
          .sort((a, b) => a.order - b.order)
          .map((button) => {
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
  )
}
