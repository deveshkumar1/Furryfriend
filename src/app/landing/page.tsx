"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import dynamic from 'next/dynamic';
const LoginModal = dynamic(() => import('@/components/shared/LoginModal'), { ssr: false });

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="w-full z-20 relative">
        <div className="flex items-center justify-between px-4 md:px-16 py-4 bg-purple-700 bg-opacity-95">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="inline-block w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 2C13.1046 2 14 2.89543 14 4V5.38268C15.1652 5.76165 16 6.87827 16 8.17157V10.5C16 11.3284 15.3284 12 14.5 12H9.5C8.67157 12 8 11.3284 8 10.5V8.17157C8 6.87827 8.83481 5.76165 10 5.38268V4C10 2.89543 10.8954 2 12 2Z" fill="#9333ea"/><circle cx="12" cy="17" r="5" fill="#9333ea"/></svg>
              </span>
              PetNyra
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="#features" className="text-white font-medium hover:underline">Features</Link>
            <Link href="#why" className="text-white font-medium hover:underline">Why PetNyra</Link>
            <Link href="#" className="text-white font-medium hover:underline">Support</Link>
            <Button
              className="bg-white text-purple-700 font-bold px-6 py-2 rounded-full shadow hover:bg-purple-100 transition"
              onClick={() => setShowLogin(true)}
            >
              Log In / Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with background image and overlay */}
      <section className="relative w-full min-h-[50vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: 'url(/Landing_page_image.jpeg)' }} />
        <div className="absolute inset-0 bg-purple-900/60" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 md:px-0 py-16 gap-6">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white text-center drop-shadow-lg max-w-3xl">
            Welcome to PetNyra: Your Complete Pet Care Companion
          </h1>
          <p className="text-lg md:text-2xl text-white/90 text-center max-w-2xl drop-shadow">
            Comprehensive pet health, happiness, and future marketplace—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
            <Button
              className="w-full sm:w-auto text-lg py-4 px-8 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow"
              onClick={() => setShowLogin(true)}
            >
              Get Started - Log In / Sign Up
            </Button>
  {/* Login Modal */}
  <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
            <a href="#features" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto text-lg py-4 px-8 border-white text-white hover:bg-white/10 rounded-full shadow">Discover More</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 bg-purple-900 text-gray-200 text-center mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/about" className="hover:underline">About Us</Link>
            <Link href="/features" className="hover:underline">Features</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" aria-label="Twitter" className="hover:text-blue-400">🐦</a>
            <a href="#" aria-label="Instagram" className="hover:text-pink-400">📸</a>
            <a href="#" aria-label="Facebook" className="hover:text-blue-600">📘</a>
          </div>
        </div>
        <div className="mt-4 text-sm">© 2024 PetNyra. All rights reserved.</div>
      </footer>
    </main>
  );
}
