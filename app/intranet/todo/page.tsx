"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Circle, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getTasks, addTask, updateTaskStatus, deleteTask } from "@/lib/task-service"
import { getCurrentUser } from "@/lib/auth-service"
import type { Task } from "@/lib/task-service"

export default function TodoPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const user = getCurrentUser()
    if (user) {
      setIsLoggedIn(true)
      loadTasks()
    } else {
      router.push("/intranet")
    }
  }, [router])

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const loadedTasks = await getTasks()
      setTasks(loadedTasks)
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les tâches.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTask = async () => {
    if (newTask.trim() === "") {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une tâche.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const task = await addTask(newTask)
      if (task) {
        setTasks([task, ...tasks])
        setNewTask("")
        toast({
          title: "Tâche ajoutée",
          description: "La tâche a été ajoutée avec succès.",
        })
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter la tâche.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de la tâche.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleTaskStatus = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newStatus = task.status === "pending" ? "completed" : "pending"

    try {
      const success = await updateTaskStatus(taskId, newStatus)
      if (success) {
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
        toast({
          title: "Tâche mise à jour",
          description: "Le statut de la tâche a été mis à jour.",
        })
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la tâche.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la tâche.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const success = await deleteTask(taskId)
      if (success) {
        setTasks(tasks.filter((t) => t.id !== taskId))
        toast({
          title: "Tâche supprimée",
          description: "La tâche a été supprimée avec succès.",
        })
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la tâche.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la tâche.",
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

  const pendingTasks = tasks.filter((task) => task.status === "pending")
  const completedTasks = tasks.filter((task) => task.status === "completed")

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">To-Do List</h1>
      <p className="text-gray-500 mb-8">Gérez vos tâches et suivez votre progression</p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ajouter une tâche</CardTitle>
          <CardDescription>Ajoutez une nouvelle tâche à votre liste</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Nouvelle tâche..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTask()
                }
              }}
              className="flex-1"
              disabled={isSubmitting}
            />
            <Button onClick={handleAddTask} disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tâches en cours ({pendingTasks.length})</CardTitle>
            <CardDescription>Tâches qui restent à accomplir</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Circle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche en cours</h3>
                <p className="text-gray-500">Toutes vos tâches sont terminées !</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {pendingTasks.map((task) => (
                  <li key={task.id} className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleTaskStatus(task.id)}
                    >
                      <Circle className="h-5 w-5 text-gray-400" />
                    </Button>
                    <span className="text-sm flex-1">{task.title}</span>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tâches terminées ({completedTasks.length})</CardTitle>
            <CardDescription>Tâches que vous avez accomplies</CardDescription>
          </CardHeader>
          <CardContent>
            {completedTasks.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche terminée</h3>
                <p className="text-gray-500">Commencez par terminer quelques tâches !</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {completedTasks.map((task) => (
                  <li key={task.id} className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleTaskStatus(task.id)}
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </Button>
                    <span className="text-sm flex-1 line-through text-gray-500">{task.title}</span>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
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
