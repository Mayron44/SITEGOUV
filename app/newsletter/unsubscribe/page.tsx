"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function UnsubscribePage() {
  const [discordId, setDiscordId] = useState("")
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

    try {
      // Vérifier si l'ID Discord existe
      const { data, error: checkError } = await supabase
        .from("newsletter_subscribers")
        .select("id")
        .eq("discord_id", discordId)
        .limit(1)

      if (checkError) throw checkError

      if (!data || data.length === 0) {
        setError("Cet ID Discord n'est pas inscrit à la newsletter.")
        setIsSubmitting(false)
        return
      }

      // Supprimer l'abonné
      const { error: deleteError } = await supabase.from("newsletter_subscribers").delete().eq("discord_id", discordId)

      if (deleteError) throw deleteError

      // Afficher le message de succès
      setIsSuccess(true)
      setDiscordId("")
    } catch (error) {
      console.error("Error unsubscribing from newsletter:", error)
      setError("Une erreur est survenue lors de la désinscription. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">Désinscription</h1>
        <p className="text-gray-500 mb-8 text-center">Désinscrivez-vous de notre newsletter gouvernementale.</p>

        <Card>
          <CardHeader>
            <CardTitle>Désinscription de la newsletter</CardTitle>
            <CardDescription>Entrez votre ID Discord pour vous désinscrire de notre newsletter.</CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Désinscription réussie !</h3>
                <p className="text-gray-500 mb-4">
                  Vous avez été désinscrit de notre newsletter. Vous ne recevrez plus nos communications.
                </p>
                <Button onClick={() => router.push("/")} className="mt-2">
                  Retour à l'accueil
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm bg-red-50 text-red-600 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="discordId">ID Discord</Label>
                  <Input
                    id="discordId"
                    placeholder="Votre ID Discord"
                    value={discordId}
                    onChange={(e) => setDiscordId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Entrez l'ID Discord que vous avez utilisé lors de votre inscription.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => router.push("/newsletter")} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-900 hover:bg-blue-800" disabled={isSubmitting}>
                    {isSubmitting ? "Traitement en cours..." : "Se désinscrire"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
