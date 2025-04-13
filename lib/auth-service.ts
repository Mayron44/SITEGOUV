import { getSupabaseClient } from "./supabase"

export interface User {
  id: string
  username: string
  role: string
}

// Utilisateurs par défaut pour le mode hors ligne
const DEFAULT_USERS = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    role: "admin",
  },
  {
    id: "2",
    username: "user",
    password: "user123",
    role: "user",
  },
]

// Fonction pour se connecter
export async function login(username: string, password: string): Promise<User | null> {
  try {
    console.log("Tentative de connexion pour:", username)

    // Vérifier d'abord si nous avons des utilisateurs en localStorage
    const localUsers = localStorage.getItem("users")
    let users = localUsers ? JSON.parse(localUsers) : []

    // Si pas d'utilisateurs en localStorage, utiliser les utilisateurs par défaut
    if (!users || users.length === 0) {
      users = DEFAULT_USERS
      localStorage.setItem("users", JSON.stringify(users))
    }

    // Essayer de se connecter avec localStorage
    const localUser = users.find((u: any) => u.username === username && u.password === password)

    if (localUser) {
      console.log("Utilisateur trouvé en localStorage")
      const user: User = {
        id: localUser.id,
        username: localUser.username,
        role: localUser.role,
      }

      localStorage.setItem("user", JSON.stringify(user))
      return user
    }

    // Sinon, on tente avec Supabase
    console.log("Tentative de connexion avec Supabase")
    try {
      const supabase = getSupabaseClient() // ✅ création locale du client
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single()

      console.log("Réponse Supabase:", { data, error })

      if (error) {
        console.error("Erreur Supabase détaillée:", JSON.stringify(error))
      } else if (data) {
        const user: User = {
          id: data.id,
          username: data.username,
          role: data.role,
        }

        localStorage.setItem("user", JSON.stringify(user))

        // Ajouter l'utilisateur à la liste locale si pas déjà présent
        if (!localUser) {
          users.push({
            id: data.id,
            username: data.username,
            password: password, // Stocker le mot de passe pour le mode hors ligne
            role: data.role,
          })
          localStorage.setItem("users", JSON.stringify(users))
        }

        return user
      }
    } catch (supabaseError) {
      console.error("Erreur lors de la connexion à Supabase:", supabaseError)
    }

    console.log("Échec de connexion pour:", username)
    return null
  } catch (error) {
    console.error("Erreur générale lors de la connexion:", error)
    return null
  }
}

export function logout(): void {
  localStorage.removeItem("user")
}

export function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem("user")
    if (!userStr) return null
    return JSON.parse(userStr) as User
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return null
  }
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === "admin" || false
}
