"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Bold, Eye, ImageIcon, Italic, Save, Underline } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Newsletter } from "@/components/page-content-provider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getNewsletterById, updateNewsletter } from "@/lib/newsletter-service"
import { supabase } from "@/lib/supabase"

export default function EditNewsletterPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState("")
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [selectedText, setSelectedText] = useState<{
    start: number
    end: number
    text: string
  } | null>(null)

  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const newsletterId = params.id as string

  useEffect(() => {
    // Check if user is logged in and load newsletter
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
            setNewsletter(foundNewsletter)
            setTitle(foundNewsletter.title)
            setContent(foundNewsletter.content)
            setImage(foundNewsletter.image || "")
          } else {
            toast({
              title: "Newsletter introuvable",
              description: "La newsletter que vous essayez d'éditer n'existe pas.",
              variant: "destructive",
            })
            router.push("/intranet/newsletter")
          }
        } else {
          router.push("/intranet")
        }
      } catch (error) {
        console.error("Error loading newsletter:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement de la newsletter.",
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

  const saveNewsletter = async () => {
    if (!title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un titre pour la newsletter.",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un contenu pour la newsletter.",
        variant: "destructive",
      })
      return
    }

    try {
      const success = await updateNewsletter(newsletterId, title, content, image || undefined)

      if (success) {
        toast({
          title: "Newsletter mise à jour",
          description: "La newsletter a été mise à jour avec succès.",
        })

        // Rediriger vers la page de gestion des newsletters
        router.push("/intranet/newsletter")
      } else {
        throw new Error("Échec de la mise à jour de la newsletter")
      }
    } catch (error) {
      console.error("Error updating newsletter:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la newsletter.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour appliquer un formatage au texte sélectionné
  const applyFormatting = (format: "bold" | "italic" | "underline") => {
    if (!selectedText) return

    const { start, end, text } = selectedText
    const before = content.substring(0, start)
    const after = content.substring(end)
    let formattedText = text

    switch (format) {
      case "bold":
        formattedText = `**${text}**`
        break
      case "italic":
        formattedText = `*${text}*`
        break
      case "underline":
        formattedText = `__${text}__`
        break
    }

    const newContent = before + formattedText + after
    setContent(newContent)
    setSelectedText(null)
  }

  // Fonction pour gérer la sélection de texte
  const handleTextSelection = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    if (start !== end) {
      setSelectedText({
        start,
        end,
        text: textarea.value.substring(start, end),
      })
    } else {
      setSelectedText(null)
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
            <h1 className="text-3xl font-bold mb-2">Éditer la newsletter</h1>
            <p className="text-gray-500">Modifiez votre newsletter avant de l'envoyer</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? "Éditer" : "Prévisualiser"}
          </Button>
          <Button onClick={saveNewsletter} className="bg-blue-900 hover:bg-blue-800">
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>

      {isPreviewMode ? (
        <Card>
          <CardContent className="p-6">
            <div className="max-w-2xl mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-blue-900">{title || "Titre de la newsletter"}</h2>
                {image && (
                  <div className="mb-4">
                    <img
                      src={image || "/placeholder.svg"}
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
                  dangerouslySetInnerHTML={{
                    __html: formatContent(content) || "<p>Le contenu de la newsletter apparaîtra ici...</p>",
                  }}
                />
                <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
                  <p>Gouvernement de San Andreas</p>
                  <p>Newsletter officielle - Ne pas répondre à ce message</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la newsletter</Label>
                <Input
                  id="title"
                  placeholder="Titre de la newsletter"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image (URL - optionnelle)</Label>
                <Input
                  id="image"
                  placeholder="https://exemple.com/image.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
                {image && (
                  <div className="mt-2">
                    <img
                      src={image || "/placeholder.svg"}
                      alt="Aperçu de l'image"
                      className="max-h-40 rounded-md"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=600"
                        toast({
                          title: "Erreur d'image",
                          description: "L'URL de l'image semble invalide.",
                          variant: "destructive",
                        })
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Contenu de la newsletter</Label>
                  <div className="flex gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-2" disabled={!selectedText}>
                          <Bold className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2">
                        <p className="text-sm mb-2">
                          Sélectionnez du texte et cliquez sur ce bouton pour le mettre en gras.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => applyFormatting("bold")}
                          disabled={!selectedText}
                          className="w-full"
                        >
                          Mettre en gras
                        </Button>
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-2" disabled={!selectedText}>
                          <Italic className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2">
                        <p className="text-sm mb-2">
                          Sélectionnez du texte et cliquez sur ce bouton pour le mettre en italique.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => applyFormatting("italic")}
                          disabled={!selectedText}
                          className="w-full"
                        >
                          Mettre en italique
                        </Button>
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-2" disabled={!selectedText}>
                          <Underline className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2">
                        <p className="text-sm mb-2">
                          Sélectionnez du texte et cliquez sur ce bouton pour le souligner.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => applyFormatting("underline")}
                          disabled={!selectedText}
                          className="w-full"
                        >
                          Souligner
                        </Button>
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-2">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2">
                        <p className="text-sm mb-2">
                          Utilisez le champ "Image (URL)" ci-dessus pour ajouter une image à la newsletter.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <Textarea
                  id="content"
                  placeholder="Contenu de la newsletter..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onMouseUp={handleTextSelection}
                  rows={15}
                />
                <p className="text-xs text-gray-500">
                  Astuce: Sélectionnez du texte pour le mettre en forme (gras, italique, souligné).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
