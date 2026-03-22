"use client"

import { Button } from "@/components/ui/button"
import { Download, Share2, Trash2, X } from "lucide-react"
import Image from "next/image"

interface CapturedPhoto {
  id: string
  dataUrl: string
  timestamp: number
}

interface PhotoGalleryProps {
  photos: CapturedPhoto[]
  onDeletePhoto: (id: string) => void
  onClearAll: () => void
}

export default function PhotoGallery({ photos, onDeletePhoto, onClearAll }: PhotoGalleryProps) {
  const handleDownloadAll = async () => {
    try {
      for (const photo of photos) {
        const a = document.createElement("a")
        a.href = photo.dataUrl
        a.download = `green-screen-${photo.timestamp}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        // Add small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error("Failed to download photos:", error)
    }
  }

  const handleShareAll = async () => {
    try {
      // Check if Web Share API is supported
      if (!navigator.share) {
        alert("Sharing is not supported on this device. Please use Download All instead.")
        return
      }

      // Convert data URLs to File objects
      const files = await Promise.all(
        photos.map(async (photo) => {
          const response = await fetch(photo.dataUrl)
          const blob = await response.blob()
          return new File([blob], `green-screen-${photo.timestamp}.png`, { type: "image/png" })
        }),
      )

      // Share files
      await navigator.share({
        files,
        title: "Green Screen Photos",
        text: `Sharing ${photos.length} photo${photos.length > 1 ? "s" : ""} from Green Screen Magic`,
      })
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Failed to share photos:", error)
        alert("Failed to share photos. Please try Download All instead.")
      }
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-blue-400/20 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Captured Photos ({photos.length})</h3>
        <Button
          onClick={onClearAll}
          variant="outline"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white border-none"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <div className="aspect-video rounded-lg overflow-hidden bg-slate-700 border border-blue-400/20">
              <Image
                src={photo.dataUrl || "/placeholder.svg"}
                alt={`Captured at ${new Date(photo.timestamp).toLocaleTimeString()}`}
                width={300}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => onDeletePhoto(photo.id)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-xs text-slate-400 mt-1 text-center">{new Date(photo.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleShareAll}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share All
        </Button>
        <Button
          onClick={handleDownloadAll}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </div>

      <p className="text-xs text-slate-400 mt-3 text-center">Photos are stored temporarily in this session only</p>
    </div>
  )
}
