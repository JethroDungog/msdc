'use client'

import Link from 'next/link'

export default function PublicLandingClient() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex flex-col font-sans selection:bg-red-500/30">
      
      {/* ── Navigation Bar ──────────────────────────────── */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 sm:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-white tracking-tighter drop-shadow-md">MSDC.</h1>
        </div>
        <Link 
          href="/login"
          className="text-xs font-bold tracking-widest uppercase text-white/80 hover:text-white transition-colors px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 backdrop-blur-md"
        >
          Staff Login
        </Link>
      </nav>

      {/* ── Hero Section (Cinematic & Full Screen) ──────────────────────────────── */}
      <section className="relative w-full h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Beautiful Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2000&auto=format&fit=crop" 
            alt="Church Worship"
            className="w-full h-full object-cover object-center scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
          />
          {/* Elegant Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#fafafa] dark:to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-8 mt-16">
          <div className="inline-block">
            <p className="text-red-400 font-bold tracking-[0.3em] uppercase text-xs sm:text-sm mb-4 drop-shadow-md">
              Welcome Home
            </p>
          </div>
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter drop-shadow-xl">
            My Soul Desire <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-200">Church</span>
          </h2>
          <p className="text-lg sm:text-2xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            A place of worship, community, and spiritual growth. Join us as we seek God's presence and share His love with the world.
          </p>
        </div>
      </section>

      {/* ── Mission & Schedule (Combined) ──────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 sm:px-12 max-w-7xl mx-auto border-b border-black/5 dark:border-white/5">
        <div className="flex flex-col xl:flex-row gap-16 xl:gap-24 items-center">
          
          {/* Mission Side */}
          <div className="w-full xl:w-1/2 space-y-8 text-center xl:text-left">
            <div className="w-12 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto xl:mx-0 rounded-full" />
            <h3 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Our Mission</h3>
            <p className="text-xl sm:text-2xl text-gray-500 dark:text-gray-400 font-light leading-relaxed">
              We are a vibrant, faith-filled community dedicated to encountering God's love and transforming lives. 
              Through <span className="text-red-600 dark:text-red-400 font-medium">powerful worship</span>, 
              biblical teaching, and genuine fellowship, we aim to be a light in our city.
            </p>
          </div>

          {/* Schedule Side */}
          <div className="w-full xl:w-1/2 bg-black/[0.02] dark:bg-white/[0.02] p-8 sm:p-12 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-4 mb-10 justify-center xl:justify-start">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Service Schedule</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              <div className="group hover:-translate-y-1 transition-transform duration-300 text-center sm:text-left">
                <p className="text-sm font-bold tracking-widest text-red-600 dark:text-red-400 uppercase mb-2">Sunday Morning</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">9:00 AM</p>
                <p className="text-gray-400 text-sm mt-1">to 11:00 AM</p>
              </div>

              <div className="group hover:-translate-y-1 transition-transform duration-300 text-center sm:text-left">
                <p className="text-sm font-bold tracking-widest text-red-600 dark:text-red-400 uppercase mb-2">Sunday Afternoon</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">1:00 PM</p>
                <p className="text-gray-400 text-sm mt-1">to 3:00 PM</p>
              </div>

              <div className="group hover:-translate-y-1 transition-transform duration-300 text-center sm:text-left">
                <p className="text-sm font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-2">Midweek Service</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">7:00 PM</p>
                <p className="text-gray-400 text-sm mt-1">to 9:00 PM</p>
              </div>

              <div className="group hover:-translate-y-1 transition-transform duration-300 text-center sm:text-left">
                <p className="text-sm font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-2">Dawn Prayer</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">4:30 AM</p>
                <p className="text-gray-400 text-sm mt-1">to 7:00 AM</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Location ──────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 sm:px-12 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="w-full lg:w-1/3 space-y-6 text-center lg:text-left">
            <p className="text-red-600 dark:text-red-400 font-bold tracking-[0.2em] uppercase text-sm">Visit Us</p>
            <h3 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Our Location</h3>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              We'd love to see you in person. Join us for worship and fellowship at our main campus.
            </p>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 dark:shadow-none border border-black/5 dark:border-white/10 aspect-video group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d245.3406462732548!2d123.9465866102858!3d10.305797858001243!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a999dd9a0a5b7f%3A0xb945dc608c5d2ffa!2sMy%20Soul%20Desire%20Church!5e0!3m2!1sen!2sph!4v1780237632814!5m2!1sen!2sph" 
                className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-500" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>

        </div>
      </section>

      {/* ── Church Life (Gallery) ──────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 sm:px-12 border-t border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h3 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Church Life</h3>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-light">A glimpse into our community and gatherings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="group relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-gray-200 dark:bg-gray-800 shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=800&auto=format&fit=crop" 
                alt="Worship"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-red-400 font-bold tracking-widest uppercase text-xs mb-2">Gathering</p>
                <h4 className="text-2xl font-bold text-white leading-tight">Sunday Worship</h4>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-gray-200 dark:bg-gray-800 shadow-xl md:translate-y-12">
              <img 
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop" 
                alt="Community"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-red-400 font-bold tracking-widest uppercase text-xs mb-2">Fellowship</p>
                <h4 className="text-2xl font-bold text-white leading-tight">Midweek Studies</h4>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-gray-200 dark:bg-gray-800 shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1593113589914-07553257ecb1?q=80&w=800&auto=format&fit=crop" 
                alt="Outreach"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-red-400 font-bold tracking-widest uppercase text-xs mb-2">Missions</p>
                <h4 className="text-2xl font-bold text-white leading-tight">Community Outreach</h4>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="w-full py-12 text-center border-t border-black/5 dark:border-white/5 mt-auto bg-white dark:bg-[#0a0a0a]">
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">MSDC.</h2>
        <p className="text-sm text-gray-400 font-medium">
          © {new Date().getFullYear()} My Soul Desire Church. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
