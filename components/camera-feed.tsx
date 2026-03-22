"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import { backgrounds } from "@/lib/backgrounds"

interface CameraFeedProps {
  backgroundId: string
  sensitivity: number
  facingMode: "user" | "environment"
  cameraEnabled: boolean
  zoom: number
}

const CameraFeed = forwardRef<HTMLCanvasElement, CameraFeedProps>(
  ({ backgroundId, sensitivity, facingMode, cameraEnabled, zoom }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number>()
    const [isLoading, setIsLoading] = useState(true)
    const [isCameraReady, setIsCameraReady] = useState(false)
    const backgroundImage = useRef<HTMLImageElement | null>(null)
    const logoImage = useRef<HTMLImageElement | null>(null)

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement)

    useEffect(() => {
      const logo = new Image()
      logo.crossOrigin = "anonymous"
      logo.src = "/quantum-computing-club-logo.png"
      logo.onload = () => {
        logoImage.current = logo
      }
      logo.onerror = () => {
        console.error("Failed to load logo image")
      }
    }, [])

    useEffect(() => {
      if (!cameraEnabled) {
        if (videoRef.current?.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
          tracks.forEach((track) => track.stop())
          videoRef.current.srcObject = null
        }
        setIsCameraReady(false)
        setIsLoading(false)
        return
      }

      const initCamera = async () => {
        setIsLoading(true)
        setIsCameraReady(false)

        if (videoRef.current?.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
          tracks.forEach((track) => track.stop())
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          })

          if (videoRef.current) {
            videoRef.current.srcObject = stream
            setIsCameraReady(true)
            setIsLoading(false)
          }
        } catch (err) {
          console.error("Failed to access camera:", err)
          setIsLoading(false)
        }
      }

      initCamera()

      return () => {
        if (videoRef.current?.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
          tracks.forEach((track) => track.stop())
        }
      }
    }, [facingMode, cameraEnabled])

    useEffect(() => {
      const background = backgrounds.find((bg) => bg.id === backgroundId)
      if (background) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = background.url
        img.onload = () => {
          backgroundImage.current = img
        }
        img.onerror = () => {
          console.error("Failed to load background image:", background.url)
        }
      }
    }, [backgroundId])

    useEffect(() => {
      const processFrame = () => {
        const video = videoRef.current
        const canvas = canvasRef.current

        if (canvas) {
          const ctx = canvas.getContext("2d", { alpha: false })
          if (!ctx) return

          if (video && isCameraReady && video.videoWidth > 0) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
          } else if (canvas.width === 0) {
            canvas.width = 1280
            canvas.height = 720
          }

          if (canvas.width === 0 || canvas.height === 0) {
            animationRef.current = requestAnimationFrame(processFrame)
            return
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height)

          if (backgroundImage.current) {
            const bgWidth = canvas.width
            const bgHeight = canvas.height
            const bgAspect = backgroundImage.current.width / backgroundImage.current.height
            const canvasAspect = bgWidth / bgHeight

            let drawWidth = bgWidth
            let drawHeight = bgHeight
            let offsetX = 0
            let offsetY = 0

            if (bgAspect > canvasAspect) {
              drawWidth = bgHeight * bgAspect
              offsetX = (bgWidth - drawWidth) / 2
            } else {
              drawHeight = bgWidth / bgAspect
              offsetY = (bgHeight - drawHeight) / 2
            }

            ctx.drawImage(backgroundImage.current, offsetX, offsetY, drawWidth, drawHeight)
          } else {
            ctx.fillStyle = "#000000"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }

          if (video && isCameraReady && cameraEnabled) {
            const offscreenCanvas = document.createElement("canvas")
            offscreenCanvas.width = canvas.width
            offscreenCanvas.height = canvas.height
            const offctx = offscreenCanvas.getContext("2d")
            if (!offctx) return

            const zoomScale = zoom
            const scaledWidth = canvas.width * zoomScale
            const scaledHeight = canvas.height * zoomScale
            const offsetX = (canvas.width - scaledWidth) / 2
            const offsetY = (canvas.height - scaledHeight) / 2

            offctx.drawImage(video, offsetX, offsetY, scaledWidth, scaledHeight)

            const imageData = offctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height)
            const data = imageData.data

            const threshold = sensitivity
            const minGreenValue = Math.max(10, 60 - sensitivity * 0.8)

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]

              const isGreen = g > r + threshold && g > b + threshold && g > minGreenValue

              if (isGreen) {
                data[i + 3] = 0
              }
            }

            offctx.putImageData(imageData, 0, 0)
            ctx.drawImage(offscreenCanvas, 0, 0)
          }

          if (logoImage.current) {
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"

            const logoMaxWidth = canvas.width * 0.15
            const logoAspect = logoImage.current.width / logoImage.current.height
            const logoWidth = logoMaxWidth
            const logoHeight = logoWidth / logoAspect

            const padding = canvas.width * 0.02
            const logoX = canvas.width - logoWidth - padding
            const logoY = canvas.height - logoHeight - padding

            ctx.drawImage(logoImage.current, logoX, logoY, logoWidth, logoHeight)
          }
        }

        animationRef.current = requestAnimationFrame(processFrame)
      }

      animationRef.current = requestAnimationFrame(processFrame)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }, [isCameraReady, sensitivity, backgroundId, cameraEnabled, zoom])

    return (
      <div className="relative w-full bg-black aspect-video">
        <video ref={videoRef} autoPlay playsInline className="hidden" />
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
        {isLoading && cameraEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
              <p>Initializing camera...</p>
            </div>
          </div>
        )}
        {!cameraEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="text-white text-center bg-slate-800/80 px-6 py-4 rounded-lg">
              <p className="text-lg font-medium">Camera Off</p>
              <p className="text-sm text-blue-200 mt-1">Enable camera to see the green screen effect</p>
            </div>
          </div>
        )}
      </div>
    )
  },
)

CameraFeed.displayName = "CameraFeed"

export default CameraFeed
