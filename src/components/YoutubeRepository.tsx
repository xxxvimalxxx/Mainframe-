const sections = [
  {
    title: 'JCL (Job Control Language) — Batch Operations',
    links: [
      {
        label: 'Kumar ITChannel — Mainframe JCL Practical Tutorial series',
        url: 'https://www.youtube.com/playlist?list=PLLcYGaQ7eeuTQGWRJ_B04qPowNWuHHfaz',
      },
      {
        label: 'Topictrick — JCL Complete Reference playlist',
        url: 'https://www.youtube.com/playlist?list=PLfg9ycqfY2SW-0stiP_gEimzvCkbfseDM',
      },
      {
        label: 'JCL Introduction — Part 1 (Vol Revised)',
        url: 'https://www.youtube.com/watch?v=bSdNNDscccg',
      },
      {
        label: 'MainFrame z/OS Introduction to JCL',
        url: 'https://www.youtube.com/watch?v=tfpCB0bhp_Q',
      },
    ],
  },
  {
    title: 'Console Operations',
    links: [
      {
        label: 'Maintec — Comprehensive batch & console course',
        url: 'https://maintec.com/mainframe-batch-and-console/',
      },
      {
        label: 'ibmmainframer.com — Curated tutorial videos (JCL, COBOL, Mainframe)',
        url: 'https://www.ibmmainframer.com/tutorialvideos/mainframe-tutorial-videos',
      },
    ],
  },
]

export default function YoutubeRepository() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair italic text-white mb-4">
            YouTube Repository
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Curated collection of mainframe learning resources.
          </p>
        </div>

        {sections.map((section, idx) => (
          <div key={idx} className="mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6 border-b border-white/10 pb-3">
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.links.map((link, li) => (
                <a
                  key={li}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#e8702a]/50 rounded-xl p-4 transition-all hover:scale-[1.01]"
                >
                  <span className="text-white/80 hover:text-white text-sm sm:text-base leading-relaxed">
                    {link.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
