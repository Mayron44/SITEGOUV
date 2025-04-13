"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CarouselImage {
  src: string
  alt: string
}

interface ImageCarouselProps {
  images: CarouselImage[]
  autoplayInterval?: number
}

export default function ImageCarousel({ images, autoplayInterval = 5000 }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<CarouselImage[]>([])

  useEffect(() => {
    // Validate and filter images to ensure they have valid sources
    const validImages = images.filter((img) => img.src && typeof img.src === "string")

    // If no valid images, use placeholders
    if (validImages.length === 0) {
      setLoadedImages([
        { src: "/placeholder.svg?height=600&width=1200", alt: "Placeholder" },
        { src: "/placeholder.svg?height=600&width=1200", alt: "Placeholder" },
      ])
    } else {
      setLoadedImages(validImages)
    }
  }, [images])

  // Vérifier que les boutons du carrousel fonctionnent correctement

  const goToNext = () => {
    if (loadedImages.length <= 1) return
    setCurrentIndex((prevIndex) => (prevIndex === loadedImages.length - 1 ? 0 : prevIndex + 1))
  }

  const goToPrevious = () => {
    if (loadedImages.length <= 1) return
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? loadedImages.length - 1 : prevIndex - 1))
  }

  const goToSlide = (index: number) => {
    if (index >= 0 && index < loadedImages.length) {
      setCurrentIndex(index)
    }
  }

  useEffect(() => {
    if (loadedImages.length <= 1) return

    const interval = setInterval(goToNext, autoplayInterval)
    return () => clearInterval(interval)
  }, [autoplayInterval, loadedImages.length])

  if (loadedImages.length === 0) {
    return (
      <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Images */}
      <div
        className="w-full h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)`, display: "flex" }}
      >
        {loadedImages.map((image, index) => (
          <div key={index} className="w-full h-full flex-shrink-0" style={{ position: "relative" }}>
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              fill
              priority={index === 0}
              className="object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=600&width=1200"
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows - only show if more than one image */}
      {loadedImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full h-10 w-10"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous slide</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full h-10 w-10"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next slide</span>
          </Button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {loadedImages.map((_, index) => (
              <button
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => goToSlide(index)}
              >
                <span className="sr-only">Go to slide {index + 1}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
