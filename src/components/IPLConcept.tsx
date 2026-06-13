export default function IPLConcept() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair italic text-white mb-4">
            IPL Concept
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Initial Program Load — Mainframe IPL resources and references.
          </p>
        </div>

        <p className="text-white/70 leading-relaxed mb-8 text-sm sm:text-base">
          There is a dedicated YouTube playlist called "Mainframe IPL Process", but most IPL content on YouTube is more theoretical/slide-based rather than a live HMC demonstration.
        </p>

        <a
          href="https://www.youtube.com/playlist?list=PLflD7tVDSNAQPRAmR57hAa3yg1wS-EXw4"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#e8702a]/50 rounded-xl p-4 transition-all hover:scale-[1.01] text-white/80 hover:text-white text-sm sm:text-base"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-red-500 shrink-0">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          Mainframe IPL Process — YouTube Playlist
        </a>
      </div>
    </div>
  )
}
