"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, HeartCrack, MapPin, PartyPopper, PiggyBank, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function FormulairesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user")
    if (user) {
      setIsLoggedIn(true)
    } else {
      router.push("/intranet")
    }
    setIsLoading(false)
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

  const handleFormSubmit = (formName: string) => {
    // In a real application, this would submit to a backend or Google Form
    toast({
      title: "Formulaire ouvert",
      description: `Le formulaire "${formName}" a été ouvert.`,
    })

    // Simulate opening a form
    window.open(`https://forms.example.com/${formName.toLowerCase().replace(/\s/g, "-")}`, "_blank")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Formulaires administratifs</h1>
      <p className="text-gray-500 mb-8">Accédez aux formulaires officiels du gouvernement</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FormCard
          title="Mariage"
          description="Formulaire de demande de mariage civil"
          icon={<Heart className="h-6 w-6" />}
          onClick={() => handleFormSubmit("Mariage")}
        />

        <FormCard
          title="Divorce"
          description="Procédure de dissolution de mariage"
          icon={<HeartCrack className="h-6 w-6" />}
          onClick={() => handleFormSubmit("Divorce")}
        />

        <FormCard
          title="Autorisation d'événement"
          description="Demande d'autorisation pour organiser un événement public"
          icon={<PartyPopper className="h-6 w-6" />}
          onClick={() => handleFormSubmit("Autorisation d'événement")}
        />

        <FormCard
          title="Blocage de route"
          description="Demande d'autorisation pour bloquer temporairement une voie publique"
          icon={<MapPin className="h-6 w-6" />}
          onClick={() => handleFormSubmit("Blocage de route")}
        />

        <FormCard
          title="Adoption"
          description="Procédure d'adoption d'un enfant"
          icon={<UserPlus className="h-6 w-6" />}
          onClick={() => handleFormSubmit("Adoption")}
        />

        <FormCard
          title="Exonération d'impôts"
          description="Demande d'exonération fiscale"
          icon={<PiggyBank className="h-6 w-6" />}
          onClick={() => handleFormSubmit("Exonération d'impôts")}
        />
      </div>

      <div className="mt-8">
        <Button variant="outline" onClick={() => router.push("/intranet")}>
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  )
}

function FormCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900">{icon}</div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm text-gray-500 mb-4">{description}</CardDescription>
        <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={onClick}>
          Ouvrir le formulaire
        </Button>
      </CardContent>
    </Card>
  )
}
