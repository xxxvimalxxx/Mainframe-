import { useState, useRef, useEffect, useCallback, type FormEvent, type ReactNode } from 'react'

interface ThinkingStep {
  step: string
  content: string
}

interface WebSource {
  title: string
  url: string
}

interface Message {
  role: 'user' | 'assistant'
  text: string
  thinking?: string
  thinkingSteps?: ThinkingStep[]
  thinkingExpanded?: boolean
  webSources?: WebSource[]
  webResearch?: boolean
}

function linkify(text: string): ReactNode {
  const urlRegex = /(https?:\/\/[^\s\)\]>}]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e8702a] underline hover:text-[#ff8c42] transition-colors break-all"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

function MatrixScreen() {
  return (
    <g>
      <rect x="0" y="0" width="52" height="32" rx="3" fill="#0d2818" />
      <text x="4" y="10" fill="#00ff41" fontSize="6" fontFamily="monospace" opacity={0.9}>1</text>
      <text x="14" y="12" fill="#00ff41" fontSize="5" fontFamily="monospace" opacity={0.5}>0</text>
      <text x="24" y="9" fill="#00ff41" fontSize="6" fontFamily="monospace" opacity={0.7}>1</text>
      <text x="36" y="11" fill="#00ff41" fontSize="5" fontFamily="monospace" opacity={0.6}>0</text>
      <text x="44" y="14" fill="#00ff41" fontSize="6" fontFamily="monospace" opacity={0.8}>1</text>
      <text x="6" y="20" fill="#00ff41" fontSize="5" fontFamily="monospace" opacity={0.4}>0</text>
      <text x="18" y="22" fill="#00ff41" fontSize="6" fontFamily="monospace" opacity={0.8}>1</text>
      <text x="30" y="19" fill="#00ff41" fontSize="5" fontFamily="monospace" opacity={0.3}>0</text>
      <text x="40" y="23" fill="#00ff41" fontSize="6" fontFamily="monospace" opacity={0.7}>1</text>
      <text x="10" y="28" fill="#00ff41" fontSize="5" fontFamily="monospace" opacity={0.5}>0</text>
      <text x="22" y="29" fill="#00ff41" fontSize="5" fontFamily="monospace" opacity={0.6}>1</text>
      <text x="34" y="27" fill="#00ff41" fontSize="5" fontFamily="monospace" opacity={0.4}>0</text>
      <text x="44" y="30" fill="#00ff41" fontSize="5" fontFamily="monospace" opacity={0.7}>1</text>
    </g>
  )
}

function RoamingRobot() {
  return (
    <div className="fixed inset-0 z-[199] pointer-events-none" style={{ overflow: 'visible' }}>
      <div style={{ animation: 'roam 18s linear infinite', width: 0, height: 0, overflow: 'visible' }}>
        <svg width="80" height="90" viewBox="0 0 80 90" fill="none" className="drop-shadow-xl" style={{ position: 'absolute', left: '-40px', top: '-45px', overflow: 'visible' }}>
          <rect x="14" y="20" width="52" height="38" rx="5" fill="#222" stroke="#e8702a" strokeWidth="1.5" />
          <rect x="14" y="20" width="52" height="38" rx="5" fill="#111" stroke="#0a0a0a" strokeWidth="0.5" />
          <rect x="16" y="22" width="48" height="34" rx="3" fill="#0a0a0a" stroke="#00ff41" strokeWidth="0.5" opacity={0.4} style={{ animation: 'light-pulse 2.5s ease-in-out infinite' }} />
          <clipPath id="screenClip">
            <rect x="16" y="22" width="48" height="34" rx="3" />
          </clipPath>
          <g clipPath="url(#screenClip)">
            <MatrixScreen />
          </g>
          <rect x="36" y="58" width="8" height="4" rx="1" fill="#444" />
          <rect x="28" y="62" width="24" height="24" rx="4" fill="#5a5a6a" stroke="#7a7a8a" strokeWidth="1" />
          <rect x="32" y="66" width="16" height="8" rx="1" fill="#e8702a" opacity="0.3" />
          <circle cx="40" cy="56" r="9" fill="#6a6a7a" stroke="#8a8a9a" strokeWidth="1" />
          <circle cx="36" cy="54" r="2" fill="#4ade80" style={{ animation: 'blink 3s infinite' }} />
          <circle cx="44" cy="54" r="2" fill="#4ade80" style={{ animation: 'blink 3s 0.15s infinite' }} />
          <rect x="37" y="59" width="6" height="1.5" rx="0.5" fill="#444" />
          <line x1="40" y1="47" x2="40" y2="42" stroke="#8a8a9a" strokeWidth="1.5" />
          <circle cx="40" cy="41" r="2" fill="#e8702a" style={{ animation: 'light-pulse 0.8s ease-in-out infinite' }} />
          <line x1="28" y1="68" x2="14" y2="40" stroke="#7a7a8a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="14" cy="40" r="2" fill="#6a6a7a" />
          <line x1="52" y1="68" x2="66" y2="40" stroke="#7a7a8a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="66" cy="40" r="2" fill="#6a6a7a" />
          <g style={{ animation: 'walk 0.35s ease-in-out infinite' }}>
            <line x1="34" y1="86" x2="30" y2="106" stroke="#6a6a7a" strokeWidth="3.5" strokeLinecap="round"
              style={{ transformOrigin: '34px 86px', animation: 'leg-left 0.35s ease-in-out infinite' }} />
            <line x1="46" y1="86" x2="50" y2="106" stroke="#6a6a7a" strokeWidth="3.5" strokeLinecap="round"
              style={{ transformOrigin: '46px 86px', animation: 'leg-right 0.35s ease-in-out infinite' }} />
            <circle cx="30" cy="107" r="3.5" fill="#555" />
            <circle cx="50" cy="107" r="3.5" fill="#555" />
          </g>
        </svg>
      </div>
    </div>
  )
}

function ThinkingIndicator({ phase }: { phase: 'researching' | 'thinking' | 'responding' }) {
  const labels = {
    researching: { title: 'Researching', desc: 'Searching the internet for relevant information...' },
    thinking: { title: 'Thinking', desc: 'Analyzing, reasoning, formulating...' },
    responding: { title: 'Responding', desc: 'Generating comprehensive answer...' },
  }
  const label = labels[phase]

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 bg-[#e8702a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-[#e8702a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-[#e8702a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[#e8702a] text-xs font-medium">{label.title}</span>
        <span className="text-white/30 text-[10px]">{label.desc}</span>
      </div>
    </div>
  )
}

function WebSourcesBadge({ sources }: { sources: WebSource[] }) {
  if (!sources || sources.length === 0) return null

  return (
    <div className="mt-2 pt-2 border-t border-white/10">
      <div className="text-[10px] text-white/30 font-medium mb-1">Sources from web research:</div>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#e8702a]/70 hover:text-[#e8702a] underline truncate max-w-[200px]"
          >
            {s.title}
          </a>
        ))}
      </div>
    </div>
  )
}

function ThinkingSection({ thinking, steps, expanded, onToggle }: {
  thinking?: string
  steps?: ThinkingStep[]
  expanded: boolean
  onToggle: () => void
}) {
  if (!thinking) return null

  return (
    <div className="mb-2 border border-[#e8702a]/20 rounded-lg overflow-hidden bg-[#e8702a]/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#e8702a] hover:bg-[#e8702a]/10 transition-colors"
      >
        <span className="flex items-center gap-1.5 font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10h-10V2z" />
            <path d="M12 12 2.93 17.08" />
            <path d="M14 2.5a9.14 9.14 0 0 1 7.5 7.5" />
          </svg>
          Chain-of-Thought Reasoning
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div className="px-3 pb-3 text-xs text-white/60 space-y-2 max-h-60 overflow-y-auto">
          {steps && steps.length > 0 ? (
            steps.map((s, i) => (
              <div key={i} className="border-l-2 border-[#e8702a]/30 pl-3 py-1">
                <div className="text-[#e8702a] text-[10px] font-semibold uppercase tracking-wider mb-0.5">{s.step}</div>
                <div className="text-white/50 leading-relaxed">{s.content}</div>
              </div>
            ))
          ) : (
            <div className="text-white/50 leading-relaxed whitespace-pre-wrap">{thinking}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Hi! I\'m your mainframe AI assistant. I can search the internet for the latest mainframe information to give you comprehensive answers. Ask me anything about mainframes, console commands, JCL, or the content on this site.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [thinkingPhase, setThinkingPhase] = useState<'idle' | 'researching' | 'thinking' | 'responding'>('idle')
  const [showPrompt, setShowPrompt] = useState(true)

  const [chatPos, setChatPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const posInitialized = useRef(false)
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 })

  const listRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const promptTimer = useRef<ReturnType<typeof setInterval>>(undefined as any)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, thinkingPhase])

  useEffect(() => {
    if (!posInitialized.current) {
      posInitialized.current = true
      setChatPos({
        x: Math.max(8, (window.innerWidth - 480) / 2),
        y: Math.max(8, window.innerHeight - 580 - 130),
      })
    }
  }, [])

  useEffect(() => {
    promptTimer.current = setInterval(() => {
      setShowPrompt(true)
      setTimeout(() => setShowPrompt(false), 5000)
    }, 15000)

    const first = setTimeout(() => {
      setShowPrompt(true)
      setTimeout(() => setShowPrompt(false), 5000)
    }, 3000)

    return () => {
      clearInterval(promptTimer.current)
      clearTimeout(first)
    }
  }, [])

  useEffect(() => {
    if (open) setShowPrompt(false)
  }, [open])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        open &&
        chatRef.current &&
        !chatRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setDragging(true)
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      startPosX: chatPos.x,
      startPosY: chatPos.y,
    }
  }, [chatPos])

  useEffect(() => {
    if (!dragging) return

    const handleMove = (clientX: number, clientY: number) => {
      setChatPos({
        x: dragRef.current.startPosX + (clientX - dragRef.current.startX),
        y: dragRef.current.startPosY + (clientY - dragRef.current.startY),
      })
    }

    const handleMouse = (e: MouseEvent) => { e.preventDefault(); handleMove(e.clientX, e.clientY) }
    const handleTouch = (e: TouchEvent) => { handleMove(e.touches[0].clientX, e.touches[0].clientY) }

    const stop = () => setDragging(false)

    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('mouseup', stop)
    window.addEventListener('touchmove', handleTouch, { passive: true })
    window.addEventListener('touchend', stop)

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('mouseup', stop)
      window.removeEventListener('touchmove', handleTouch)
      window.removeEventListener('touchend', stop)
    }
  }, [dragging])

  function toggleThinking(index: number) {
    setMessages(prev => prev.map((msg, i) =>
      i === index ? { ...msg, thinkingExpanded: !msg.thinkingExpanded } : msg
    ))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)
    setThinkingPhase('researching')

    try {
      const history = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.text,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Error ${res.status}`)
      }

      setThinkingPhase('thinking')
      const data = await res.json()
      setThinkingPhase('responding')
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply,
          thinking: data.thinking,
          thinkingSteps: data.thinkingSteps,
          thinkingExpanded: false,
          webSources: data.webSources,
          webResearch: data.webResearch,
        },
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}.` },
      ])
    } finally {
      setLoading(false)
      setThinkingPhase('idle')
    }
  }

  return (
    <>
      <RoamingRobot />

      {!open && showPrompt && (
        <div
          className="fixed bottom-44 left-1/2 -translate-x-1/2 z-[199] animate-bounce cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <div className="bg-[#e8702a] text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Ask me anything!
          </div>
        </div>
      )}

      {open && (
        <div
          ref={chatRef}
          className="fixed z-[200] w-[480px] max-w-[calc(100vw-16px)] h-[580px] max-h-[calc(100vh-16px)] bg-zinc-900 border border-white/20 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
          style={{ left: chatPos.x, top: chatPos.y }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-white/10 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={e => handleDragStart(e.clientX, e.clientY)}
            onTouchStart={e => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
          >
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e8702a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="2" /><path d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
              </svg>
              <span className="text-white text-sm font-semibold">AI Assistant</span>
              {thinkingPhase !== 'idle' && (
                <span className="text-[10px] text-[#e8702a] ml-1 animate-pulse">
                  {thinkingPhase === 'researching' ? 'searching web...' : thinkingPhase === 'thinking' ? 'thinking...' : 'responding...'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#e8702a] text-white rounded-br-md'
                        : 'bg-white/10 text-white/90 rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'assistant' && msg.thinking ? (
                      <div>
                        {msg.webResearch && (
                          <div className="flex items-center gap-1 mb-1.5">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e8702a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            <span className="text-[10px] text-[#e8702a]/60">Internet research enabled</span>
                          </div>
                        )}
                        <ThinkingSection
                          thinking={msg.thinking}
                          steps={msg.thinkingSteps}
                          expanded={!!msg.thinkingExpanded}
                          onToggle={() => toggleThinking(i)}
                        />
                        <div>{linkify(msg.text)}</div>
                        {msg.webSources && <WebSourcesBadge sources={msg.webSources} />}
                      </div>
                    ) : (
                      linkify(msg.text)
                    )}
                  </div>
                </div>
              </div>
            ))}

            {(thinkingPhase === 'researching' || thinkingPhase === 'thinking') && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl rounded-bl-md overflow-hidden">
                  <ThinkingIndicator phase={thinkingPhase} />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-3 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about mainframes..."
              disabled={loading}
              className="flex-1 bg-white/10 text-white placeholder-white/30 text-sm rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-[#e8702a]/50 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#e8702a] hover:bg-[#d2611f] disabled:opacity-40 text-white rounded-xl px-3.5 py-2.5 transition-all active:scale-95"
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]">
        <button
          ref={buttonRef}
          onClick={() => setOpen(o => !o)}
          className="bg-[#e8702a] hover:bg-[#d2611f] text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg shadow-[#e8702a]/30 transition-all hover:scale-110 active:scale-95"
          aria-label="Toggle AI assistant"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    </>
  )
}
