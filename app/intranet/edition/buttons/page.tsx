"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { PageButton, PageContent, PageSection } from "@/components/page-content-provider"

interface SiteContent {
  [key: string]: PageContent
}

export default function EditPageButtonsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [siteContent, setSiteContent] = useState<SiteContent>({})
  const [pageKey, setPageKey] = useState<string>("")
  const [pageTitle, setPageTitle] = useState<string>("")
  const [buttons, setButtons] = useState<PageButton[]>([])
  const [sections, setSections] = useState<PageSection[]>([])
  const [newButton, setNewButton] = useState<Omit<PageButton, "id" | "order">>({
    label: "",
    url: "",
    color: "blue",
    sectionId: undefined,
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user")
    if (user) {
      setIsLoggedIn(true)

      // Get page key from URL
      const page = searchParams.get("page")
      if (!page) {
        toast({
          title: "Erreur",
          description: "Page non spécifiée.",
          variant: "destructive",
        })
        router.push("/intranet/edition")
        return
      }

      setPageKey(page)

      // Load site content from localStorage
      const savedContent = localStorage.getItem("siteContent")
      if (savedContent) {
        try {
          const parsedContent = JSON.parse(savedContent)
          setSiteContent(parsedContent)

          if (parsedContent[page]) {
            setPageTitle(parsedContent[page].title)
            setButtons(parsedContent[page].buttons || [])
            setSections(parsedContent[page].sections || [])
          } else {
            toast({
              title: "Erreur",
              description: "Page introuvable.",
              variant: "destructive",
            })
            router.push("/intranet/edition")
          }
        } catch (error) {
          console.error("Error parsing site content:", error)
          toast({
            title: "Erreur",
            description: "Erreur lors du chargement du contenu.",
            variant: "destructive",
          })
          router.push("/intranet/edition")
        }
      }
    } else {
      router.push("/intranet")
    }
    setIsLoading(false)
  }, [router, searchParams, toast])

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

  const addButton = () => {
    if (newButton.label.trim() === "" || newButton.url.trim() === "") {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    const button: PageButton = {
      id: Date.now().toString(),
      ...newButton,
      order: buttons.length,
    }

    const updatedButtons = [...buttons, button]
    setButtons(updatedButtons)

    // Reset form
    setNewButton({
      label: "",
      url: "",
      color: "blue",
      sectionId: undefined,
    })

    toast({
      title: "Bouton ajouté",
      description: "Le bouton a été ajouté avec succès.",
    })
  }

  const updateButton = (buttonId: string, field: keyof PageButton, value: any) => {
    setButtons(buttons.map((button) => (button.id === buttonId ? { ...button, [field]: value } : button)))
  }

  const deleteButton = (buttonId: string) => {
    setButtons(buttons.filter((button) => button.id !== buttonId))

    toast({
      title: "Bouton supprimé",
      description: "Le bouton a été supprimé avec succès.",
    })
  }

  const moveButtonUp = (buttonId: string) => {
    const index = buttons.findIndex((button) => button.id === buttonId)
    if (index <= 0) return

    const newButtons = [...buttons]
    const temp = newButtons[index]
    newButtons[index] = newButtons[index - 1]
    newButtons[index - 1] = temp

    // Update order properties
    newButtons[index].order = index
    newButtons[index - 1].order = index - 1

    setButtons(newButtons)
  }

  const moveButtonDown = (buttonId: string) => {
    const index = buttons.findIndex((button) => button.id === buttonId)
    if (index === -1 || index >= buttons.length - 1) return

    const newButtons = [...buttons]
    const temp = newButtons[index]
    newButtons[index] = newButtons[index + 1]
    newButtons[index + 1] = temp

    // Update order properties
    newButtons[index].order = index
    newButtons[index + 1].order = index + 1

    setButtons(newButtons)
  }

  const saveButtons = () => {
    try {
      // Créer une copie profonde du contenu du site
      const updatedContent = JSON.parse(JSON.stringify(siteContent))

      // Mettre à jour les boutons pour la page actuelle
      updatedContent[pageKey] = {
        ...updatedContent[pageKey],
        buttons: buttons,
      }

      // Sauvegarder dans localStorage
      localStorage.setItem("siteContent", JSON.stringify(updatedContent))
      setSiteContent(updatedContent)

      // Afficher une notification de succès
      toast({
        title: "Boutons sauvegardés",
        description: "Les boutons ont été sauvegardés avec succès.",
      })

      // Afficher les détails des boutons sauvegardés
      const sectionButtons = buttons.filter((b) => b.sectionId)
      const generalButtons = buttons.filter((b) => !b.sectionId)

      console.log("Boutons sauvegardés:", buttons)
      console.log("Boutons de section:", sectionButtons)
      console.log("Boutons généraux:", generalButtons)

      alert(`Boutons sauvegardés avec succès!
      
Total: ${buttons.length} boutons
- Boutons de section: ${sectionButtons.length}
- Boutons généraux: ${generalButtons.length}

Détails des boutons de section:
${sectionButtons.map((b) => `- "${b.label}" pour section ID: ${b.sectionId}`).join("\n")}`)
    } catch (error) {
      console.error("Error saving buttons:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde des boutons.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour obtenir le nom de la section à partir de son ID
  const getSectionName = (sectionId?: string) => {
    if (!sectionId) return "Aucune section (en bas de page)"
    const section = sections.find((s) => s.id === sectionId)
    return section ? section.title : "Section inconnue"
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/intranet/edition")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion des boutons</h1>
            <p className="text-gray-500">Gérez les boutons de la page {pageTitle}</p>
          </div>
        </div>
        <Button onClick={saveButtons} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un bouton</CardTitle>
            <CardDescription>Créez un nouveau bouton pour la page {pageTitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="button-label">Texte du bouton</Label>
                <Input
                  id="button-label"
                  placeholder="Ex: Télécharger le formulaire"
                  value={newButton.label}
                  onChange={(e) => setNewButton({ ...newButton, label: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button-url">URL</Label>
                <Input
                  id="button-url"
                  placeholder="Ex: https://exemple.com/formulaire.pdf"
                  value={newButton.url}
                  onChange={(e) => setNewButton({ ...newButton, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button-color">Couleur</Label>
                <Select
                  value={newButton.color}
                  onValueChange={(value) => setNewButton({ ...newButton, color: value as any })}
                >
                  <SelectTrigger id="button-color">
                    <SelectValue placeholder="Choisir une couleur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Bleu</SelectItem>
                    <SelectItem value="amber">Ambre</SelectItem>
                    <SelectItem value="green">Vert</SelectItem>
                    <SelectItem value="red">Rouge</SelectItem>
                    <SelectItem value="gray">Gris</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="button-section">Section associée</Label>
                <Select
                  value={newButton.sectionId}
                  onValueChange={(value) =>
                    setNewButton({ ...newButton, sectionId: value === "none" ? undefined : value })
                  }
                >
                  <SelectTrigger id="button-section">
                    <SelectValue placeholder="Choisir une section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune section (en bas de page)</SelectItem>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addButton} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le bouton
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Boutons existants ({buttons.length})</CardTitle>
            <CardDescription>Gérez les boutons existants de la page {pageTitle}</CardDescription>
          </CardHeader>
          <CardContent>
            {buttons.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <ExternalLink className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun bouton</h3>
                <p className="text-gray-500 mb-4">
                  Ajoutez des boutons pour les rendre accessibles sur la page publique.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {buttons.map((button, index) => (
                  <div key={button.id} className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">{button.label}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 p-0"
                          onClick={() => moveButtonUp(button.id)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 p-0"
                          onClick={() => moveButtonDown(button.id)}
                          disabled={index === buttons.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7 p-0"
                          onClick={() => deleteButton(button.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`button-label-${button.id}`}>Texte</Label>
                        <Input
                          id={`button-label-${button.id}`}
                          value={button.label}
                          onChange={(e) => updateButton(button.id, "label", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`button-url-${button.id}`}>URL</Label>
                        <Input
                          id={`button-url-${button.id}`}
                          value={button.url}
                          onChange={(e) => updateButton(button.id, "url", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor={`button-color-${button.id}`}>Couleur</Label>
                        <Select value={button.color} onValueChange={(value) => updateButton(button.id, "color", value)}>
                          <SelectTrigger id={`button-color-${button.id}`}>
                            <SelectValue placeholder="Choisir une couleur" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blue">Bleu</SelectItem>
                            <SelectItem value="amber">Ambre</SelectItem>
                            <SelectItem value="green">Vert</SelectItem>
                            <SelectItem value="red">Rouge</SelectItem>
                            <SelectItem value="gray">Gris</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`button-section-${button.id}`}>Section associée</Label>
                        <Select
                          value={button.sectionId || "none"}
                          onValueChange={(value) =>
                            updateButton(button.id, "sectionId", value === "none" ? undefined : value)
                          }
                        >
                          <SelectTrigger id={`button-section-${button.id}`}>
                            <SelectValue placeholder="Choisir une section" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucune section (en bas de page)</SelectItem>
                            {sections.map((section) => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Section actuelle: {getSectionName(button.sectionId)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
