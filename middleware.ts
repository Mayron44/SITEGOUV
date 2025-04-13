import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Cette fonction est requise pour que le middleware fonctionne
export function middleware(request: NextRequest) {
  // Ne rien faire, juste laisser passer toutes les requêtes
  return NextResponse.next()
}

// Configurer le middleware pour qu'il ne s'applique à aucune route
export const config = {
  matcher: [],
}
