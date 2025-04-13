"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, Plus, Trash2 } from "lucide-react"
import { format, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getEvents, addEvent, deleteEvent } from "@/lib/event-service"
import { getCurrentUser } from "@/lib/auth-service"
import type { Event } from "@/lib/event-service"

export default function AgendaPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    time: "09:00",
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const user = getCurrentUser()
    if (user) {
      setIsLoggedIn(true)
      loadEvents()
    } else {
      router.push("/intranet")
    }
  }, [router])

  const loadEvents = async () => {
    setIsLoading(true)
    try {
      const loadedEvents = await getEvents()
      setEvents(loadedEvents)
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEvent = async () => {
    if (newEvent.title.trim() === "") {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un titre pour l'événement.",
        variant: "destructive",
      })
      return
    }

    if (!selectedDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      const event = await addEvent(newEvent.title, newEvent.description || null, formattedDate, newEvent.time)

      if (event) {
        setEvents([...events, event])
        setNewEvent({
          title: "",
          description: "",
          time: "09:00",
        })
        setShowAddForm(false)
        toast({
          title: "Événement ajouté",
          description: "L'événement a été ajouté avec succès.",
        })
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter l'événement.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'événement:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de l'événement.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const success = await deleteEvent(eventId)
      if (success) {
        setEvents(events.filter((e) => e.id !== eventId))
        toast({
          title: "Événement supprimé",
          description: "L'événement a été supprimé avec succès.",
        })
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'événement.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'événement.",
        variant: "destructive",
      })
    }
  }

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

  const filteredEvents = selectedDate ? events.filter((event) => isSameDay(new Date(event.date), selectedDate)) : []

  // Fonction pour vérifier si une date a des événements
  const hasEventOnDate = (date: Date) => {
    return events.some((event) => isSameDay(new Date(event.date), date))
  }

  // Filtrer les props pour éviter l'erreur displayMonth
  const filterDOMProps = (props: any) => {
    const { displayMonth, ...domProps } = props
    return domProps
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Agenda</h1>
      <p className="text-gray-500 mb-8">Gérez les rendez-vous et événements</p>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendrier</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={fr}
              className="rounded-md border"
              components={{
                DayContent: ({ date, ...props }) => (
                  <div className="relative flex flex-col items-center">
                    <div {...filterDOMProps(props)}>{date.getDate()}</div>
                    {hasEventOnDate(date) && (
                      <div
                        className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-blue-600"
                        style={{ marginBottom: "-4px" }}
                      ></div>
                    )}
                  </div>
                ),
              }}
            />
            <div className="mt-4">
              <Button onClick={() => setShowAddForm(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un événement
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? (
                <>Événements du {format(selectedDate, "dd MMMM yyyy", { locale: fr })}</>
              ) : (
                <>Sélectionnez une date</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showAddForm ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    placeholder="Titre de l'événement"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Description (optionnelle)"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Heure</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddEvent} className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Ajout en cours..." : "Ajouter"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {filteredEvents.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">Aucun événement pour cette date</p>
                ) : (
                  <ul className="space-y-2">
                    {filteredEvents
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((event) => (
                        <li key={event.id} className="p-3 bg-gray-50 rounded-md flex items-start gap-2">
                          <Clock className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{event.title}</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                {event.time}
                              </span>
                            </div>
                            {event.description && <p className="text-xs text-gray-500 mt-1">{event.description}</p>}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </li>
                      ))}
                  </ul>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button variant="outline" onClick={() => router.push("/intranet")}>
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  )
}
