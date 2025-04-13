"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, UserPlus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getNewsletterSubscribers, addNewsletterSubscriber, deleteNewsletterSubscriber } from "@/lib/newsletter-service"
import type { NewsletterSubscriber } from "@/components/page-content-provider"
import { supabase } from "@/lib/supabase"

export default function SubscribersPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [newSubscriberName, setNewSubscriberName] = useState("")
  const [newSubscriberDiscordId, setNewSubscriberDiscordId] = useState("")
  const [isAddingSubscriber, setIsAddingSubscriber] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in and load subscribers
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

          // Load subscribers from Supabase
          const subscriberData = await getNewsletterSubscribers()
          setSubscribers(subscriberData)
        } else {
          router.push("/intranet")
        }
      } catch (error) {
        console.error("Error loading subscribers:", error)
        setSubscribers([])
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

  const handleAddSubscriber = async () => {
    if (!newSubscriberName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom pour l'abonné.",
        variant: "destructive",
      })
      return
    }

    if (!newSubscriberDiscordId.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un ID Discord pour l'abonné.",
        variant: "destructive",
      })
      return
    }

    setIsAddingSubscriber(true)

    try {
      const newSubscriber = await addNewsletterSubscriber(newSubscriberName, newSubscriberDiscordId)

      if (newSubscriber) {
        setSubscribers([newSubscriber, ...subscribers])
        setNewSubscriberName("")
        setNewSubscriberDiscordId("")
        setIsDialogOpen(false)

        toast({
          title: "Abonné ajouté",
          description: "L'abonné a été ajouté avec succès.",
        })
      } else {
        throw new Error("Échec de l'ajout de l'abonné")
      }
    } catch (error) {
      console.error("Error adding subscriber:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de l'abonné.",
        variant: "destructive",
      })
    } finally {
      setIsAddingSubscriber(false)
    }
  }

  const handleDeleteSubscriber = async (subscriberId: string) => {
    try {
      const success = await deleteNewsletterSubscriber(subscriberId)

      if (success) {
        setSubscribers(subscribers.filter((subscriber) => subscriber.id !== subscriberId))

        toast({
          title: "Abonné supprimé",
          description: "L'abonné a été supprimé avec succès.",
        })
      } else {
        throw new Error("Échec de la suppression")
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'abonné.",
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

  // Filtrer les abonnés en fonction du terme de recherche
  const filteredSubscribers = subscribers.filter(
    (subscriber) =>
      subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.discordId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/intranet/newsletter")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion des abonnés</h1>
            <p className="text-gray-500">Gérez les abonnés à votre newsletter</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-900 hover:bg-blue-800">
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter un abonné
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel abonné</DialogTitle>
              <DialogDescription>
                Ajoutez un nouvel abonné à votre newsletter. L'ID Discord est nécessaire pour l'envoi des messages.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'abonné</Label>
                <Input
                  id="name"
                  placeholder="Nom de l'abonné"
                  value={newSubscriberName}
                  onChange={(e) => setNewSubscriberName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discordId">ID Discord</Label>
                <Input
                  id="discordId"
                  placeholder="123456789012345678"
                  value={newSubscriberDiscordId}
                  onChange={(e) => setNewSubscriberDiscordId(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  L'ID Discord est un nombre à 18 chiffres. Pour l'obtenir, activez le mode développeur dans Discord,
                  faites un clic droit sur l'utilisateur et sélectionnez "Copier l'ID".
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleAddSubscriber}
                className="bg-blue-900 hover:bg-blue-800"
                disabled={isAddingSubscriber}
              >
                {isAddingSubscriber ? "Ajout en cours..." : "Ajouter l'abonné"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Abonnés à la newsletter</CardTitle>
          <CardDescription>Liste des personnes abonnées à votre newsletter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher un abonné..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun abonné</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "Aucun abonné ne correspond à votre recherche."
                  : "Vous n'avez pas encore d'abonnés à votre newsletter."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-900 hover:bg-blue-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un abonné
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Nom</th>
                    <th className="border p-2 text-left">ID Discord</th>
                    <th className="border p-2 text-left">Date d'inscription</th>
                    <th className="border p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="border p-2 font-medium">{subscriber.name}</td>
                      <td className="border p-2 font-mono">{subscriber.discordId}</td>
                      <td className="border p-2">{formatDate(subscriber.subscribedAt)}</td>
                      <td className="border p-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8"
                          onClick={() => handleDeleteSubscriber(subscriber.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
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
        <Button variant="outline" onClick={() => router.push("/intranet/newsletter")}>
          Retour à la gestion des newsletters
        </Button>
      </div>
    </div>
  )
}
