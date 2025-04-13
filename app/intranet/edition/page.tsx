"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowDown,
  ArrowUp,
  Bold,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Italic,
  Plus,
  Save,
  Trash2,
  Underline,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { publicNavItems } from "@/lib/navigation"
import type { EconomicData, OrgMember, PageSection } from "@/components/page-content-provider"
import { usePageContent } from "@/components/page-content-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getCurrentUser } from "@/lib/auth-service"

export default function EditionPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("accueil")
  const [newImage, setNewImage] = useState("")
  const [newCarouselImage, setNewCarouselImage] = useState("")
  const [newOrgMember, setNewOrgMember] = useState<Omit<OrgMember, "id" | "level" | "order">>({
    name: "",
    position: "",
    photo: "",
    parentId: undefined,
  })
  const [newEconomicData, setNewEconomicData] = useState<Omit<EconomicData, "id">>({
    week: "",
    revenues: 0,
    expenses: 0,
  })
  const [selectedText, setSelectedText] = useState<{
    pageKey: string
    sectionId: string
    start: number
    end: number
    text: string
  } | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const { siteContent, isLoading: isContentLoading, setSiteContent, saveContent } = usePageContent()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const user = getCurrentUser()
    if (user) {
      setIsLoggedIn(true)
    } else {
      router.push("/intranet")
    }
    setIsLoading(false)
  }, [router])

  // Fonction pour sauvegarder le contenu
  const handleSaveContent = async () => {
    const success = await saveContent()
    if (success) {
      toast({
        title: "Contenu sauvegardé",
        description: "Le contenu a été sauvegardé avec succès.",
      })
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde du contenu.",
        variant: "destructive",
      })
    }
  }

  if (isLoading || isContentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  // Fonction pour ajouter une nouvelle section
  const addSection = (pageKey: string) => {
    const newSection: PageSection = {
      id: Date.now().toString(),
      title: "Nouvelle section",
      content: "",
      imagePosition: "none",
      imageSize: "medium",
    }

    setSiteContent((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        sections: [...(prev[pageKey].sections || []), newSection],
      },
    }))

    toast({
      title: "Section ajoutée",
      description: "Une nouvelle section a été ajoutée.",
    })
  }

  // Fonction pour supprimer une section
  const removeSection = (pageKey: string, sectionId: string) => {
    setSiteContent((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        sections: prev[pageKey].sections.filter((section) => section.id !== sectionId),
      },
    }))

    toast({
      title: "Section supprimée",
      description: "La section a été supprimée.",
    })
  }

  // Fonction pour mettre à jour une section
  const updateSection = (pageKey: string, sectionId: string, field: keyof PageSection, value: any) => {
    setSiteContent((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        sections: prev[pageKey].sections.map((section) =>
          section.id === sectionId ? { ...section, [field]: value } : section,
        ),
      },
    }))
  }

  // Fonction pour déplacer une section vers le haut
  const moveSectionUp = (pageKey: string, index: number) => {
    if (index === 0) return

    const sections = [...siteContent[pageKey].sections]
    const temp = sections[index]
    sections[index] = sections[index - 1]
    sections[index - 1] = temp

    setSiteContent((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        sections,
      },
    }))
  }

  // Fonction pour déplacer une section vers le bas
  const moveSectionDown = (pageKey: string, index: number) => {
    const sections = siteContent[pageKey].sections
    if (index === sections.length - 1) return

    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[index + 1]
    newSections[index + 1] = temp

    setSiteContent((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        sections: newSections,
      },
    }))
  }

  // Fonction pour ajouter une image au carrousel
  const addCarouselImage = (pageKey: string) => {
    if (newCarouselImage.trim() === "") {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une URL d'image valide.",
        variant: "destructive",
      })
      return
    }

    setSiteContent((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        carouselImages: [...(prev[pageKey].carouselImages || []), newCarouselImage],
      },
    }))

    setNewCarouselImage("")

    toast({
      title: "Image ajoutée",
      description: "L'image a été ajoutée au carrousel.",
    })
  }

  // Fonction pour supprimer une image du carrousel
  const removeCarouselImage = (pageKey: string, index: number) => {
    setSiteContent((prev) => {
      const carouselImages = [...(prev[pageKey].carouselImages || [])]
      carouselImages.splice(index, 1)

      return {
        ...prev,
        [pageKey]: {
          ...prev[pageKey],
          carouselImages,
        },
      }
    })

    toast({
      title: "Image supprimée",
      description: "L'image a été supprimée du carrousel.",
    })
  }

  // Fonction pour ajouter un membre à l'organigramme
  const addOrgMember = (pageKey: string) => {
    if (newOrgMember.name.trim() === "" || newOrgMember.position.trim() === "") {
      toast({
        title: "Erreur",
        description: "Veuillez saisir au moins un nom et un poste.",
        variant: "destructive",
      })
      return
    }

    // Déterminer le niveau en fonction du parent
    let level = 0
    if (newOrgMember.parentId) {
      const parent = siteContent[pageKey].orgMembers?.find((m) => m.id === newOrgMember.parentId)
      if (parent) {
        level = parent.level + 1
      }
    }

    // Déterminer l'ordre (le dernier dans son niveau)
    const membersAtSameLevel = siteContent[pageKey].orgMembers?.filter((m) => m.level === level) || []
    const order = membersAtSameLevel.length

    const member: OrgMember = {
      id: Date.now().toString(),
      ...newOrgMember,
      level,
      order,
    }

    setSiteContent((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        orgMembers: [...(prev[pageKey].orgMembers || []), member],
      },
    }))

    setNewOrgMember({
      name: "",
      position: "",
      photo: "",
      parentId: undefined,
    })

    toast({
      title: "Membre ajouté",
      description: "Le membre a été ajouté à l'organigramme.",
    })
  }

  // Fonction pour supprimer un membre de l'organigramme
  const removeOrgMember = (pageKey: string, memberId: string) => {
    // Vérifier si ce membre a des enfants
    const hasChildren = siteContent[pageKey].orgMembers?.some((m) => m.parentId === memberId)

    if (hasChildren) {
      toast({
        title: "Impossible de supprimer",
        description: "Ce membre a des subordonnés. Veuillez d'abord supprimer ou réaffecter ses subordonnés.",
        variant: "destructive",
      })
      return
    }

    setSiteContent((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        orgMembers: (prev[pageKey].orgMembers || []).filter((member) => member.id !== memberId),
      },
    }))

    toast({
      title: "Membre supprimé",
      description: "Le membre a été supprimé de l'organigramme.",
    })
  }

  // Fonction pour mettre à jour un membre de l'organigramme
  const updateOrgMember = (pageKey: string, memberId: string, field: keyof OrgMember, value: any) => {
    // Si on change le parent, il faut aussi mettre à jour le niveau
    if (field === "parentId") {
      setSiteContent((prev) => {
        const orgMembers = [...(prev[pageKey].orgMembers || [])]
        const memberIndex = orgMembers.findIndex((m) => m.id === memberId)

        if (memberIndex !== -1) {
          // Déterminer le nouveau niveau
          let newLevel = 0
          if (value) {
            const parent = orgMembers.find((m) => m.id === value)
            if (parent) {
              newLevel = parent.level + 1
            }
          }

          // Mettre à jour le membre
          orgMembers[memberIndex] = {
            ...orgMembers[memberIndex],
            [field]: value,
            level: newLevel,
          }

          // Mettre à jour les enfants récursivement
          const updateChildrenLevel = (parentId: string, parentLevel: number) => {
            orgMembers.forEach((member, idx) => {
              if (member.parentId === parentId) {
                orgMembers[idx] = {
                  ...member,
                  level: parentLevel + 1,
                }
                updateChildrenLevel(member.id, parentLevel + 1)
              }
            })
          }

          updateChildrenLevel(memberId, newLevel)

          return {
            ...prev,
            [pageKey]: {
              ...prev[pageKey],
              orgMembers,
            },
          }
        }

        return prev
      })
    } else {
      setSiteContent((prev) => ({
        ...prev,
        [pageKey]: {
          ...prev[pageKey],
          orgMembers: (prev[pageKey].orgMembers || []).map((member) =>
            member.id === memberId ? { ...member, [field]: value } : member,
          ),
        },
      }))
    }
  }

  // Fonction pour déplacer un membre vers le haut dans son niveau
  const moveOrgMemberUp = (pageKey: string, memberId: string) => {
    setSiteContent((prev) => {
      const orgMembers = [...(prev[pageKey].orgMembers || [])]
      const memberIndex = orgMembers.findIndex((m) => m.id === memberId)

      if (memberIndex === -1) return prev

      const member = orgMembers[memberIndex]
      const sameLevel = orgMembers.filter((m) => m.level === member.level && m.parentId === member.parentId)
      const memberLevelIndex = sameLevel.findIndex((m) => m.id === memberId)

      if (memberLevelIndex <= 0) return prev

      // Échanger les ordres
      const prevMember = sameLevel[memberLevelIndex - 1]
      const prevMemberIndex = orgMembers.findIndex((m) => m.id === prevMember.id)

      const tempOrder = orgMembers[memberIndex].order
      orgMembers[memberIndex].order = orgMembers[prevMemberIndex].order
      orgMembers[prevMemberIndex].order = tempOrder

      return {
        ...prev,
        [pageKey]: {
          ...prev[pageKey],
          orgMembers: [...orgMembers].sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level
            return a.order - b.order
          }),
        },
      }
    })
  }

  // Fonction pour déplacer un membre vers le bas dans son niveau
  const moveOrgMemberDown = (pageKey: string, memberId: string) => {
    setSiteContent((prev) => {
      const orgMembers = [...(prev[pageKey].orgMembers || [])]
      const memberIndex = orgMembers.findIndex((m) => m.id === memberId)

      if (memberIndex === -1) return prev

      const member = orgMembers[memberIndex]
      const sameLevel = orgMembers.filter((m) => m.level === member.level && m.parentId === member.parentId)
      const memberLevelIndex = sameLevel.findIndex((m) => m.id === memberId)

      if (memberLevelIndex >= sameLevel.length - 1) return prev

      // Échanger les ordres
      const nextMember = sameLevel[memberLevelIndex + 1]
      const nextMemberIndex = orgMembers.findIndex((m) => m.id === nextMember.id)

      const tempOrder = orgMembers[memberIndex].order
      orgMembers[memberIndex].order = orgMembers[nextMemberIndex].order
      orgMembers[nextMemberIndex].order = tempOrder

      return {
        ...prev,
        [pageKey]: {
          ...prev[pageKey],
          orgMembers: [...orgMembers].sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level
            return a.order - b.order
          }),
        },
      }
    })
  }

  // Fonction pour ajouter des données économiques
  const addEconomicData = (pageKey: string) => {
    if (newEconomicData.week.trim() === "") {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une semaine.",
        variant: "destructive",
      })
      return
    }

    const data: EconomicData = {
      id: Date.now().toString(),
      ...newEconomicData,
    }

    setSiteContent((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        economicData: [...(prev[pageKey].economicData || []), data],
      },
    }))

    setNewEconomicData({
      week: "",
      revenues: 0,
      expenses: 0,
    })

    toast({
      title: "Données ajoutées",
      description: "Les données économiques ont été ajoutées.",
    })
  }

  // Fonction pour supprimer des données économiques
  const removeEconomicData = (pageKey: string, dataId: string) => {
    setSiteContent((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        economicData: (prev[pageKey].economicData || []).filter((data) => data.id !== dataId),
      },
    }))

    toast({
      title: "Données supprimées",
      description: "Les données économiques ont été supprimées.",
    })
  }

  // Fonction pour mettre à jour des données économiques
  const updateEconomicData = (pageKey: string, dataId: string, field: keyof EconomicData, value: any) => {
    setSiteContent((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        economicData: (prev[pageKey].economicData || []).map((data) =>
          data.id === dataId ? { ...data, [field]: value } : data,
        ),
      },
    }))
  }

  // Fonction pour appliquer un formatage au texte sélectionné
  const applyFormatting = (format: "bold" | "italic" | "underline") => {
    if (!selectedText) return

    const { pageKey, sectionId, start, end, text } = selectedText
    const section = siteContent[pageKey].sections.find((s) => s.id === sectionId)
    if (!section) return

    const content = section.content
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

    updateSection(pageKey, sectionId, "content", newContent)
    setSelectedText(null)
  }

  // Fonction pour gérer la sélection de texte
  const handleTextSelection = (pageKey: string, sectionId: string, e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    if (start !== end) {
      setSelectedText({
        pageKey,
        sectionId,
        start,
        end,
        text: textarea.value.substring(start, end),
      })
    } else {
      setSelectedText(null)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Édition de contenu</h1>
      <p className="text-gray-500 mb-8">Gérez le contenu du site public</p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 flex flex-wrap">
          {publicNavItems.map((item) => {
            const key = item.href.replace("/", "") || "accueil"
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                <item.icon className="h-4 w-4" />
                {item.title}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {publicNavItems.map((item) => {
          const key = item.href.replace("/", "") || "accueil"
          const pageContent = siteContent[key] || {
            title: item.title,
            content: "",
            images: [],
            sections: [],
            carousel: key === "accueil",
            carouselImages:
              key === "accueil"
                ? [
                    "/placeholder.svg?height=600&width=1200",
                    "/placeholder.svg?height=600&width=1200",
                    "/placeholder.svg?height=600&width=1200",
                  ]
                : undefined,
            orgMembers: key === "organigramme" ? [] : undefined,
            economicData: key === "economie" ? [] : undefined,
          }

          return (
            <TabsContent key={key} value={key}>
              {/* Carrousel d'images pour la page d'accueil */}
              {key === "accueil" && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Images du carrousel</CardTitle>
                    <CardDescription>
                      Gérez les images qui apparaissent dans le carrousel de la page d'accueil
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="URL de l'image"
                          value={newCarouselImage}
                          onChange={(e) => setNewCarouselImage(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={() => addCarouselImage(key)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
                      </div>

                      {pageContent.carouselImages && pageContent.carouselImages.length > 0 ? (
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                          {pageContent.carouselImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image || "/placeholder.svg"}
                                alt={`Image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-md"
                                onError={(e) => {
                                  // Fallback to placeholder if image fails to load
                                  ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=400"
                                }}
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeCarouselImage(key, index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-4 text-gray-500">Aucune image dans le carrousel</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Organigramme pour la page organigramme */}
              {key === "organigramme" && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Organigramme</CardTitle>
                    <CardDescription>Gérez les membres de l'organigramme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="member-name">Nom</Label>
                          <Input
                            id="member-name"
                            placeholder="Nom du membre"
                            value={newOrgMember.name}
                            onChange={(e) => setNewOrgMember({ ...newOrgMember, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="member-position">Poste</Label>
                          <Input
                            id="member-position"
                            placeholder="Poste du membre"
                            value={newOrgMember.position}
                            onChange={(e) => setNewOrgMember({ ...newOrgMember, position: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="member-photo">Photo (URL)</Label>
                          <Input
                            id="member-photo"
                            placeholder="URL de la photo"
                            value={newOrgMember.photo || ""}
                            onChange={(e) => setNewOrgMember({ ...newOrgMember, photo: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="member-parent">Supérieur hiérarchique (optionnel)</Label>
                        <Select
                          value={newOrgMember.parentId}
                          onValueChange={(value) => setNewOrgMember({ ...newOrgMember, parentId: value || undefined })}
                        >
                          <SelectTrigger id="member-parent">
                            <SelectValue placeholder="Sélectionner un supérieur (optionnel)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucun (niveau supérieur)</SelectItem>
                            {pageContent.orgMembers?.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name} - {member.position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={() => addOrgMember(key)} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un membre
                      </Button>

                      {pageContent.orgMembers && pageContent.orgMembers.length > 0 ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Membres actuels</h3>

                          {/* Affichage hiérarchique des membres */}
                          <div className="space-y-6">
                            {/* Niveau 0 (top) */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-blue-900">Direction</h4>
                              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {pageContent.orgMembers
                                  .filter((m) => m.level === 0)
                                  .sort((a, b) => a.order - b.order)
                                  .map((member) => (
                                    <OrgMemberCard
                                      key={member.id}
                                      member={member}
                                      pageKey={key}
                                      members={pageContent.orgMembers || []}
                                      onUpdate={updateOrgMember}
                                      onRemove={removeOrgMember}
                                      onMoveUp={moveOrgMemberUp}
                                      onMoveDown={moveOrgMemberDown}
                                    />
                                  ))}
                              </div>
                            </div>

                            {/* Niveaux inférieurs */}
                            {[...Array(3)].map((_, level) => {
                              level = level + 1 // Commencer à 1
                              const membersAtLevel = pageContent.orgMembers?.filter((m) => m.level === level) || []
                              if (membersAtLevel.length === 0) return null

                              return (
                                <div key={level} className="space-y-4">
                                  <h4 className="font-medium text-blue-900">Niveau {level}</h4>
                                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {membersAtLevel
                                      .sort((a, b) => a.order - b.order)
                                      .map((member) => (
                                        <OrgMemberCard
                                          key={member.id}
                                          member={member}
                                          pageKey={key}
                                          members={pageContent.orgMembers || []}
                                          onUpdate={updateOrgMember}
                                          onRemove={removeOrgMember}
                                          onMoveUp={moveOrgMemberUp}
                                          onMoveDown={moveOrgMemberDown}
                                        />
                                      ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-center py-4 text-gray-500">Aucun membre dans l'organigramme</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Données économiques pour la page économie */}
              {key === "economie" && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Données économiques</CardTitle>
                    <CardDescription>Gérez les données économiques (revenus et dépenses)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="economic-week">Semaine</Label>
                          <Input
                            id="economic-week"
                            placeholder="ex: Semaine 1"
                            value={newEconomicData.week}
                            onChange={(e) => setNewEconomicData({ ...newEconomicData, week: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="economic-revenues">Revenus ($)</Label>
                          <Input
                            id="economic-revenues"
                            type="number"
                            placeholder="0"
                            value={newEconomicData.revenues}
                            onChange={(e) =>
                              setNewEconomicData({ ...newEconomicData, revenues: Number(e.target.value) })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="economic-expenses">Dépenses ($)</Label>
                          <Input
                            id="economic-expenses"
                            type="number"
                            placeholder="0"
                            value={newEconomicData.expenses}
                            onChange={(e) =>
                              setNewEconomicData({ ...newEconomicData, expenses: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>

                      <Button onClick={() => addEconomicData(key)} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter des données
                      </Button>

                      {pageContent.economicData && pageContent.economicData.length > 0 ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Données actuelles</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="border p-2 text-left">Semaine</th>
                                  <th className="border p-2 text-left">Revenus ($)</th>
                                  <th className="border p-2 text-left">Dépenses ($)</th>
                                  <th className="border p-2 text-left">Solde ($)</th>
                                  <th className="border p-2 text-left">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pageContent.economicData.map((data) => (
                                  <tr key={data.id}>
                                    <td className="border p-2">
                                      <Input
                                        value={data.week}
                                        onChange={(e) => updateEconomicData(key, data.id, "week", e.target.value)}
                                      />
                                    </td>
                                    <td className="border p-2">
                                      <Input
                                        type="number"
                                        value={data.revenues}
                                        onChange={(e) =>
                                          updateEconomicData(key, data.id, "revenues", Number(e.target.value))
                                        }
                                      />
                                    </td>
                                    <td className="border p-2">
                                      <Input
                                        type="number"
                                        value={data.expenses}
                                        onChange={(e) =>
                                          updateEconomicData(key, data.id, "expenses", Number(e.target.value))
                                        }
                                      />
                                    </td>
                                    <td className="border p-2">
                                      <div
                                        className={`font-medium ${data.revenues - data.expenses >= 0 ? "text-green-600" : "text-red-600"}`}
                                      >
                                        {data.revenues - data.expenses}
                                      </div>
                                    </td>
                                    <td className="border p-2">
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeEconomicData(key, data.id)}
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
                        </div>
                      ) : (
                        <p className="text-center py-4 text-gray-500">Aucune donnée économique</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold">Édition de la page {pageContent.title}</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => (window.location.href = `/intranet/edition/buttons?page=${activeTab}`)}
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Gérer les boutons
                  </Button>
                  <Button onClick={() => addSection(key)} className="bg-blue-900 hover:bg-blue-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une section
                  </Button>
                </div>
              </div>

              {pageContent.sections.length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg mb-6">
                  <p className="text-gray-500 mb-4">Aucune section n'a été créée pour cette page.</p>
                  <Button onClick={() => addSection(key)} className="bg-blue-900 hover:bg-blue-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une section
                  </Button>
                </div>
              ) : (
                pageContent.sections.map((section, index) => (
                  <Card key={section.id} className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">Section {index + 1}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveSectionUp(key, index)}
                          disabled={index === 0}
                          className="h-8 w-8"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveSectionDown(key, index)}
                          disabled={index === pageContent.sections.length - 1}
                          className="h-8 w-8"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeSection(key, section.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`section-title-${section.id}`}>Titre de la section</Label>
                            <Input
                              id={`section-title-${section.id}`}
                              value={section.title}
                              onChange={(e) => updateSection(key, section.id, "title", e.target.value)}
                              placeholder="Titre de la section"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`section-content-${section.id}`}>Contenu de la section</Label>
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
                              </div>
                            </div>
                            <Textarea
                              id={`section-content-${section.id}`}
                              value={section.content}
                              onChange={(e) => updateSection(key, section.id, "content", e.target.value)}
                              onMouseUp={(e) => handleTextSelection(key, section.id, e)}
                              placeholder="Contenu de la section"
                              rows={6}
                            />
                            <p className="text-xs text-gray-500">
                              Astuce: Sélectionnez du texte pour le mettre en forme (gras, italique, souligné).
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`section-image-position-${section.id}`}>Position de l'image</Label>
                            <Select
                              value={section.imagePosition || "none"}
                              onValueChange={(value) => updateSection(key, section.id, "imagePosition", value)}
                            >
                              <SelectTrigger id={`section-image-position-${section.id}`}>
                                <SelectValue placeholder="Choisir la position" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Pas d'image</SelectItem>
                                <SelectItem value="left">Image à gauche</SelectItem>
                                <SelectItem value="right">Image à droite</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {section.imagePosition !== "none" && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor={`section-image-size-${section.id}`}>Taille de l'image</Label>
                                <Select
                                  value={section.imageSize || "medium"}
                                  onValueChange={(value) => updateSection(key, section.id, "imageSize", value)}
                                >
                                  <SelectTrigger id={`section-image-size-${section.id}`}>
                                    <SelectValue placeholder="Choisir la taille" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="small">Petite</SelectItem>
                                    <SelectItem value="medium">Moyenne</SelectItem>
                                    <SelectItem value="large">Grande</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`section-image-${section.id}`}>URL de l'image</Label>
                                <div className="flex gap-2">
                                  <Input
                                    id={`section-image-${section.id}`}
                                    value={section.image || ""}
                                    onChange={(e) => updateSection(key, section.id, "image", e.target.value)}
                                    placeholder="URL de l'image"
                                  />
                                </div>

                                {section.image && (
                                  <div className="mt-2 relative group">
                                    <img
                                      src={section.image || "/placeholder.svg"}
                                      alt={`Image pour ${section.title}`}
                                      className="w-full h-24 object-cover rounded-md"
                                      onError={(e) => {
                                        // Fallback to placeholder if image fails to load
                                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=400"
                                      }}
                                    />
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => updateSection(key, section.id, "image", "")}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => (window.location.href = "/intranet")}>
          Retour au tableau de bord
        </Button>

        <Button onClick={handleSaveContent} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  )
}

// Composant pour afficher un membre de l'organigramme dans l'interface d'édition
function OrgMemberCard({
  member,
  pageKey,
  members,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  member: OrgMember
  pageKey: string
  members: OrgMember[]
  onUpdate: (pageKey: string, memberId: string, field: keyof OrgMember, value: any) => void
  onRemove: (pageKey: string, memberId: string) => void
  onMoveUp: (pageKey: string, memberId: string) => void
  onMoveDown: (pageKey: string, memberId: string) => void
}) {
  // Trouver le parent du membre
  const parent = member.parentId ? members.find((m) => m.id === member.parentId) : null

  // Vérifier si le membre peut être déplacé vers le haut ou vers le bas
  const sameLevel = members.filter((m) => m.level === member.level && m.parentId === member.parentId)
  const memberLevelIndex = sameLevel.findIndex((m) => m.id === member.id)
  const canMoveUp = memberLevelIndex > 0
  const canMoveDown = memberLevelIndex < sameLevel.length - 1

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src={member.photo || "/placeholder.svg?height=200&width=200"}
          alt={member.name}
          className="w-full h-40 object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=200"
          }}
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 bg-white"
            onClick={() => onMoveUp(pageKey, member.id)}
            disabled={!canMoveUp}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 bg-white"
            onClick={() => onMoveDown(pageKey, member.id)}
            disabled={!canMoveDown}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button variant="destructive" size="icon" className="h-6 w-6" onClick={() => onRemove(pageKey, member.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor={`member-name-${member.id}`}>Nom</Label>
            <Input
              id={`member-name-${member.id}`}
              value={member.name}
              onChange={(e) => onUpdate(pageKey, member.id, "name", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`member-position-${member.id}`}>Poste</Label>
            <Input
              id={`member-position-${member.id}`}
              value={member.position}
              onChange={(e) => onUpdate(pageKey, member.id, "position", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`member-photo-${member.id}`}>Photo (URL)</Label>
            <Input
              id={`member-photo-${member.id}`}
              value={member.photo || ""}
              onChange={(e) => onUpdate(pageKey, member.id, "photo", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`member-parent-${member.id}`}>Supérieur hiérarchique</Label>
            <Select
              value={member.parentId || ""}
              onValueChange={(value) => onUpdate(pageKey, member.id, "parentId", value || undefined)}
            >
              <SelectTrigger id={`member-parent-${member.id}`}>
                <SelectValue placeholder="Sélectionner un supérieur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun (niveau supérieur)</SelectItem>
                {members
                  .filter((m) => m.id !== member.id && !isDescendantOf(members, member.id, m.id))
                  .map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} - {m.position}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {parent && (
            <div className="mt-2 text-sm text-gray-500">
              Supérieur actuel: {parent.name} - {parent.position}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Fonction utilitaire pour vérifier si un membre est un descendant d'un autre
function isDescendantOf(members: OrgMember[], ancestorId: string, potentialDescendantId: string): boolean {
  const potentialDescendant = members.find((m) => m.id === potentialDescendantId)
  if (!potentialDescendant) return false
  if (!potentialDescendant.parentId) return false
  if (potentialDescendant.parentId === ancestorId) return true
  return isDescendantOf(members, ancestorId, potentialDescendant.parentId)
}
