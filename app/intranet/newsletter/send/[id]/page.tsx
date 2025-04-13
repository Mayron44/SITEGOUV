"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Check, Send, Users, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Newsletter, NewsletterSubscriber } from "@/components/page-content-provider"
import { sendNewsletterToSubscribers, getDiscordConfig } from "@/lib/discord-service"
import { getNewsletterById, markNewsletterAsSent, getNewsletterSubscribers } from "@/lib/newsletter-service"
import { supabase } from "@/lib/supabase"

export default function SendNewsletterPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [sendResults, setSendResults] = useState<{
    sent: number
    failed: number
    errors: Record<string, string>
  } | null>(null)

  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const newsletterId = params.id as string

  useEffect(() => {
    // Check if user is logged in and load data
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

          // Load newsletter from Supabase
          const foundNewsletter = await getNewsletterById(newsletterId)

          if (foundNewsletter) {
            if (foundNewsletter.status === "sent") {
              toast({
                title: "Newsletter déjà envoyée",
                description: "Cette newsletter a déjà été envoyée.",
                variant: "destructive",
              })
              router.push("/intranet/newsletter")
              return
            }
            setNewsletter(foundNewsletter)
          } else {
            toast({
              title: "Newsletter introuvable",
              description: "La newsletter que vous essayez d'envoyer n'existe pas.",
              variant: "destructive",
            })
            router.push("/intranet/newsletter")
            return
          }

          // Load subscribers
          const subscriberData = await getNewsletterSubscribers()
          setSubscribers(subscriberData)
        } else {
          router.push("/intranet")
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement des données.",
          variant: "destructive",
        })
        router.push("/intranet/newsletter")
      } finally {
        setIsLoading(false)
      }
    }

    checkSessionAndLoadData()
  }, [router, newsletterId, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (!isLoggedIn || !newsletter) {
    return null
  }

  const sendNewsletter = async () => {
    if (subscribers.length === 0) {
      toast({
        title: "Aucun abonné",
        description: "Il n'y a aucun abonné à qui envoyer la newsletter.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      // Obtenir la configuration Discord
      const discordConfig = await getDiscordConfig()

      if (!discordConfig.enabled || !discordConfig.token) {
        toast({
          title: "Configuration Discord manquante",
          description: "Veuillez configurer le bot Discord dans la section Admin avant d'envoyer des newsletters.",
          variant: "destructive",
        })
        setIsSending(false)
        return
      }

      // Envoyer la newsletter via Discord
      const results = await sendNewsletterToSubscribers(newsletter, subscribers, discordConfig)

      // Mettre à jour le statut de la newsletter
      console.log("Tentative de marquer la newsletter comme envoyée:", newsletterId)
      const success = await markNewsletterAsSent(newsletterId)

      if (!success) {
        console.error("Échec de la mise à jour du statut de la newsletter avec ID:", newsletterId)
        toast({
          title: "Avertissement",
          description: "La newsletter a été envoyée mais son statut n'a pas pu être mis à jour.",
          variant: "default",
        })
      }

      // Afficher les résultats
      setSendResults({
        sent: results.sent,
        failed: results.failed,
        errors: results.errors,
      })

      // Marquer comme envoyé
      setIsSent(true)

      // Notification
      if (results.success) {
        toast({
          title: "Newsletter envoyée",
          description: `La newsletter a été envoyée avec succès à ${results.sent} abonnés.`,
        })
      } else {
        toast({
          title: "Envoi partiel",
          description: `La newsletter a été envoyée à ${results.sent} abonnés, mais ${results.failed} envois ont échoué.`,
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error sending newsletter:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la newsletter.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
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

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/intranet/newsletter")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Envoyer la newsletter</h1>
            <p className="text-gray-500">Envoyez votre newsletter aux abonnés</p>
          </div>
        </div>
      </div>

      {isSent ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Newsletter envoyée !</h2>
            <p className="text-gray-500 mb-6">
              Votre newsletter a été envoyée à {sendResults?.sent || subscribers.length} abonnés.
              {sendResults?.failed ? (
                <span className="text-amber-600"> {sendResults.failed} envois ont échoué.</span>
              ) : null}
            </p>

            {sendResults?.failed ? (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-medium text-amber-800">Certains envois ont échoué</h3>
                </div>
                <p className="text-sm text-amber-700 mb-2">
                  Les messages n'ont pas pu être envoyés aux utilisateurs suivants:
                </p>
                <ul className="text-sm text-amber-700 list-disc pl-5 space-y-1">
                  {Object.entries(sendResults.errors).map(([discordId, error]) => (
                    <li key={discordId}>
                      <span className="font-mono">{discordId}</span>: {error}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Button onClick={() => router.push("/intranet/newsletter")} className="bg-blue-900 hover:bg-blue-800">
              Retour à la gestion des newsletters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu de la newsletter</CardTitle>
              <CardDescription>Voici comment votre newsletter apparaîtra aux abonnés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg overflow-hidden border p-6">
                <h2 className="text-xl font-bold mb-4 text-blue-900">{newsletter.title}</h2>
                {newsletter.image && (
                  <div className="mb-4">
                    <img
                      src={newsletter.image || "/placeholder.svg"}
                      alt="Image de la newsletter"
                      className="w-full rounded-lg"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=600"
                      }}
                    />
                  </div>
                )}
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatContent(newsletter.content) }}
                />
                <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
                  <p>Gouvernement de San Andreas</p>
                  <p>Newsletter officielle - Ne pas répondre à ce message</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Destinataires</CardTitle>
              <CardDescription>
                Cette newsletter sera envoyée à {subscribers.length} {subscribers.length > 1 ? "abonnés" : "abonné"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscribers.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun abonné</h3>
                  <p className="text-gray-500">
                    Il n'y a actuellement aucun abonné à la newsletter. Partagez le lien d'inscription pour commencer à
                    recevoir des abonnés.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Informations sur l'envoi</h3>
                    <p className="text-sm text-blue-700 mb-1">
                      La newsletter sera envoyée en message privé Discord à tous les abonnés.
                    </p>
                    <p className="text-sm text-blue-700 mb-1">
                      Assurez-vous que tous les abonnés ont bien activé la réception des messages privés de la part des
                      membres du serveur.
                    </p>
                    <p className="text-sm text-blue-700">
                      Un lien de désinscription sera automatiquement ajouté à la fin de chaque newsletter.
                    </p>
                  </div>

                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="p-2 text-left text-sm font-medium text-gray-500">Nom</th>
                          <th className="p-2 text-left text-sm font-medium text-gray-500">ID Discord</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {subscribers.map((subscriber) => (
                          <tr key={subscriber.id} className="hover:bg-gray-50">
                            <td className="p-2 text-sm">{subscriber.name}</td>
                            <td className="p-2 text-sm font-mono">{subscriber.discordId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button
                    onClick={sendNewsletter}
                    className="w-full bg-blue-900 hover:bg-blue-800"
                    disabled={isSending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSending ? "Envoi en cours..." : "Envoyer la newsletter"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
