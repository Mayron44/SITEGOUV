"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DiscIcon as Discord, Plus, Trash2, User, UserCog } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface UserType {
  id: string
  username: string
  role: "admin" | "user"
  password?: string
  createdAt: Date
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<UserType[]>([])
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in and is admin
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const user = JSON.parse(userStr)
          setIsLoggedIn(true)

          if (user.role === "admin") {
            setIsAdmin(true)

            // Load users from Supabase
            const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: true })

            if (error) {
              console.error("Error fetching users:", error)
              toast({
                title: "Erreur",
                description: "Impossible de récupérer la liste des utilisateurs.",
                variant: "destructive",
              })
            } else if (data) {
              // Convert string dates back to Date objects
              setUsers(
                data.map((u) => ({
                  id: u.id,
                  username: u.username,
                  role: u.role,
                  password: u.password,
                  createdAt: new Date(u.created_at),
                })),
              )
            }
          } else {
            toast({
              title: "Accès restreint",
              description: "Vous n'avez pas les droits d'accès à cette page.",
              variant: "destructive",
            })
            router.push("/intranet")
          }
        } else {
          router.push("/intranet")
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/intranet")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (!isLoggedIn || !isAdmin) {
    return null
  }

  const addUser = async () => {
    if (newUsername.trim() === "" || newPassword.trim() === "") {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      })
      return
    }

    // Check if username already exists
    if (users.some((user) => user.username.toLowerCase() === newUsername.toLowerCase())) {
      toast({
        title: "Erreur",
        description: "Ce nom d'utilisateur existe déjà.",
        variant: "destructive",
      })
      return
    }

    try {
      // Add user to Supabase
      const { data, error } = await supabase
        .from("users")
        .insert({
          username: newUsername,
          role: "user",
          password: newPassword,
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error("Error adding user:", error)
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter l'utilisateur.",
          variant: "destructive",
        })
        return
      }

      if (data && data.length > 0) {
        const newUser: UserType = {
          id: data[0].id,
          username: data[0].username,
          role: data[0].role,
          password: data[0].password,
          createdAt: new Date(data[0].created_at),
        }

        setUsers([...users, newUser])
        setNewUsername("")
        setNewPassword("")

        toast({
          title: "Utilisateur ajouté",
          description: "Le nouvel utilisateur a été ajouté avec succès.",
        })
      }
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de l'utilisateur.",
        variant: "destructive",
      })
    }
  }

  const deleteUser = async (userId: string) => {
    // Prevent deleting Mayron
    if (users.find((u) => u.id === userId)?.username === "Mayron") {
      toast({
        title: "Action non autorisée",
        description: "Vous ne pouvez pas supprimer l'administrateur principal.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("users").delete().eq("id", userId)

      if (error) {
        console.error("Error deleting user:", error)
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'utilisateur.",
          variant: "destructive",
        })
        return
      }

      setUsers(users.filter((user) => user.id !== userId))

      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'utilisateur.",
        variant: "destructive",
      })
    }
  }

  const toggleUserRole = async (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    // Prevent changing Mayron's role
    if (user.username === "Mayron") {
      toast({
        title: "Action non autorisée",
        description: "Vous ne pouvez pas modifier le rôle de l'administrateur principal.",
        variant: "destructive",
      })
      return
    }

    const newRole = user.role === "admin" ? "user" : "admin"

    try {
      const { error } = await supabase.from("users").update({ role: newRole }).eq("id", userId)

      if (error) {
        console.error("Error updating user role:", error)
        toast({
          title: "Erreur",
          description: "Impossible de modifier le rôle de l'utilisateur.",
          variant: "destructive",
        })
        return
      }

      setUsers(
        users.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              role: newRole as "admin" | "user",
            }
          }
          return u
        }),
      )

      toast({
        title: "Rôle modifié",
        description: "Le rôle de l'utilisateur a été modifié avec succès.",
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du rôle de l'utilisateur.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Administration</h1>
      <p className="text-gray-500 mb-8">Gérez les utilisateurs et les droits d'accès</p>

      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/intranet/admin/discord")}
          className="flex items-center gap-2"
        >
          <Discord className="h-4 w-4" />
          Configuration Discord
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un utilisateur</CardTitle>
            <CardDescription>Créez un nouvel accès à l'intranet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  placeholder="Nom d'utilisateur"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <Button onClick={addUser} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter l'utilisateur
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs</CardTitle>
            <CardDescription>Gérez les utilisateurs existants</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-center py-4 text-gray-500">Aucun utilisateur</p>
            ) : (
              <ul className="space-y-2">
                {users.map((user) => (
                  <li key={user.id} className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium flex-1">{user.username}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        user.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "Utilisateur"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleUserRole(user.id)}
                      disabled={user.username === "Mayron"}
                    >
                      <UserCog className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteUser(user.id)}
                      disabled={user.username === "Mayron"}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
