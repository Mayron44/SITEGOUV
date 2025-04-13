"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { publicNavItems } from "@/lib/navigation"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isIntranet = pathname.startsWith("/intranet")

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
          <img
    src="https://i.postimg.cc/T30Z0nnp/bdg.png"
    alt="Logo San Andreas"
    className="h-8 w-8 object-contain"
    />

            <span className="hidden font-bold sm:inline-block">
              {isIntranet ? "Intranet" : "Gouvernement de San Andreas"}
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {!isIntranet &&
            publicNavItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-900 ${
                  pathname === item.href ? "text-blue-900" : "text-gray-600"
                }`}
              >
                {item.title}
              </Link>
            ))}

          <Button asChild variant="default" className="bg-blue-900 hover:bg-blue-800">
            <Link href={isIntranet ? "/" : "/intranet"}>{isIntranet ? "Site Public" : "Intranet"}</Link>
          </Button>
        </nav>

        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4">
            <nav className="flex flex-col space-y-4">
              {!isIntranet &&
                publicNavItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-900 ${
                      pathname === item.href ? "text-blue-900" : "text-gray-600"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}

              <Button asChild variant="default" className="w-full bg-blue-900 hover:bg-blue-800">
                <Link href={isIntranet ? "/" : "/intranet"} onClick={() => setIsMenuOpen(false)}>
                  {isIntranet ? "Site Public" : "Intranet"}
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
