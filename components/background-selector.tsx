"use client"

import { backgrounds } from "@/lib/backgrounds"
import { useState } from "react"

interface BackgroundSelectorProps {
  selected: string
  onSelect: (id: string) => void
}

type CategoryType = "christmas" | "quantum" | "diwali" | "halloween"

export default function BackgroundSelector({ selected, onSelect }: BackgroundSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("christmas")

  // Group backgrounds by category
  const christmas = backgrounds.filter((bg) => bg.category === "christmas")
  const quantum = backgrounds.filter((bg) => bg.category === "quantum")
  const diwali = backgrounds.filter((bg) => bg.category === "diwali")
  const halloween = backgrounds.filter((bg) => bg.category === "halloween")

  const categoryMap = {
    christmas,
    quantum,
    diwali,
    halloween,
  }

  const displayBackgrounds = categoryMap[activeCategory]

  const getCategoryColor = (category: CategoryType, isActive: boolean) => {
    if (!isActive) return "bg-slate-700 text-slate-300 hover:bg-slate-600"
    switch (category) {
      case "christmas":
        return "bg-red-500 text-white"
      case "quantum":
        return "bg-cyan-500 text-white"
      case "diwali":
        return "bg-amber-500 text-white"
      case "halloween":
        return "bg-orange-500 text-white"
    }
  }

  const getActiveRingColor = () => {
    switch (activeCategory) {
      case "christmas":
        return "ring-red-400"
      case "quantum":
        return "ring-cyan-400"
      case "diwali":
        return "ring-amber-400"
      case "halloween":
        return "ring-orange-400"
    }
  }

  const getActiveBorderColor = () => {
    switch (activeCategory) {
      case "christmas":
        return "border-red-400"
      case "quantum":
        return "border-cyan-400"
      case "diwali":
        return "border-amber-400"
      case "halloween":
        return "border-orange-400"
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-blue-400/20 shadow-lg flex flex-col h-full">
      <h2 className="text-lg font-bold text-white mb-3">Backgrounds</h2>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setActiveCategory("christmas")}
          className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${getCategoryColor("christmas", activeCategory === "christmas")}`}
        >
          Christmas ({christmas.length})
        </button>
        <button
          onClick={() => setActiveCategory("quantum")}
          className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${getCategoryColor("quantum", activeCategory === "quantum")}`}
        >
          Quantum ({quantum.length})
        </button>
        <button
          onClick={() => setActiveCategory("diwali")}
          className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${getCategoryColor("diwali", activeCategory === "diwali")}`}
        >
          Diwali ({diwali.length})
        </button>
        <button
          onClick={() => setActiveCategory("halloween")}
          className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${getCategoryColor("halloween", activeCategory === "halloween")}`}
        >
          Halloween ({halloween.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3 pr-2">
          {displayBackgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onSelect(bg.id)}
              className={`relative group rounded-lg overflow-hidden transition-all duration-200 ${
                selected === bg.id
                  ? `ring-3 ${getActiveRingColor()} scale-[1.02]`
                  : "hover:scale-[1.02] hover:shadow-lg"
              }`}
            >
              <div className="aspect-video">
                <img src={bg.url || "/placeholder.svg"} alt={bg.name} className="w-full h-full object-cover" />
              </div>
              <div
                className={`absolute inset-0 ${selected === bg.id ? "bg-black/20" : "bg-black/40 group-hover:bg-black/20"} transition-colors`}
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <span className="text-xs font-semibold text-white block text-left leading-tight">{bg.name}</span>
              </div>
              {selected === bg.id && (
                <div
                  className={`absolute inset-0 border-3 ${getActiveBorderColor()}`}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
