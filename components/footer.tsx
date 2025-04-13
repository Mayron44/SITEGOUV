import Link from "next/link"
import { DiscIcon as Discord, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Gouvernement de San Andreas</h3>
            <p className="text-blue-200 text-sm">
              Site officiel du gouvernement de San Andreas, au service des citoyens.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Liens rapides</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>
                <Link href="/organigramme" className="hover:text-white transition-colors">
                  Organigramme
                </Link>
              </li>
              <li>
                <Link href="/economie" className="hover:text-white transition-colors">
                  Économie
                </Link>
              </li>
              <li>
                <Link href="/affaires-etrangeres" className="hover:text-white transition-colors">
                  Affaires étrangères
                </Link>
              </li>
              <li>
                <Link href="/evenements" className="hover:text-white transition-colors">
                  Événements
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Informations</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>
                <Link href="/actualites" className="hover:text-white transition-colors">
                  Nos actualités
                </Link>
              </li>
              <li>
                <Link href="/justice" className="hover:text-white transition-colors">
                  Justice
                </Link>
              </li>
              <li>
                <Link href="/newsletter" className="hover:text-white transition-colors flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Newsletter
                </Link>
              </li>
              <li>
                <Link href="/newsletter/unsubscribe" className="hover:text-white transition-colors">
                  Se désinscrire
                </Link>
              </li>
              <li>
                <Link href="/intranet" className="hover:text-white transition-colors">
                  Intranet
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Suivez-nous</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-blue-200 hover:text-white transition-colors">
                <Discord className="h-5 w-5" />
                <span className="sr-only">Discord</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-blue-900 pt-6 text-center text-sm text-blue-300">
          <p>© {new Date().getFullYear()} Gouvernement de San Andreas. Tous droits réservés. Développé par Mayron.</p>
        </div>
      </div>
    </footer>
  )
}
