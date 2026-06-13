import { useEffect, useRef, useState } from 'react'
import RevealLayer from './RevealLayer'

const BG_IMAGE_1 = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85'
const BG_IMAGE_2 = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85'

export default function HeroSection() {
  const mouse = useRef({ x: -999, y: -999 })
  const smooth = useRef({ x: -999, y: -999 })
  const rafRef = useRef<number>(0)
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 })

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    const animate = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1
      setCursorPos({ x: smooth.current.x, y: smooth.current.y })
      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouse)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <section
      className="relative w-full overflow-hidden h-screen bg-black"
      style={{ height: '100dvh' }}
    >
      {/* Base image (z-10) */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat hero-zoom z-10"
        style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
      />

      {/* Reveal layer (z-30) */}
      <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />

      {/* Heading (z-50) */}
      <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 sm:px-10 pointer-events-none z-50">
        <h1 className="text-white leading-[1.1] max-w-5xl mx-auto">
          <span
            className="block font-normal text-lg sm:text-2xl md:text-3xl hero-anim hero-reveal"
            style={{ animationDelay: '0.25s' }}
          >
            "Running a mainframe is like running a nuclear power plant — boring when it's done right, catastrophic when it's done wrong."
          </span>
        </h1>
      </div>

      {/* Bottom-left paragraph (z-50) */}
      <div className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade"
        style={{ animationDelay: '0.7s' }}>
        <p className="text-sm text-white/80 leading-relaxed">
          "Mainframes are the ultimate 'if it ain't broke, don't fix it' technology."
        </p>
      </div>

      {/* Bottom-right block (z-50) */}
      <div
        className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
        style={{ animationDelay: '0.85s' }}
      >
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
          "We used to say 'The mainframe is dying.' Then we realized it's been dying for 50 years while still handling 30 billion transactions a day."
        </p>
        <a
          href="https://www.ibm.com/think/topics/mainframe"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30 inline-block"
        >
          Start Digging
        </a>
      </div>

      {/* Creator credit (z-50) */}
      <div className="fixed bottom-2 right-3 z-50">
        <span className="text-white/40 text-[10px]">Created by Vimal</span>
      </div>
    </section>
  )
}
