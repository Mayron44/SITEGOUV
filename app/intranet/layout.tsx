"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type React from "react"
import Link from "next/link"
import { LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser, logout } from "@/lib/auth-service"

export default function IntranetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const checkAuth = () => {
      try {
        const user = getCurrentUser()
        if (user) {
          setIsAuthenticated(true)
        } else if (pathname !== "/intranet") {
          // Rediriger vers la page de connexion seulement si on n'y est pas déjà
          router.push("/intranet")
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error)
        if (pathname !== "/intranet") {
          router.push("/intranet")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  const handleLogout = () => {
    logout()
    router.push("/intranet")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  // Si on est sur la page de connexion ou si l'utilisateur est authentifié, afficher le contenu
  if (pathname === "/intranet" || isAuthenticated) {
    return (
      <div className="intranet-layout">
        {isAuthenticated && pathname !== "/intranet" && (
          <nav className="bg-blue-900 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center">
                <Link href="/intranet/dashboard" className="text-xl font-bold">
                  Intranet
                </Link>
                <div className="hidden md:flex ml-6 space-x-4">
                  <Link href="/intranet/dashboard" className="hover:text-blue-200">
                    Tableau de bord
                  </Link>
                  <Link href="/intranet/edition" className="hover:text-blue-200">
                    Édition
                  </Link>
                  <Link href="/intranet/agenda" className="hover:text-blue-200">
                    Agenda
                  </Link>
                  <Link href="/intranet/todo" className="hover:text-blue-200">
                    Tâches
                  </Link>
                  <Link href="/intranet/ressources" className="hover:text-blue-200">
                    Ressources
                  </Link>
                  <Link href="/intranet/newsletter" className="hover:text-blue-200">
                    Newsletter
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" className="text-white hover:text-blue-200" onClick={handleLogout}>
                  <LogOut className="h-5 w-5 mr-2" />
                  Déconnexion
                </Button>
                <Button variant="ghost" className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
            </div>
            {isMenuOpen && (
              <div className="md:hidden container mx-auto mt-2 pb-2 space-y-2">
                <Link href="/intranet/dashboard" className="block hover:text-blue-200">
                  Tableau de bord
                </Link>
                <Link href="/intranet/edition" className="block hover:text-blue-200">
                  Édition
                </Link>
                <Link href="/intranet/agenda" className="block hover:text-blue-200">
                  Agenda
                </Link>
                <Link href="/intranet/todo" className="block hover:text-blue-200">
                  Tâches
                </Link>
                <Link href="/intranet/ressources" className="block hover:text-blue-200">
                  Ressources
                </Link>
                <Link href="/intranet/newsletter" className="block hover:text-blue-200">
                  Newsletter
                </Link>
              </div>
            )}
          </nav>
        )}
        {children}
      </div>
    )
  }

  // Sinon, ne rien afficher (la redirection sera effectuée par l'effet)
  return null
}
