'use client'

import { useEffect, useRef } from 'react'

export default function GradientBackground() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const x = (clientX / window.innerWidth) * 100
            const y = (clientY / window.innerHeight) * 100

            container.style.setProperty('--mouse-x', `${x}%`)
            container.style.setProperty('--mouse-y', `${y}%`)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 -z-10 overflow-hidden bg-black"
        >
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,0,255,0.1),transparent_50%)]" />

            {/* Animated Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" />
            <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-cyan-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-pink-600/10 blur-[140px] animate-pulse" style={{ animationDelay: '4s' }} />

            {/* Mouse Following Glow */}
            <div
                className="absolute w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-[100px] transition-transform duration-1000 ease-out"
                style={{
                    left: 'var(--mouse-x, 50%)',
                    top: 'var(--mouse-y, 50%)',
                    transform: 'translate(-50%, -50%)',
                }}
            />

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)',
                    backgroundSize: '4rem 4rem',
                    maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                }}
            />
        </div>
    )
}
