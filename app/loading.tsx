'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Loading() {
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    // Rotation animation
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 5) % 360)
    }, 50)

    // Pulse animation
    const pulseInterval = setInterval(() => {
      setScale(prev => (prev === 1 ? 1.1 : 1))
    }, 800)

    return () => {
      clearInterval(rotationInterval)
      clearInterval(pulseInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-6">
        <div 
          className="relative w-24 h-24 transition-transform duration-800"
          style={{ 
            transform: `rotate(${rotation}deg) scale(${scale})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease-in-out'
          }}
        >
          <Image
            src="/logo.png"
            alt="Loading"
            fill
            priority
            className="object-contain"
          />
        </div>
        <p className="text-xl font-medium text-primary animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  )
}