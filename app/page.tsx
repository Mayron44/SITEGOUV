"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, Clock, FileText, Globe, Mail, Users } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ImageCarousel from "@/components/image-carousel"
import { publicNavItems } from "@/lib/navigation"
import { usePageContent } from "@/components/page-content-provider"
import { Section } from "@/components/page-section"
import { PageButtons } from "@/components/page-buttons"

export default function Home() {
  const { siteContent, isLoading } = usePageContent()
  const [homeContent, setHomeContent] = useState({
    title: "Gouvernement de San Andreas",
    content: "Au service des citoyens pour un avenir prospère et sécurisé",
    images: [] as string[],
    sections: [] as { id: string; title: string; content: string; [key: string]: any }[],
    buttons: [] as { sectionId?: string; [key: string]: any }[],
    carouselImages: [
      "/placeholder.svg?height=600&width=1200",
      "/placeholder.svg?height=600&width=1200",
      "/placeholder.svg?height=600&width=1200",
    ],
  })

  const router = useRouter()

  useEffect(() => {
    if (!isLoading && siteContent.accueil) {
      try {
        console.log("Page accueil loaded with content:", siteContent.accueil)
        console.log("Buttons:", siteContent.accueil.buttons || [])

        // Ensure we have valid carousel images or use placeholders
        const validCarouselImages =
          siteContent.accueil.carouselImages && siteContent.accueil.carouselImages.length > 0
            ? siteContent.accueil.carouselImages
            : homeContent.carouselImages

        setHomeContent({
          title: siteContent.accueil.title || homeContent.title,
          content: siteContent.accueil.content || homeContent.content,
          images: siteContent.accueil.images || [],
          sections: siteContent.accueil.sections?.map((section: any) => ({
            id: section.id,
            title: section.title || "Default Title",
            content: section.content || "Default Content",
            ...section,
          })) || [],
          buttons: siteContent.accueil.buttons || [],
          carouselImages: validCarouselImages,
        })
      } catch (error) {
        console.error("Error setting home content:", error)
      }
    }
  }, [isLoading, siteContent])

  // Sample carousel images - these would be managed through the intranet
  const carouselImages = homeContent.carouselImages.map((src) => ({
    src,
    alt: "San Andreas Government",
  }))

  // Vérifier s'il y a des sections
  const hasSections = homeContent.sections && homeContent.sections.length > 0

  // Filtrer les boutons qui ne sont pas associés à une section
  const generalButtons = homeContent.buttons ? homeContent.buttons.filter((button) => !button.sectionId) : []

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero section with carousel */}
      <section className="relative w-full h-[500px] md:h-[600px]">
        <ImageCarousel images={carouselImages} />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white p-6">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">Gouvernement de San Andreas</h1>
          <p className="text-xl md:text-2xl text-center max-w-3xl">
            Au service des citoyens pour un avenir prospère et sécurisé
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => router.push("/#services")}
            >
              Nos services
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-blue-900/70 text-white border-white hover:bg-blue-900/90"
              onClick={() => router.push("/newsletter")}
            >
              S'inscrire à la newsletter
            </Button>
          </div>
        </div>
      </section>

      {/* Welcome message */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Bienvenue sur le portail officiel du Gouvernement
          </h2>

          {/* Afficher les sections si elles existent */}
          {hasSections ? (
            <div className="space-y-12">
              {homeContent.sections.map((section, index) => (
                <Section
                  key={section.id}
                  section={section}
                  index={index}
                  buttons={(homeContent.buttons || []).map((button) => ({
                    id: button.id || "default-id",
                    label: button.label || "Default Label",
                    url: button.url || "#",
                    color: button.color || "default-color",
                    order: button.order || 0,
                    ...button,
                  }))}
                />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                {homeContent.content ? (
                  <div className="text-lg text-gray-700 whitespace-pre-wrap">{homeContent.content}</div>
                ) : (
                  <>
                    <p className="text-lg text-gray-700 mb-6">
                      Le Gouvernement de San Andreas s'engage à offrir un service public de qualité, transparent et
                      efficace pour tous ses citoyens. Notre mission est de garantir la sécurité, la prospérité et le
                      bien-être de notre population.
                    </p>
                    <p className="text-lg text-gray-700 mb-6">
                      Explorez notre site pour découvrir nos services, nos actualités et toutes les informations
                      relatives à notre administration.
                    </p>
                  </>
                )}
                <Link
                  href="/contact"
                  className="text-amber-600 hover:text-amber-800 font-medium inline-flex items-center"
                >
                  Nous contacter <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <div className="bg-gray-100 p-8 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Annonces officielles</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Réunion du conseil - 15 Avril 2025</p>
                      <p className="text-sm text-gray-600">Discussion sur les nouveaux projets d'infrastructure</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <FileText className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Nouveau décret sur la circulation</p>
                      <p className="text-sm text-gray-600">Consultez les nouvelles règles en vigueur</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Globe className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Relations internationales</p>
                      <p className="text-sm text-gray-600">Signature d'un accord avec Liberty City</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Afficher les boutons généraux s'ils existent */}
          {generalButtons.length > 0 && (
            <PageButtons
              buttons={generalButtons.map((button) => ({
                id: button.id || "default-id",
                label: button.label || "Default Label",
                url: button.url || "#",
                color: button.color || "default-color",
                order: button.order || 0,
                ...button,
              }))}
            />
          )}
        </div>
      </section>

      {/* Quick access cards */}
      <section className="py-16 px-6 bg-gray-50" id="services">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Nos services</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {publicNavItems.slice(0, 6).map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4 bg-blue-900/10 w-12 h-12 rounded-full flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-blue-900" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <Link
                    href={item.href}
                    className="text-amber-600 hover:text-amber-800 font-medium inline-flex items-center"
                  >
                    En savoir plus <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section className="py-16 px-6 bg-blue-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Contactez-nous</h2>
              <p className="text-lg mb-8 text-blue-100">
                Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans vos
                démarches.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-blue-100">Secrétaire IDAO</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Accueil du public</p>
                    <p className="text-blue-100">Sur rendez-vous</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Link href="/contact">Nous contacter</Link>
                </Button>
              </div>
            </div>
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-6">Accès à l'intranet</h3>
              <p className="mb-6 text-blue-100">
                Espace réservé aux membres du gouvernement et aux fonctionnaires autorisés.
              </p>
              <Button asChild className="w-full bg-white text-blue-900 hover:bg-blue-50">
                <Link href="/intranet">Connexion à l'intranet</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
