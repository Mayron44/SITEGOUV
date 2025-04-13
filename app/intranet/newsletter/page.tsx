"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Edit, Mail, Plus, Send, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Newsletter } from "@/components/page-content-provider"
import { getNewsletters, deleteNewsletter } from "@/lib/newsletter-service"
import { supabase } from "@/lib/supabase"

export default function NewsletterPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in and load newsletters
    const checkSessionAndLoadData = async () => {
      try {
        // Vérifier d'abord la session Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession()

        // Vérifier ensuite le localStorage comme solution de secours
        const userFromLocalStorage = localStorage.getItem("user")

        if (session || userFromLocalStorage) {
          setIsLoggedIn(true)

          // Load newsletters from Supabase
          const newsletterData = await getNewsletters()
          setNewsletters(newsletterData)
        } else {
          router.push("/intranet")
        }
      } catch (error) {
        console.error("Error loading newsletters:", error)
        setNewsletters([])
      } finally {
        setIsLoading(false)
      }
    }

    checkSessionAndLoadData()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  const handleDeleteNewsletter = async (newsletterId: string) => {
    try {
      const success = await deleteNewsletter(newsletterId)

      if (success) {
        setNewsletters(newsletters.filter((newsletter) => newsletter.id !== newsletterId))

        toast({
          title: "Newsletter supprimée",
          description: "La newsletter a été supprimée avec succès.",
        })
      } else {
        throw new Error("Échec de la suppression")
      }
    } catch (error) {
      console.error("Error deleting newsletter:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la newsletter.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des newsletters</h1>
          <p className="text-gray-500">Créez et envoyez des newsletters aux abonnés</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/intranet/newsletter/subscribers")}>
            <Mail className="h-4 w-4 mr-2" />
            Gérer les abonnés
          </Button>
          <Button onClick={() => router.push("/intranet/newsletter/create")} className="bg-blue-900 hover:bg-blue-800">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle newsletter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Newsletters</CardTitle>
          <CardDescription>Historique des newsletters créées</CardDescription>
        </CardHeader>
        <CardContent>
          {newsletters.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune newsletter</h3>
              <p className="text-gray-500 mb-4">Vous n'avez pas encore créé de newsletter.</p>
              <Button
                onClick={() => router.push("/intranet/newsletter/create")}
                className="bg-blue-900 hover:bg-blue-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer une newsletter
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Titre</th>
                    <th className="border p-2 text-left">Statut</th>
                    <th className="border p-2 text-left">Date de création</th>
                    <th className="border p-2 text-left">Date d'envoi</th>
                    <th className="border p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newsletters.map((newsletter) => (
                    <tr key={newsletter.id} className="hover:bg-gray-50">
                      <td className="border p-2 font-medium">{newsletter.title}</td>
                      <td className="border p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            newsletter.status === "sent" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {newsletter.status === "sent" ? "Envoyée" : "Brouillon"}
                        </span>
                      </td>
                      <td className="border p-2">{formatDate(newsletter.createdAt)}</td>
                      <td className="border p-2">
                        {newsletter.sentAt ? formatDate(newsletter.sentAt) : "Non envoyée"}
                      </td>
                      <td className="border p-2">
                        <div className="flex gap-2">
                          {newsletter.status === "draft" && (
                            <>
                              <Button
                                size="sm"
                                className="h-8 bg-blue-900 hover:bg-blue-800"
                                onClick={() => router.push(`/intranet/newsletter/edit/${newsletter.id}`)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Éditer
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 bg-green-600 hover:bg-green-700"
                                onClick={() => router.push(`/intranet/newsletter/send/${newsletter.id}`)}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Envoyer
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8"
                            onClick={() => handleDeleteNewsletter(newsletter.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <Button variant="outline" onClick={() => router.push("/intranet")}>
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  )
}
