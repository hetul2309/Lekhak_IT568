import React from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '@/assets/images/logo.png'
import { Button } from '@/components/ui/button'
import { RouteIndex } from '@/helpers/RouteName'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FFF5F0]">
      {/* Coral sunset background blobs */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-orange-100/80 to-transparent" />
      <div className="pointer-events-none absolute -left-20 top-20 h-80 w-80 rounded-full bg-orange-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-10 h-96 w-96 rounded-full bg-pink-400/20 blur-3xl" />

      <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_35px_60px_-30px_rgba(255,106,0,0.25)] border border-orange-100 p-10 w-full max-w-lg text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <img src={logo} alt="Lekhak" className="w-14 h-14 object-contain" />
        </div>
        <h1 className="text-4xl font-extrabold mb-2 text-gradient-primary">Lekhak</h1>
        <p className="text-gray-500 mb-8 text-base">A modern blogging platform to share thoughts and connect with readers.</p>
        <Button
          onClick={() => navigate(RouteIndex)}
          className="px-8 py-3 text-lg rounded-full bg-gradient-primary text-white font-semibold shadow-glow hover:opacity-90 transition-smooth"
        >
          Get Started →
        </Button>
      </div>
    </div>
  )
}

