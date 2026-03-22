"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Camera, ZoomIn, ZoomOut, Video, VideoOff, Repeat } from "lucide-react"

interface ControlPanelProps {
  sensitivity: number
  onSensitivityChange: (value: number) => void
  canvasRef: React.RefObject<HTMLCanvasElement>
  zoom: number
  onZoomChange: (zoom: number) => void
  cameraEnabled: boolean
  facingMode: "user" | "environment"
  onToggleFacing: () => void
  onToggleCamera: () => void
  onPhotoCapture: (dataUrl: string) => void
}

export default function ControlPanel({
  sensitivity,
  onSensitivityChange,
  canvasRef,
  zoom,
  onZoomChange,
  cameraEnabled,
  facingMode,
  onToggleFacing,
  onToggleCamera,
  onPhotoCapture,
}: ControlPanelProps) {
  const handleCapture = () => {
    try {
      const canvas = canvasRef.current
      if (!canvas) throw new Error("Canvas not found")

      // Get data URL for storing in state
      const dataUrl = canvas.toDataURL("image/png", 1.0)
      onPhotoCapture(dataUrl)

      // Also trigger immediate download
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error("Failed to create image")

          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `green-screen-${Date.now()}.png`

          // Trigger download
          document.body.appendChild(a)
          a.click()

          // Cleanup
          setTimeout(() => {
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }, 100)
        },
        "image/png",
        1.0,
      )
    } catch (error) {
      console.error("Failed to capture image:", error)
    }
  }

  const facingButtonColor = !cameraEnabled
    ? "bg-slate-500 hover:bg-slate-600"
    : facingMode === "user"
      ? "bg-blue-500 hover:bg-blue-600"
      : "bg-sky-600 hover:bg-sky-700"

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={handleCapture}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Camera size={20} />
        Capture Photo
      </Button>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-blue-400/20 shadow-lg">
        <h3 className="text-sm font-semibold text-white mb-3">Camera Zoom</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
            disabled={!cameraEnabled || zoom <= 0.5}
            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              disabled={!cameraEnabled}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-400 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0.5x</span>
              <span className="text-blue-300 font-semibold">{zoom.toFixed(1)}x</span>
              <span>3.0x</span>
            </div>
          </div>
          <button
            onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
            disabled={!cameraEnabled || zoom >= 3}
            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-blue-400/20 shadow-lg">
        <h3 className="text-sm font-semibold text-white mb-3">Camera Controls</h3>
        <div className="flex gap-3">
          <Button
            onClick={onToggleFacing}
            variant="outline"
            className={`flex-1 ${facingButtonColor} text-white border-none`}
          >
            <Repeat className="w-4 h-4 mr-2" />
            {facingMode === "user" ? "Switch to Back" : "Switch to Front"}
          </Button>
          <Button
            onClick={onToggleCamera}
            variant="outline"
            className={`flex-1 border-none ${
              cameraEnabled ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {cameraEnabled ? <VideoOff className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />}
            {cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-blue-400/20 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-6">Controls & Tips</h2>

        {/* Sensitivity Slider */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-blue-300 mb-3">Green Screen Sensitivity</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="100"
              value={sensitivity}
              onChange={(e) => onSensitivityChange(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
            <span className="text-white font-semibold min-w-8 text-right">{sensitivity}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Lower = more aggressive removal for dark lighting, Higher = precise edges
          </p>
        </div>

        {/* Tips Section */}
        <div className="pt-4 border-t border-slate-700">
          <h3 className="text-sm font-semibold text-cyan-300 mb-3">Tips</h3>
          <ul className="text-xs text-slate-300 space-y-2">
            <li>• Ensure good lighting on your green screen</li>
            <li>• Adjust sensitivity for better edge detection</li>
            <li>• Avoid wearing green clothes</li>
            <li>• Use a plain, evenly-lit green background</li>
            <li>• For low light, set sensitivity to 20-40</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
