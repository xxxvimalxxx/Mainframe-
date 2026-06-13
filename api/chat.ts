/// <reference types="node" />

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const MODELS = {
  'llama-3.3-70b-versatile': { name: 'Llama 3.3 70B', provider: 'Meta' },
  'llama-3.1-8b-instant': { name: 'Llama 3.1 8B', provider: 'Meta' },
  'mixtral-8x7b-32768': { name: 'Mixtral 8x7B', provider: 'Mistral' },
  'meta-llama/llama-4-scout-17b-16e-instruct': { name: 'Llama 4 Scout 17B', provider: 'Meta' },
  'qwen/qwen3-32b': { name: 'Qwen3 32B', provider: 'Alibaba' },
  'moonshotai/kimi-k2-instruct': { name: 'Kimi K2', provider: 'Moonshot' },
} as const

type ModelKey = keyof typeof MODELS

const MAINFRAME_KEYWORDS = [
  'mainframe', 'z/os', 'zos', 'ibm', 'jcl', 'cobol', 'vsam', 'cics', 'ims',
  'db2', 'tso', 'isdn', 'sms', 'dasd', 'tape', 'ipl', 'console', 'batch',
  'mvs', 'vtam', 'racf', 'tws', 'tivoli', 'hsm', 'dfhsm', 'tso/e',
  'sysplex', 'jes', 'jes2', 'jes3', 'cics', 'pds', 'pdse', 'gdg',
  'mips', 'mib', 'hipersockets', 'channel', 'escon', 'ficon', 'z/os',
  'z/osmf', 'hdl', 'syslog', 'sdsf', 'spool', 'job', 'proc', 'procstep',
  'dd', 'ddname', 'dsname', 'volume', 'unit', 'space', 'cyl', 'trk',
  'blksize', 'lrecl', 'recfm', 'ibm', 'mainframe computer', 'zseries',
  'z series', 'system z', 'linux on z', 'z/vm', 'z/vse', 'z/tpf',
  'mainframe security', 'mainframe storage', 'mainframe network',
  'mainframe console', 'mainframe operator', 'mainframe programmer',
  'mainframe administrator', 'mainframe architect',
  '390', 'system/390', 's/390',
]

function isMainframeQuery(query: string): boolean {
  const lower = query.toLowerCase()
  return MAINFRAME_KEYWORDS.some(kw => lower.includes(kw))
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function searchDuckDuckGo(query: string): Promise<{ title: string; snippet: string; url: string }[]> {
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    )
    if (!res.ok) return []

    const data = await res.json()
    const results: { title: string; snippet: string; url: string }[] = []

    if (data.AbstractText && data.AbstractURL) {
      results.push({
        title: data.AbstractSource ?? 'Wikipedia',
        snippet: data.AbstractText.slice(0, 300),
        url: data.AbstractURL,
      })
    }

    const topics = data.RelatedTopics ?? []
    for (const topic of topics) {
      if (results.length >= 5) break
      if (topic.Text && topic.FirstURL) {
        results.push({
          title: topic.Text.split(' - ')[0] ?? topic.Text.slice(0, 80),
          snippet: topic.Text.slice(0, 300),
          url: topic.FirstURL,
        })
      }
      if (topic.Topics) {
        for (const sub of topic.Topics) {
          if (results.length >= 5) break
          if (sub.Text && sub.FirstURL) {
            results.push({
              title: sub.Text.split(' - ')[0] ?? sub.Text.slice(0, 80),
              snippet: sub.Text.slice(0, 300),
              url: sub.FirstURL,
            })
          }
        }
      }
    }
    return results
  } catch {
    return []
  }
}

async function searchWikipedia(query: string): Promise<{ title: string; snippet: string; url: string }[]> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=5&srprop=snippet`,
      { headers: { 'User-Agent': 'MainframeBot/1.0' } },
    )
    if (!res.ok) return []

    const data = await res.json()
    return (data.query?.search ?? []).map((r: any) => ({
      title: r.title,
      snippet: r.snippet.replace(/<[^>]+>/g, '').slice(0, 300),
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}`,
    }))
  } catch {
    return []
  }
}

async function searchDuckDuckGoSite(query: string, site: string): Promise<{ title: string; snippet: string; url: string }[]> {
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(`site:${site} ${query}`)}&format=json&no_html=1&skip_disambig=1`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    )
    if (!res.ok) return []

    const data = await res.json()
    const results: { title: string; snippet: string; url: string }[] = []

    if (data.AbstractText && data.AbstractURL) {
      results.push({
        title: data.AbstractSource ?? site,
        snippet: data.AbstractText.slice(0, 300),
        url: data.AbstractURL,
      })
    }

    const topics = data.RelatedTopics ?? []
    for (const topic of topics) {
      if (results.length >= 3) break
      if (topic.Text && topic.FirstURL) {
        results.push({
          title: topic.Text.split(' - ')[0] ?? topic.Text.slice(0, 80),
          snippet: topic.Text.slice(0, 300),
          url: topic.FirstURL,
        })
      }
    }
    return results
  } catch {
    return []
  }
}

async function searchWeb(query: string): Promise<{ title: string; snippet: string; url: string }[]> {
  const [wiki, ddg, ibmDocs] = await Promise.all([
    searchWikipedia(query),
    searchDuckDuckGo(query),
    searchDuckDuckGoSite(query, 'ibm.com/docs/zos'),
  ])
  const seen = new Set<string>()
  const merged = [...wiki, ...ibmDocs, ...ddg].filter(r => {
    if (seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })
  return merged.slice(0, 5)
}

async function fetchPageContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MainframeBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return ''
    const html = await res.text()
    const text = stripHtml(html)
    return text.slice(0, 3000)
  } catch {
    return ''
  }
}

async function buildSearchContext(query: string): Promise<string> {
  const results = await searchWeb(query)
  if (!results.length) return ''

  const parts: string[] = []
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    parts.push(`Source ${i + 1}: ${r.title}\nURL: ${r.url}\nSummary: ${r.snippet}`)
    const content = await fetchPageContent(r.url)
    if (content) {
      parts.push(`Content: ${content}`)
    }
  }

  const ibmRef = await fetchPageContent('https://www.ibm.com/docs/en/zos/2.5.0?topic=commands-mvs-system-reference')
  if (ibmRef) {
    parts.push(`\n---\nIBM z/OS Reference Overview:\n${ibmRef}`)
  }

  return parts.join('\n\n---\n\n')
}

async function checkRelevance(message: string, model: ModelKey = 'llama-3.1-8b-instant'): Promise<'mainframe' | 'irrelevant' | 'ambiguous'> {
  if (isMainframeQuery(message)) return 'mainframe'

  if (!GROQ_API_KEY) return 'ambiguous'

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a classifier. Reply with exactly one word: "yes" if the question is related to mainframe computing (IBM z/OS, JCL, COBOL, CICS, batch processing, mainframe hardware/software), or "no" if it is not.',
          },
          { role: 'user', content: message },
        ],
        temperature: 0,
        max_tokens: 10,
      }),
    })

    if (!res.ok) return 'ambiguous'
    const data = await res.json()
    const answer = data?.choices?.[0]?.message?.content?.trim().toLowerCase() ?? ''
    return answer === 'yes' ? 'mainframe' : 'irrelevant'
  } catch {
    return 'ambiguous'
  }
}

const WEBSITE_KB = `## Website: Mainframe Knowledge Database (by Vimal)

### Page: Console Commands - z/OS Console Command Reference
28 sections of z/OS commands (Display, K, Vary, Matrix, DASD/Tape, DFHSM, MVS, OMVS, VTAM, Subsystem, TCP/IP, JES2, zFS, TSO/ISPF, RACF, SDSF, MQ, SMF, DFSMS, TSO/E, VLF, CA7, CICS, DB2, IDMS, WLM, MIMS Tape, IMS).

### Page: Batch Operations
TWS (Tivoli Workload Scheduler) User Guide + CA7 User Guide ZIP (3 docs) available for download.

### Page: YouTube Repository
Curated mainframe learning resources — JCL tutorials, console operations courses.

### Page: IPL Concept
Initial Program Load resources references with YouTube playlist.

### Page: Home
Hero section with mainframe quotes by Vimal.

### External Reference: IBM z/OS Documentation
https://www.ibm.com/docs/en/zos/2.5.0?topic=commands-mvs-system-reference`

const SYSTEM_PROMPT = `You are a mainframe expert assistant. Answer ONLY mainframe questions.

CRITICAL: Be extremely concise to save tokens. Format every answer as:

**Command:** <command>
**Output:** <1-2 line simplified explanation>
**Source:** <URL or "Website KB">

If multiple sources, list them as bullet points. Never write more than 4-5 lines total.
If not a mainframe question, reply: "I only answer mainframe questions."`

const FALLBACK_CHAIN: ModelKey[] = ['meta-llama/llama-4-scout-17b-16e-instruct', 'moonshotai/kimi-k2-instruct', 'qwen/qwen3-32b', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'llama-3.3-70b-versatile']

const rateLimitedModels = new Set<string>()

async function queryGroq(userMessage: string, searchContext: string): Promise<string> {
  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: `Website KB:\n${WEBSITE_KB}\n\nUse "Source: Website" if info is from here.` },
  ]

  if (searchContext) {
    messages.push({
      role: 'system',
      content: `Search results:\n${searchContext}\n\nCite relevant URLs in "Source:" lines only.`,
    })
  }

  messages.push({ role: 'user', content: userMessage })

  for (const m of FALLBACK_CHAIN) {
    if (rateLimitedModels.has(m)) continue

    const body = JSON.stringify({
      model: m,
      messages,
      temperature: 0.3,
      max_tokens: 512,
    })

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body,
    })

    if (res.status === 429) {
      rateLimitedModels.add(m)
      continue
    }

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq API error (${res.status}): ${err}`)
    }

    const data = await res.json()
    return data?.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.'
  }

  rateLimitedModels.clear()
  throw new Error('All models rate limited. Please wait a moment and try again.')
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: any) => (body += chunk))
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function json(res: any, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    return res.end()
  }

  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' })
  }

  if (!GROQ_API_KEY) {
    return json(res, 500, { error: 'GROQ_API_KEY not configured' })
  }

  try {
    const body = await readBody(req)
    const { message } = JSON.parse(body)

    if (!message || typeof message !== 'string') {
      return json(res, 400, { error: 'Message is required' })
    }

    const relevance = await checkRelevance(message)
    if (relevance === 'irrelevant') {
      return json(res, 200, { reply: 'I only answer mainframe-related questions. Please ask about IBM z/OS, JCL, COBOL, CICS, console commands, or other mainframe topics.' })
    }

    const searchContext = await buildSearchContext(message)
    const reply = await queryGroq(message, searchContext)
    return json(res, 200, { reply, searched: !!searchContext })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Chat error:', msg)
    return json(res, 500, { error: msg })
  }
}
