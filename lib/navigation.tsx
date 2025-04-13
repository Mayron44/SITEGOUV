import { BarChart3, Building2, Calendar, FileText, Globe, Home, Mail, Scale } from "lucide-react"

export const publicNavItems = [
  {
    title: "Accueil",
    href: "/",
    icon: Home,
    description: "Retour à la page d'accueil du site gouvernemental.",
  },
  {
    title: "Organigramme",
    href: "/organigramme",
    icon: Building2,
    description: "Découvrez la structure et l'organisation de notre gouvernement.",
  },
  {
    title: "Économie",
    href: "/economie",
    icon: BarChart3,
    description: "Informations sur l'économie et les finances de San Andreas.",
  },
  {
    title: "Affaires étrangères",
    href: "/affaires-etrangeres",
    icon: Globe,
    description: "Relations internationales et diplomatie de San Andreas.",
  },
  {
    title: "Événements",
    href: "/evenements",
    icon: Calendar,
    description: "Calendrier des événements officiels et manifestations.",
  },
  {
    title: "Actualités",
    href: "/actualites",
    icon: FileText,
    description: "Dernières nouvelles et communiqués officiels.",
  },
  {
    title: "Justice",
    href: "/justice",
    icon: Scale,
    description: "Informations sur le système judiciaire et les lois.",
  },
  {
    title: "Contact",
    href: "/contact",
    icon: Mail,
    description: "Contactez les services du gouvernement.",
  },
]

export const intranetNavItems = [
  {
    title: "Tableau de bord",
    href: "/intranet",
    icon: Home,
  },
  {
    title: "Formulaires",
    href: "/intranet/formulaires",
    icon: FileText,
  },
  {
    title: "Édition de contenu",
    href: "/intranet/edition",
    icon: FileText,
  },
  {
    title: "To-Do List",
    href: "/intranet/todo",
    icon: FileText,
  },
  {
    title: "Agenda",
    href: "/intranet/agenda",
    icon: Calendar,
  },
  {
    title: "Ressources",
    href: "/intranet/ressources",
    icon: FileText,
  },
  {
    title: "Administration",
    href: "/intranet/admin",
    icon: Building2,
  },
]
