"use client"

import { useState, useRef } from "react"
import CameraFeed from "@/components/camera-feed"
import BackgroundSelector from "@/components/background-selector"
import ControlPanel from "@/components/control-panel"
import PhotoGallery from "@/components/photo-gallery"

interface CapturedPhoto {
  id: string
  dataUrl: string
  timestamp: number
}

export default function Home() {
  const [selectedBackground, setSelectedBackground] = useState("snowy-forest")
  const [sensitivity, setSensitivity] = useState(30)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  const toggleCamera = () => {
    setCameraEnabled((prev) => !prev)
  }

  const handlePhotoCapture = (dataUrl: string) => {
    const newPhoto: CapturedPhoto = {
      id: `photo-${Date.now()}`,
      dataUrl,
      timestamp: Date.now(),
    }
    setCapturedPhotos((prev) => [...prev, newPhoto])
  }

  const handleDeletePhoto = (id: string) => {
    setCapturedPhotos((prev) => prev.filter((photo) => photo.id !== id))
  }

  const handleClearAll = () => {
    setCapturedPhotos([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-4 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-4xl font-bold text-white mb-2">Green Screen Magic</h1>
          <p className="text-blue-200 text-lg">Real-time background replacement with festive & quantum themes</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Camera Feed and Controls */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-blue-400/30 bg-black">
              <CameraFeed
                ref={canvasRef}
                backgroundId={selectedBackground}
                sensitivity={sensitivity}
                facingMode={facingMode}
                cameraEnabled={cameraEnabled}
                zoom={zoom}
              />
            </div>

            <ControlPanel
              sensitivity={sensitivity}
              onSensitivityChange={setSensitivity}
              canvasRef={canvasRef}
              zoom={zoom}
              onZoomChange={setZoom}
              cameraEnabled={cameraEnabled}
              facingMode={facingMode}
              onToggleFacing={toggleCameraFacing}
              onToggleCamera={toggleCamera}
              onPhotoCapture={handlePhotoCapture}
            />

            {capturedPhotos.length > 0 && (
              <PhotoGallery photos={capturedPhotos} onDeletePhoto={handleDeletePhoto} onClearAll={handleClearAll} />
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Background Selector */}
            <BackgroundSelector selected={selectedBackground} onSelect={setSelectedBackground} />
          </div>
        </div>

        <footer className="text-center py-6 mt-8 border-t border-blue-400/20">
          <p className="text-blue-200/70 text-sm">© 2025 Shruti Dusankar. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
