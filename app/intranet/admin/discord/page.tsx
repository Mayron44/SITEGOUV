"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getDiscordConfig, saveDiscordConfig } from "@/lib/discord-service"
import { supabase } from "@/lib/supabase"

export default function DiscordConfigPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState("")
  const [enabled, setEnabled] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in and load config
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

          // Load Discord config
          const config = await getDiscordConfig()
          setToken(config.token)
          setEnabled(config.enabled)
        } else {
          router.push("/intranet")
        }
      } catch (error) {
        console.error("Error loading Discord config:", error)
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

  const handleSaveConfig = async () => {
    setIsSaving(true)

    try {
      const success = await saveDiscordConfig({
        token,
        enabled,
      })

      if (success) {
        toast({
          title: "Configuration sauvegardée",
          description: "La configuration Discord a été sauvegardée avec succès.",
        })
      } else {
        throw new Error("Échec de la sauvegarde")
      }
    } catch (error) {
      console.error("Error saving Discord config:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde de la configuration.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/intranet/newsletter")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Configuration Discord</h1>
            <p className="text-gray-500">Configurez l'intégration Discord pour l'envoi des newsletters</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration du Bot Discord</CardTitle>
          <CardDescription>
            Configurez le bot Discord qui sera utilisé pour envoyer les newsletters aux abonnés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token">Token du Bot Discord</Label>
              <Input
                id="token"
                type="password"
                placeholder="Token du bot Discord"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Le token du bot Discord est nécessaire pour envoyer des messages privés aux abonnés. Vous pouvez créer
                un bot sur le{" "}
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Portail des développeurs Discord
                </a>
                .
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
              <Label htmlFor="enabled">Activer l'envoi de messages Discord</Label>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-medium text-amber-800 mb-2">Informations importantes</h3>
              <ul className="text-sm text-amber-700 list-disc pl-5 space-y-1">
                <li>
                  Le bot doit être ajouté à votre serveur Discord avec les permissions{" "}
                  <code className="bg-amber-100 px-1 rounded">bot</code> et{" "}
                  <code className="bg-amber-100 px-1 rounded">applications.commands</code>.
                </li>
                <li>
                  Le bot doit avoir la permission <code className="bg-amber-100 px-1 rounded">Send Messages</code> et{" "}
                  <code className="bg-amber-100 px-1 rounded">Create Instant Invite</code>.
                </li>
                <li>
                  Dans les paramètres du bot sur le portail développeur, activez l'option{" "}
                  <code className="bg-amber-100 px-1 rounded">MESSAGE CONTENT INTENT</code>.
                </li>
                <li>
                  Si l'option "Activer l'envoi de messages Discord" est désactivée, les messages seront simulés et
                  affichés uniquement dans la console.
                </li>
              </ul>
            </div>

            <Button onClick={handleSaveConfig} className="bg-blue-900 hover:bg-blue-800" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Sauvegarde en cours..." : "Sauvegarder la configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
