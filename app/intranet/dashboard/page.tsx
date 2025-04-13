"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, ListTodo, Settings } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/intranet")
    } else {
      setUser(currentUser)
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
        <p className="mt-4">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Édition du site</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Gérer le contenu du site public</p>
            <Link href="/intranet/edition">
              <Button className="w-full bg-blue-900 hover:bg-blue-800">
                <FileText className="mr-2 h-4 w-4" />
                Accéder
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Gérer les événements</p>
            <Link href="/intranet/agenda">
              <Button className="w-full bg-blue-900 hover:bg-blue-800">
                <Calendar className="mr-2 h-4 w-4" />
                Accéder
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Liste de tâches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Gérer vos tâches</p>
            <Link href="/intranet/todo">
              <Button className="w-full bg-blue-900 hover:bg-blue-800">
                <ListTodo className="mr-2 h-4 w-4" />
                Accéder
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ressources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Gérer les ressources</p>
            <Link href="/intranet/ressources">
              <Button className="w-full bg-blue-900 hover:bg-blue-800">
                <FileText className="mr-2 h-4 w-4" />
                Accéder
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Newsletter</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Gérer les newsletters</p>
            <Link href="/intranet/newsletter">
              <Button className="w-full bg-blue-900 hover:bg-blue-800">
                <FileText className="mr-2 h-4 w-4" />
                Accéder
              </Button>
            </Link>
          </CardContent>
        </Card>

        {user?.role === "admin" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Administration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">Paramètres administrateur</p>
              <Link href="/intranet/admin">
                <Button className="w-full bg-blue-900 hover:bg-blue-800">
                  <Settings className="mr-2 h-4 w-4" />
                  Accéder
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
