"use client"

import { Mail, MapPin, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Contactez-nous</h1>
        <p className="text-gray-500 mb-8">
          Nous sommes à votre disposition pour répondre à vos questions et vous accompagner dans vos démarches.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-900" />
                Téléphone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">21213</p>
              <p className="text-sm text-gray-500 mt-1">Lun-Dim: 24h/7j</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-900" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Secrétaire Idao</p>
              <p className="text-sm text-gray-500 mt-1">Nous répondons sous 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-900" />
                Adresse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Burton, Carcer Way</p>
              <p className="text-sm text-gray-500 mt-1">Los Santos, SA </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
