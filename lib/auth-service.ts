import { supabase } from "./supabase"

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

      // Stocker l'utilisateur connecté
      localStorage.setItem("user", JSON.stringify(user))
      return user
    }

    // Si pas trouvé en localStorage, essayer avec Supabase
    console.log("Tentative de connexion avec Supabase")
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single()

      console.log("Réponse Supabase:", { data, error })

      if (error) {
        console.error("Erreur Supabase détaillée:", JSON.stringify(error))
        // Continuer avec la solution de secours
      } else if (data) {
        const user: User = {
          id: data.id,
          username: data.username,
          role: data.role,
        }

        // Stocker l'utilisateur connecté
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
      // Continuer avec la solution de secours
    }

    // Si on arrive ici, aucune méthode n'a fonctionné
    console.log("Échec de connexion pour:", username)
    return null
  } catch (error) {
    console.error("Erreur générale lors de la connexion:", error)
    return null
  }
}

// Fonction pour se déconnecter
export function logout(): void {
  localStorage.removeItem("user")
}

// Fonction pour vérifier si l'utilisateur est connecté
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

// Fonction pour vérifier si l'utilisateur est admin
export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === "admin" || false
}
