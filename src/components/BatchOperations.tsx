const TWS_URL = 'https://raw.githubusercontent.com/xxxvimalxxx/Mainframe-/main/tws%20user%20guide.doc'
const CA7_ZIP = '/CA7_User_Guide.zip'

export default function BatchOperations() {
  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold text-white mb-2">Batch Operations & User Guides</h1>
      <button
        onClick={() => handleDownload(TWS_URL, 'tws user guide.doc')}
        className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-lg font-medium px-10 py-4 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30"
      >
        Download TWS User Guide
      </button>
      <button
        onClick={() => handleDownload(CA7_ZIP, 'CA7_User_Guide.zip')}
        className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-lg font-medium px-10 py-4 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30"
      >
        Download CA7 User Guide
      </button>
    </div>
  )
}
