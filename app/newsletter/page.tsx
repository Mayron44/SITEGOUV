"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function NewsletterPage() {
  const [discordId, setDiscordId] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validation simple
    if (!discordId.trim()) {
      setError("Veuillez saisir votre ID Discord.")
      setIsSubmitting(false)
      return
    }

    if (!name.trim()) {
      setError("Veuillez saisir votre nom.")
      setIsSubmitting(false)
      return
    }

    try {
      // Vérifier si l'ID Discord existe déjà
      const { data: existingSubscribers, error: checkError } = await supabase
        .from("newsletter_subscribers")
        .select("id")
        .eq("discord_id", discordId)
        .limit(1)

      if (checkError) throw checkError

      if (existingSubscribers && existingSubscribers.length > 0) {
        setError("Cet ID Discord est déjà inscrit à la newsletter.")
        setIsSubmitting(false)
        return
      }

      // Ajouter le nouvel abonné
      const { error: insertError } = await supabase.from("newsletter_subscribers").insert({
        discord_id: discordId,
        name,
        subscribed_at: new Date().toISOString(),
      })

      if (insertError) throw insertError

      // Afficher le message de succès
      setIsSuccess(true)
      setDiscordId("")
      setName("")
    } catch (error) {
      console.error("Error subscribing to newsletter:", error)
      setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">Newsletter</h1>
        <p className="text-gray-500 mb-8 text-center">
          Inscrivez-vous à notre newsletter pour recevoir les dernières actualités du gouvernement.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Inscription à la newsletter</CardTitle>
            <CardDescription>
              Recevez directement sur Discord les dernières informations et actualités du gouvernement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Inscription réussie !</h3>
                <p className="text-gray-500 mb-4">
                  Vous êtes maintenant inscrit à notre newsletter. Vous recevrez nos prochaines communications
                  directement sur Discord.
                </p>
                <Button onClick={() => router.push("/")} className="mt-2">
                  Retour à l'accueil
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 text-sm bg-red-50 text-red-600 rounded-md">{error}</div>}

                <div className="space-y-2">
                  <Label htmlFor="discordId">ID Discord</Label>
                  <Input
                    id="discordId"
                    placeholder="Exemple: username#1234"
                    value={discordId}
                    onChange={(e) => setDiscordId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Votre ID Discord complet, incluant le nom d'utilisateur et le discriminant.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Votre nom</Label>
                  <Input
                    id="name"
                    placeholder="Votre nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800" disabled={isSubmitting}>
                  <Mail className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Inscription en cours..." : "S'inscrire à la newsletter"}
                </Button>
              </form>
            )}
            {!isSuccess && (
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Déjà inscrit et vous souhaitez vous désinscrire ?</p>
                <Button variant="link" onClick={() => router.push("/newsletter/unsubscribe")} className="p-0 h-auto">
                  Cliquez ici pour vous désinscrire
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
