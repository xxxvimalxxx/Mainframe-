/// <reference types="node" />

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const GROQ_API_KEYS = [
  process.env.GROQ_API_KEY_0,
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
  process.env.GROQ_API_KEY_6,
  process.env.GROQ_API_KEY_7,
  process.env.GROQ_API_KEY_8,
  process.env.GROQ_API_KEY_9,
  process.env.GROQ_API_KEY_10,
  process.env.GROQ_API_KEY_11,
  process.env.GROQ_API_KEY_12,
  process.env.GROQ_API_KEY_13,
  process.env.GROQ_API_KEY_14,
  process.env.GROQ_API_KEY_15,
  process.env.GROQ_API_KEY_16,
].filter(Boolean) as string[]

let currentKeyIndex = 0

function getNextKey(): string {
  const key = GROQ_API_KEYS[currentKeyIndex % GROQ_API_KEYS.length]
  currentKeyIndex++
  return key
}

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
  'dump', 'redact', 'idis', 'ipcs', 'smp/e', 'z/os upgrade',
  'catalog', 'alias', 'idcams', 'access method', 'bldx', 'acb',
  'repro', 'export', 'import', 'define cluster',
  'operator', 'display', 'vary', 'cancel', 'start', 'stop', 'modify',
  'mount', 'force', 'sweep', 'quiesce', 'drain', 'purge', 'hold',
  'release', 'restart', 'interrupt', 'switch', 'format', 'activate',
  'deactivate', 'refresh', 'route', 'send', 'message', 'reply',
  'initiator', 'printer', 'spool', 'node', 'remote', 'line',
  'form', 'class', 'queue', 'output', 'joblog', 'syslog',
  'omvs', 'uss', 'unix', 'zfs', 'filesystem', 'mountpoint',
  'parmlib', 'proclib', 'lkledit', 'linklist', 'apf', 'exits',
  'program', 'transaction', 'region', 'database', 'table',
  'buffer', 'thread', 'utility', 'image', 'copy', 'backup',
  'recovery', 'log', 'checkpoint', 'restart', 'shutdown',
  'connect', 'disconnect', 'acquire', 'trace', 'snap',
  'password', 'userid', 'group', 'profile', 'permit', 'define',
  'alter', 'delete', 'connect', 'remove', 'list', 'search',
  'dataset', 'dsn', 'member', 'pds', 'pdse', 'sequential',
  'generation', 'gdg', 'catalog', 'vtoc', 'label', 'volume',
  'unit', 'device', 'path', 'channel', 'online', 'offline',
  'enable', 'disable', 'activate', 'deactivate', 'allocate',
  'free', 'mount', 'unmount', 'export', 'import',
]

function isMainframeQuery(query: string): boolean {
  const lower = query.toLowerCase()
  return MAINFRAME_KEYWORDS.some(kw => lower.includes(kw))
}

async function checkRelevance(message: string, model: ModelKey = 'llama-3.1-8b-instant'): Promise<'mainframe' | 'irrelevant' | 'ambiguous'> {
  if (isMainframeQuery(message)) return 'mainframe'

  const relevanceKey = getNextKey()
  if (!relevanceKey) return 'ambiguous'

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${relevanceKey}`,
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

const COMMANDS_DB = [
  ['D A,L','Display active users, started tasks, jobs, regions'],
  ['D A,<TASK>','Show if specific started task is active'],
  ['D ASM','Display Auxiliary Storage Manager usage'],
  ['D C','Display consoles (master and others)'],
  ['D C,B','Display console buffer'],
  ['D C,K','Display control command operands list'],
  ['D C,M','Display Master Console'],
  ['D C,N','Display inactive consoles'],
  ['D D','Display dump datasets (SYS1.DUMPxx)'],
  ['D D,T','Display dump datasets with titles'],
  ['D DUMP','Display dump dataset status'],
  ['D ETR','Display External Time Reference status'],
  ['D GRS,C','Display system contention (Global Resource Serialization)'],
  ['D IPLINFO','Display current IPL information'],
  ['D J','Display active jobs'],
  ['D J,L','Display system activity / active jobs'],
  ['D OPDATA','Display command prefixes of DB2, JES, RACF regions'],
  ['D PFK','Display PFK defined commands'],
  ['D R,L','Display outstanding WTORs'],
  ['D R,R','Display pending action messages'],
  ['D R,U','Display devices needing attention/mount requests'],
  ['D SMF','Display SMF datasets (SYS1.MANx)'],
  ['D SMF,O','Display current SMF options'],
  ['D SMF,S','Display SMF status'],
  ['D T or DT','Display local time, GMT, Julian date'],
  ['D TS,L','Display active TSO users'],
  ['D XCF','Display systems in Sysplex'],
  ['D XCF,COUPLE','Display coupling facility info'],
  ['D A,L,USERID=<ID>','Display active jobs for specific TSO user'],
  ['D OMVS','Display if OMVS is active'],
  ['D OMVS,F','Display mounted file systems'],
  ['D OMVS,OPTIONS','Display OMVS options'],
  ['D XCF,STR','List coupling facility structures'],
  ['D XCF,STRNAME=<NAME>','Display info about individual structure'],
  ['D SSI','Display configured subsystems'],
  ['D GRS,RES=(*)','Display viewable resources'],
  ['D GRS,RES=(SYSDSN)','Display enqueues on SYSDSN'],
  ['D GRS,E,C','List resource everyone is waiting on'],
  ['$D PROCLIB','Display system proclib'],
  ["SE '<msg>'","Send message to all TSO users"],
  ['D A,<jobname>','Display info for specific job (* wildcard)'],
  ['D C,*','Display console info for current console'],
  ['D C,A,CA','Display active sysplex consoles'],
  ['D C,N,CA','Display inactive sysplex consoles'],
  ['D GRS,RES(*,<dsn>)','Display contention with specific dataset'],
  ['D IOS,CONFIG','Display I/O configuration'],
  ['D J,A','Display detailed active job info'],
  ['D M=CONFIG(<n>)','Display config deviation'],
  ['D NET,CPCP','Display CP-CP session status'],
  ['D R,L,CN=(ALL)','Display outstanding replies from all consoles'],
  ['D U,DASD,<nnn>,<n>','Display specific DASD unit range'],
  ['K E,*','Delete line marked with * on console'],
  ['K E,X,Y','Delete lines X through Y'],
  ["K N,PFK=(X,CMD='...'),CON=N","Define PFK"],
  ['K Q','Clear console buffer spool'],
  ['K Q,L=<CONSOLE ID>','Clear buffer shortage for console ID'],
  ["K S,DEL=RD","Set Roll Delete Mode"],
  ['K S,DEL=N','Stop message scrolling'],
  ['K S,REF','Display current console mode'],
  ['K V,LEVEL=ALL','Display all message traffic routed to console'],
  ['K V,LEVEL=I','Display immediate action messages'],
  ['K V,LEVEL=R','Display WTORs at console'],
  ['K V,REF','Display all vary definitions'],
  ['K A,REF','Show areas on operator console'],
  ['K A,NONE','Remove out of line area from console'],
  ['K A,14','Make area 14 lines deep'],
  ['K A,6,6','Make two areas A and B'],
  ['K D,F','Scroll forward'],
  ['K E,D','Remove bottom out of line display area'],
  ['K E','Clear scrolling messages from screen'],
  ['K E,N','Remove nth message from top'],
  ["K N,PFK=(001,CMD='d a,l;d ts,l')","Set PF key 001 to multiple commands"],
  ['K E,SEG','Delete content of message segment'],
  ['K E,1','Delete line 1 on console'],
  ['PA1','Retrieve previous command'],
  ['K K','Clear screen except highlighted messages'],
  ['K C,A,0-999999999','Clear all messages from console'],
  ['K D,PFK','Display PFK line'],
  ['K M,MILM=<n>','Change WTO/WTOR message buffers'],
  ['K S,DEL=Y','Set console to delete all messages'],
  ['K S,DEL=R','Set console to roll all messages'],
  ['K S,RNUM=<n>','Set messages to roll count'],
  ['K S,RTME=<n>','Set roll interval seconds'],
  ['K T','Display dynamic display update interval'],
  ['K T,UTKE,<n>','Update dynamic display every n seconds'],
  ['V DEV NUM,ONLINE','Vary device online'],
  ['V DEV NUM,OFFLINE','Vary device offline'],
  ['V NET,ID=LINE ID,ACT,ALL','Activate network line'],
  ['V NET,ID=LINE ID,INACT,F','Deactivate network line force'],
  ['V NET,ID=<ID>,ACT/INACT','Change network resource status'],
  ['V NET,ID=<ID>,ACT/INACT,SCOPE=ALL/ONLY','Change network resource and subordinates'],
  ['V PATH(XXX,YY),ONLINE','Vary channel path online'],
  ['V PATH(XXX,YY),OFFLINE','Vary channel path offline'],
  ['V SMS,LIB(ATL NAME),ONLINE','Vary ATL online'],
  ['V SMS,LIB(ATL NAME),OFFLINE','Vary ATL offline'],
  ['V XXX,ONLINE','Vary tape drive online'],
  ['V XXX,OFFLINE','Vary tape drive offline'],
  ['RO *ALL,V XXX,OFFLINE','Vary drive offline across sysplex'],
  ['RO *ALL,V <addr>,ONLINE','Vary drive online on all sysplex systems'],
  ['CF CHP(<cc>),ONLINE','Make channel path online (CF)'],
  ['CF CHP(<cc>),OFFLINE','Make channel path offline'],
  ['V <n>,CONSOLE','Vary device as console'],
  ['V <n>,MSTCONS','Switch master console to device'],
  ['V <n>,OFFLINE,FORCE','Force device offline (needs reply YES)'],
  ['V CH(<nn>),ONLINE','Vary single channel online'],
  ['V PATH(<nnn>,<cc>),OFFLINE,UNCOND','Force path offline unless last path'],
  ['D M','Display system configuration'],
  ['D M=CPU','Display CPU/core status'],
  ['D M=DEV','Display all paths to all devices'],
  ['D M=DEV(DEVICE NAME)','Display paths for particular device'],
  ['D M=CHP(CHIP ID)','Display paths on channel path'],
  ['D M=STOR','Display storage configuration'],
  ['DS P,<ddd>,<nn>','Display device status and path info'],
  ['D U,DASD,ONLINE,C00,8','Display online DASD volumes range'],
  ['D U,TAPE,ONLINE','Display online tape drives'],
  ['D U,TAPE,OFFLINE','Display offline tape drives'],
  ['D U,,ALLOC,XXX,1','Display jobs allocated to device'],
  ['D SMS,LIB(ALL),DETAIL','Display ATL details'],
  ['D SMS,LIB(ALL),STATUS','Display ATL status'],
  ['D SMS,STORGRP(ALL),LISTVOL','Display storage groups and volumes'],
  ['F DFHSM,LIST USER','List authorized DFHSM users'],
  ['F DFHSM,LIST MVOL','List migration volumes'],
  ['F DFHSM,Q ACT','Display active DFHSM queries'],
  ['F DFHSM,Q AC W','Display waiting active queries details'],
  ['F DFHSM,Q REQ','Display pending DFHSM requests'],
  ['F DFHSM,Q WAIT','Display waiting tasks/requests'],
  ['F DFHSM,REL ALL','Release all active DFHSM tasks'],
  ['CANCEL JOB','Cancel a job'],
  ['CANCEL U=<USERID>','Cancel/force-off TSO user'],
  ['S <PROCLIB MEMBER>','Start system job via proclib'],
  ['P <PROCLIB MEMBER>','Stop system job'],
  ['P <JOBNAME>.<ID>,A=1234','Stop specific job instance'],
  ['SETPROG APF,ADD,DSN=<DS>,VOL=<VOL>','Make library APF-authorized'],
  ['DD CLEAR,DSN=ALL','Clear all SYS1.DUMP datasets'],
  ['DS QT,<addr>,<count>','Display tape device status'],
  ['D IOS,MIH,DEV=<addr>','Display MIH timeout for device'],
  ['V <addr>,ONLINE,UNCOND','Force device online unconditionally'],
  ['D LOGREC','Display LOGREC dataset status'],
  ['D PARMLIB','Display PARMLIB datasets'],
  ['D PROD,REGISTERED','Display registered software products'],
  ['D PROG,EXIT','Display program exits'],
  ['D PROG,LNKLIST','Display LNKLST concat'],
  ['D PROG,APF','Display APF libraries'],
  ['D SMS','Display SMS configuration'],
  ['D SYMBOLS','Display static system symbols'],
  ['D U,IPLVOL','Display IPL volume unit status'],
  ['F TSO,USERMAX=<n>','Set max TSO users'],
  ['M <dev>,VOL=(SL,<volser>),USE=PUBLIC','Mount volume as public'],
  ['VARY CN(*),ACTIVATE','Activate current console'],
  ['D C,HCONLY','Display hardcopy-only consoles'],
  ['DD ADD,DSN=<n>','Add a dump dataset'],
  ['DD DEL,DSN=<n>','Delete a dump dataset'],
  ['DUMP COMM=(<text>)','Take a system dump with description text'],
  ['Z EOD','Halt MVS and SMF'],
  ['S OMEGAMON','Start OMEGAMON'],
  ['P OMEGAMON','Stop OMEGAMON'],
  ['M <addr>,VOL=(SL,<volser>),USE=STORAGE','Mount volume for storage'],
  ['C <jobname>,DUMP','Cancel job with dump'],
  ['C <taskname>,DUMP','Cancel task with dump'],
  ['C <jobname>,A=<addr>','Cancel job by address'],
  ['C U=<userid>,A=<addr>','Cancel user by address'],
  ['FORCE <jobname>','Force job off system'],
  ['FORCE <jobname>,A=<addr>','Force job by address'],
  ['FORCE <userid>','Force TSO user off'],
  ['FORCE <userid>,A=<addr>','Force user by address'],
  ['RO <cmd>','Route command to sysplex members'],
  ['I SMF','Switch SMF datasets'],
  ["L '<text>'","Enter comment into system log"],
  ['MN <jobname(s)>,T','Display job start/stop time'],
  ['PA <dsname>','Add auxiliary storage (page add)'],
  ["SE '<msg>',SAVE","Put message in SYS1.BRODCAST"],
  ['SE LIST','Display all SYS1.BRODCAST messages'],
  ['SE <n>,DELETE','Delete message from SYS1.BRODCAST'],
  ['SET CLOCK=hh.mm.ss','Set system time'],
  ['SWAP <xxx>,<yyy>','Swap devices'],
  ['V CN(*),DEACTIVATE','Deactivate HMC console'],
  ['V CN(<n>),MSCOPE=<sys>','Set sysplex message scope'],
  ['E <jobname>,PERFORM=<n>','Change job performance level'],
  ['E SWAP,<jobname>=NONSWAP','Set job nonswap'],
  ['E SWAP,<jobname>=SWAP','Set job swappable'],
  ['D OMVS','Display if OMVS active'],
  ['D OMVS,F','Display mounted filesystems'],
  ['D OMVS,OPTIONS','Display kernel options'],
  ['D OMVS,PFS','Display filesystems OMVS knows'],
  ['F OMVS,PFS=ZFS,QUERY,STATUS','Query ZFS status'],
  ['F OMVS,PFS=ZFS,QUERY,...','Display ZFS stats'],
  ['CHMOUNT -W <path>','Change filesystem to read/write'],
  ['CHMOUNT -R <path>','Change filesystem to read-only'],
  ['D NET,ID=<ID>','Display VTAM resource status'],
  ['Z NET,QUICK','Quick shut down VTAM'],
  ['V NET,ACT,ID=<ID>','Activate VTAM resource'],
  ['V NET,INACT,ID=<ID>','Deactivate VTAM resource'],
  ['D NET,MAJNODES','Display VTAM major nodes'],
  ['Z NET','Take down VTAM normally'],
  ['Z NET,CANCEL','Force take down VTAM'],
  ['D NET,BFRUSE,BUFFER=SHORT','Display VTAM buffer usage'],
  ['D NET,CDRMS','Display cross-domain resource managers'],
  ['D NET,LINES','Display VTAM lines'],
  ['D NET,PENDING','Display pending nodes'],
  ['D NET,PENDING,ID=<name>','Display pending IDs'],
  ['D NET,STATIONS','Display VTAM stations'],
  ['D NET SESSIONS,LIST=ALL,MAX=500,E','Display active VTAM sessions'],
  ['D NET,TSOUSER,ID=<userid>','Display TSO users via VTAM'],
  ['D NET,NETSRVR,E','Display network server status'],
  ['D NET,CLSTRS','Display VTAM clusters'],
  ['D NET,APPLS','Display VTAM applications'],
  ['D NET,ADJSSCPS,ADJLIST=*','Display adjacent SSCPs'],
  ['D NET,ROUTE,...','Display NCP routing'],
  ['D NET,ADJCLUST,NETID=<name>','Display adjacent cluster'],
  ['D NET,ADJCP,ID=<name>,E','Display specific adjacent CP'],
  ['F NET,TRACE,TYPE=IO,ID=<name>','Trace I/O on VTAM line'],
  ["SETSSI ADD,S=<SSID>,I=<INI>,INITPARM='<P>'","Add subsystem definition"],
  ['%<SSID>','Start queue manager'],
  ['-<SSID>','Start DB2 subsystem'],
  ['D SSI','List configured subsystems'],
  ['D SSI,SUB=<SSID>','Display subsystem details'],
  ['F <SSID>,...','Issue command to running subsystem'],
  ['D TCPIP','List TCP/IP stacks'],
  ['D TCPIP,<NAME>,NETSTAT,CONN','Display network connections'],
  ['D TCPIP,,NETSTAT,CONN','Display connections (single stack)'],
  ['D TCPIP,<NAME>,NETSTAT,HOME','Display IP addresses'],
  ['V NET,ACT,ID=<LINE>','Activate network line'],
  ['V NET,INACT,ID=<LINE>','Deactivate network line'],
  ['F LLA,REFRESH','Refresh LLA'],
  ['$D JES2','Display JES2 activity'],
  ['$DI','Display initiators'],
  ['$DI1-5','Display initiators 1-5'],
  ['$PI2-3','Stop initiators 2-3'],
  ['$SI2-3','Start initiators 2-3'],
  ['$ADD PRT1,UNIT=<ADDR>','Add printer with unit address'],
  ['$DPRT*','Display all printers'],
  ['$DPRT1','Display printer 1'],
  ['$SPRT1','Start printer 1'],
  ['$PPRT1','Stop printer 1'],
  ['$DU,STA','Display started units'],
  ['$PJES2','Stop JES2'],
  ["$DJOBCLASS('STC'),OUTDISP","Display output disposition"],
  ['$T JOBCLASS(STC),OUTDISP=(,)','Set STC output'],
  ['$DSPOOL','Display spool fullness'],
  ['$D JOBDEF','Display JOE count'],
  ['$T OUTDEF,JOENUM=<NUM>','Increase JOENUM'],
  ['$DJQ,SPL=(%>1)','Display jobs using >1% spool'],
  ['$DS,SPL=(%>1)','Display STCs using >1% spool'],
  ['$DT,SPL=(%>1)','Display TSO using >1% spool'],
  ['$DJQ,DAYS>2','Display jobs older than 2 days'],
  ['$DO JQ,JM=<PREFIX>*','Display output for jobs'],
  ['$PO JQ,JM=<PREFIX>*','Purge output for jobs'],
  ['$DO JQ,AGE>4','Display output older than 4 days'],
  ['$PO JQ,AGE>4','Purge output older than 4 days'],
  ['$DSPL,JOBS=<n>','Display jobs using n% spool'],
  ['$A A','Release all held jobs'],
  ['$ACTIVATE','Activate new JES2 functions'],
  ['$ADD APPL','Define VTAM app to JES2'],
  ['$ADD DESTID','Define symbolic dest name'],
  ['$ADD FSS','Define FSS'],
  ['$ADD LINE(<nnnn>)','Add line'],
  ['$ADD LOGON(<nn>)','Create LOGON device'],
  ['$ADD REDIRECT','Specify command redirection'],
  ['$ADD RMT(<nnnn>)','Add RJE workstations'],
  ['$C A','Cancel auto commands'],
  ['$C A <n>','Cancel auto job ID'],
  ['$D BUFDEF','Display BUFDEF values'],
  ['$DQ','Display job queues and spool'],
  ['$D SPOOLDEF','Display spooling environment'],
  ['$D U,LOGON1','Display LOGON1 status'],
  ['$D U,VOLSER=<volser>','Find DASD by volser'],
  ['$SSPL(<pool>),FORMAT','Format spool partition'],
  ['$T <dev>.<id>,DISP=KEEP','Change output to KEEP'],
  ['$T NODE(<name>),PATHMGR=NO','Disable path manager'],
  ['$T A,ALL','Display scheduled auto cmds'],
  ["$TA,I=<sec>,T=<time>,'$VS,''<cmd>'''","Schedule auto cmd"],
  ["$VS,'<cmd>'","Issue system cmd from JES2"],
  ['$DSPL,ALL','Display all spool volumes'],
  ['$D JOBQ,SPOOL=(%<n>)','Jobs >n% spool'],
  ['$DU,PRTx','Display printer x'],
  ["$T '<jobname>',PRTY=<y>","Change job priority"],
  ['$T Ix,C=<y>','Change initiator class'],
  ['$A <jobname>','Release held job'],
  ['$E <jobname>','Restart job'],
  ['$H <jobname>','Hold job'],
  ['$P JES2,ABEND','Force JES2 down'],
  ['$DA','Display active jobs'],
  ['$DA,T','Display active TSO'],
  ['$DA,S','Display active STC'],
  ['$DN,Q=HOLD','Display held jobs'],
  ['$DQ,V=SPOOL<n>','Display jobs on spool vol'],
  ['$D SPOOL,ALL','Display all spool vols'],
  ['$SSPL,V=SPOOL<n>','Start spool pack'],
  ['$SSPL,V=SPOOL<n>,FORMAT','Format and start spool'],
  ['$PSPL,V=SPOOL<n>','Drain spool pack'],
  ['$DJ<nnnn>','Display job by number'],
  ["$DMJ<nnnn>,'<text>'","Send message to job JCL"],
  ['$DS<nn>','Display STC by number'],
  ['$DT<nn>','Display TSO by number'],
  ['$DMASDEF','Display MAS environment'],
  ['$DNODE','Display all JES nodes'],
  ['$DNODE(<name>)','Display specific node'],
  ['$SN,A=<name>','Start SNA node'],
  ['$CJ<nn>,D','Cancel job with dump'],
  ['$PJ<nn>','Purge job'],
  ['$LJ<nn>','List job output'],
  ['$LS<nn>','List STC output'],
  ['$LT<nn>','List TSO output'],
  ['$AJ<nn>-<nn>','Release range of jobs'],
  ['$AS<n>','Activate system job'],
  ['$CJ<nn>,P','Cancel and purge'],
  ['$CS<n>','Cancel system job'],
  ['$DA,L=A','Display active jobs one system'],
  ['$DA,ALL,L=A','Display active jobs all systems'],
  ['$DN,L=A','Display all job status'],
  ['$DN,Q=XEQ,L=A','Display awaiting execution'],
  ['$DN,Q=PPU,L=A','Display waiting print/punch'],
  ['$DN,Q=HOLD,L=A','Display held jobs'],
  ['$DN,R=<n>-<n>','Display remote range'],
  ['$DQ,XEQ,L=A','Display execution queue'],
  ['$DQ,XEQ(<CLASS>),L=A','Display class queue'],
  ['$PLNE<nn>','Stop line activity'],
  ['$O Q,ALL,A=<nn>,CANCEL','Cancel old output'],
  ['$TNUM,BASE=1','Reset job numbers'],
  ['$TI<nn>,<class>','Change initiator class'],
  ['$DU,RMT<#>','Display remote'],
  ['$SRMT<#>','Start remote'],
  ['$PRMT<#>','Drain remote'],
  ['$DR<#>.PR1','Display remote printer'],
  ['$SR<#>.PR1','Start remote printer'],
  ['$PR<#>.PR1','Drain remote printer'],
  ['$ER<#>.PR1','Restart remote printer'],
  ['$NR<#>.PR1','Repeat remote printer'],
  ['$CR<#>.PR1','Cancel remote printer'],
  ['$TR<#>.PR1,Q=*','Set remote printer class'],
  ['$DN,Q=XEQ*','Display input queue class'],
  ['$DQ,R=<#>','Display queued jobs for remote'],
  ['$DF','Display output by form'],
  ['$DF,R=<#>','Display output for remote'],
  ['$IPRT<#>','Interrupt printer'],
  ['$ZPRT<#>','Halt printer'],
  ['$BPRT<#>','Backspace printer'],
  ['$FPRT<#>','Forward space printer'],
  ['$TPRT<#>,F=*','Set printer form'],
  ['$TPRT<#>,LIM=*','Set printer line limit'],
  ['$TPRT<#>,R=*','Set printer remote queue'],
  ['$TR<#>.CON,D=T','Set remote console display'],
  ["$DMR<n>,'<msg>'","Send message to remote"],
  ["$DMR<n>-<n>,'<msg>'","Send msg to multiple remotes"],
  ['$H Q,ALL','Hold all job queues'],
  ['$A Q,ALL','Release all job queues'],
  ["$A Q,C='<class>'","Release job class"],
  ["$H Q,C='<class>'","Hold job class"],
  ['F ZFS,QUERY,STATUS','Query ZFS status'],
  ['F ZFS,FSINFO,ALL','Display zFS aggregate info'],
  ['ZFSADM CONFIGQUERY','Display ZFS config'],
  ['ZFSADM CONFIG...','Change ZFS config'],
  ['ZFSADM AGGRINFO <DS>','Display zFS aggregate info'],
  ['ZFSADM GROW -AG <DS> -SIZE <KB>','Increase zFS size'],
  ['DDLIST or ISRDDN','Display TSO allocations'],
  ['MOUNT FILESYSTEM(<DS>) MOUNTPOINT(<PATH>) TYPE(ZFS) MODE(READ)','Mount zFS'],
  ['UNMOUNT FILESYSTEM(<DS>) NORMAL','Unmount zFS'],
  ['WHOIS <userid|name>','Find TSO user info'],
  ['AU / ADDUSER','Add RACF user'],
  ['DU / DELUSER','Delete RACF user'],
  ['ALU / ALTUSER','Alter RACF user'],
  ['ALU <USER> PASSWORD(<pass>)','Reset RACF password'],
  ['ALU <USER> RESUME','Resume revoked user'],
  ['ALU <USER> REVOKE','Revoke user'],
  ['ALU <USER> NOOMVS','Remove OMVS access'],
  ['ALU <USER> HOME(<p>) PROGRAM(<s>) AUTOUID','Grant OMVS access'],
  ['AG / ADDGROUP','Add RACF group'],
  ['DG / DELGROUP','Delete RACF group'],
  ['CONNECT <USER> GROUP(<GROUP>)','Connect user to group'],
  ['REMOVE <USER> GROUP(<GROUP>)','Remove user from group'],
  ['RDEFINE / RDEF','Define RACF profile'],
  ['RDEFINE <CLASS> <PROFILE> ADDMEM(...)','Define resource group'],
  ['RALTER <CLASS> <PROFILE> <ATTR>','Change RACF profile'],
  ['RDELETE <CLASS> <PROFILE>','Delete RACF profile'],
  ['PERMIT <PROFILE> CLASS(<C>) ID(<U>) ACCESS(<L>)','Permit user to resource'],
  ['PERMIT <PROFILE> CLASS(<C>) ID(<U>) DELETE','Remove permit'],
  ['RLIST <CLASS> <PROFILE> AUTHUSER','List authorized users'],
  ['SEARCH CLASS(<CLASS>)','List profiles in class'],
  ['SETROPTS CLASSACT(<CLASS>)','Activate RACF class'],
  ['SETROPTS NOCLASSACT(<CLASS>)','Deactivate RACF class'],
  ['SETROPTS GENERIC(<CLASS>)','Enable generic profiles'],
  ['SETROPTS PASSWORD(MIXEDCASE)','Enable mixed passwords'],
  ['SETROPTS LIST','Display active RACF classes'],
  ['SETR RACLIST(<CLASS>) REFRESH','Refresh RACF profiles'],
  ['RVARY','Display RACF datasets'],
  ['#SET TRACE(...)','Turn on/off RACF trace'],
  ['AD / ADDSD <HLQ.*> UACC(NONE)','Define dataset HLQ profile'],
  ['DEFINE ALIAS(NAME(<a>) RELATE(<c>))','Define catalog alias'],
  ['RDEF JESJOBS SUBMIT|CANCEL <pattern>','Define JESJOBS profile'],
  ['LD DA(<dataset>) GEN','Display protecting RACF profile'],
  ['LU <USER>','List RACF user info'],
  ['LG <GROUP>','List RACF group info'],
  ['S CICS***','Start CICS region'],
  ['S CICS***,START=COLD','Cold start CICS'],
  ['S CICS***,START=INIT','Initial start CICS'],
  ['F CICS***,CEMT P SHUT','Shut down CICS'],
  ['F CICS***,CEMT P SHUT IMM','Immediate CICS shutdown'],
  ['F CICS***,CEMT I CONN ALL','Display subsystems to CICS'],
  ['F CICS***,CEMT P SHUT I','Stop CICS subsystem'],
  ['F <r>,CEMT I DU','Display CICS dump dataset'],
  ['F <r>,CEMT I SYS','Display system/net name'],
  ['F <r>,CEMT I Q','Display queues'],
  ['F <r>,CEMT I MAX','Display max tasks'],
  ['F <r>,CEMT I VTA','Display VTAM status'],
  ['F <r>,CEMT I TAS','Display tasks'],
  ['F <r>,CEMT I TRAN','Display transactions'],
  ['F <r>,CEMT I DA(<dsn>)','Display dataset'],
  ['F <r>,CEMT I NE(<term>)','Display network terminal'],
  ['F <r>,CEMT PERFORM SHUT','Shutdown CICS region'],
  ['F <r>,CEMT S TE(<term>) ACQ','Acquire terminal'],
  ['F <r>,CEMT S TE(<term>) REL','Release terminal'],
  ['F <r>,CEMT S TE(<term>) INS','Put terminal in service'],
  ['F <r>,CEMT S TE(<term>) OUT','Take terminal out'],
  ['F <r>,CEMT S DUMP,CLOSE','Close dump dataset'],
  ['F <r>,CEMT S Q','Set queue options'],
  ['F <r>,CEMT S AMAX(<n>) MAX(<n>)','Set AMAX/MAX tasks'],
  ['F <r>,CEMT S TRAN(<n>) DIS','Disable transaction'],
  ['F <r>,CEMT S TAS(<n>) PU','Purge task'],
  ['F <r>,CEMT S TAS(<n>) FORCE','Force task'],
  ['F <r>,CEMT S PROG(<n>) ENA','Enable program'],
  ['F <r>,CEMT S PROG(<n>) ENA NEW','Enable and copy program'],
  ['F <r>,CEMT S NE(<n>) FORCE','Force netname'],
  ['F <r>,CEMT S NE(<n>) PURGE','Purge netname'],
  ['F <r>,CEMT S NE(<n>) OUT','Take device out'],
  ['F <r>,CEMT S NE(<n>) IN','Put device in'],
  ['F <r>,CEMT S VTAM CLO','Close VTAM to CICS'],
  ['F <r>,CEMT S VTAM OPE','Open VTAM to CICS'],
  ['F <r>,CEMT TRMNAT,TERMID=<id>','Terminate task'],
  ['F <r>,CEMT TRACE,ON','Start trace'],
  ['F <r>,CEMT ATR,ON','Enable aux trace'],
  ['F <r>,CEMT ATR,ATC','Close aux trace file'],
  ['F <r>,CEMT SWITCH','Switch dump dataset'],
  ['F <r>,CEMT SNAP','Issue snap dump'],
  ['XSTARTDB2','Start DB2 subsystem'],
  ['XSTOPDB2','Stop DB2 subsystem'],
  ['XDIS THD(*)','Display all threads in DB2'],
  ['XDIS UTIL(*)','Display all utilities in DB2'],
  ['-DSNx DISPLAY DATABASE','Display database status'],
  ['-DSNx DISPLAY THREAD(*)','Display DB2 thread info'],
  ['-DSNx DISPLAY TRACE','Display DB2 traces'],
  ['-DSNx DISPLAY LOCATION','Display DDF info'],
  ['-DSNx DISPLAY UTILITY(*)','Display utility status'],
  ['-DSNx START DATABASE','Start database'],
  ['-DSNx START TRACE','Start DB2 trace'],
  ['-DSNx STOP DATABASE','Stop database'],
  ['-DSNx STOP TRACE','Stop trace'],
  ['-DSNx TERM UTILITY','Terminate utility'],
  ['-DSNxSTART DB2 PARM(<parms>)','Start DB2 on LPAR'],
  ['-DSNxSTOP DB2','Stop DB2 on LPAR'],
  ['NN 99SIGNON <uid> <pw>','Sign on to IDMS'],
  ['NN 99BYE','Sign off IDMS'],
  ['DCUF SHOW USERS ALL','Show IDMS users'],
  ['DCMT DIS ACT TASKS','Display IDMS active tasks'],
  ['DCMT D PRI','Display IDMS printers'],
  ['$D JOBCLASS(*)','Display all job classes'],
  ['$D JOBCLASS(<a>,<b>)','Display specific job classes'],
  ['$T JOBCLASS(*),QHELD=Y','Hold all job classes'],
  ['$T JOBCLASS(*),QHELD=N','Release all job classes'],
  ['G <dev1>,<dev2>','Swap tape volumes'],
  ['@D G,<xxx>,#','Display tape drive status'],
  ['@V <xxx>,NOTAVL,G','Vary drive not available all LPARs'],
  ['@V <xxx>,OVER,G','Reset device undefined all LPARs'],
  ['@V <xxx>,AVL,L','Vary drive available local'],
  ['@V <xxx>,AVL,G','Vary drive available all LPARs'],
  ['@V <xxx>,NOTOVER,G','Reset device defined all LPARs'],
  ['DIS A','Display active IMS tasks'],
  ['/STA TRAN <xxxx>','Start IMS transaction'],
  ['/STO TRAN <xxxx>','Stop IMS transaction'],
  ['STA REG <xx>','Start IMS regions'],
  ['/STO REG <xxx>,ABEND','Cancel job/region on IMS'],
  ['/DIS SUBSYS ALL','Display DB2 connections to IMS'],
  ['/STA SUBSYS DB2X','Start DB2 for IMS'],
  ['/DIS CCTL','Display IMS-CICS connection'],
  ['/DIS DB ALL','Display all databases'],
  ['/DIS DB <dbd-name>','Display specific database'],
  ['/DIS TRAN ALL','Display all transactions'],
  ['/DIS TRAN <tran-name>','Display specific transaction'],
  ['/DIS PGM ALL','Display all programs'],
  ['/DIS PGM <pgm-name>','Display specific program'],
  ['/DIS NODE <node-name>','Display specific node'],
  ['/DIS LTERM <lterm-name>','Display logical terminal'],
  ['/DIS ASMT NODE <node-name>','Display lterms for node'],
  ['/DIS ASMT LTERM <lterm-name>','Display node for lterm'],
  ['/DIS STATUS DB','Display stopped databases'],
  ['/DIS STATUS PGM','Display stopped programs'],
  ['/DIS STATUS TRAN','Display stopped transactions'],
  ['/DIS Q TRAN','Display transactions to process'],
  ['/RCL','Log off IMS'],
]

function searchLocalDB(query: string): { command: string; description: string; score: number }[] {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1)
  const scored: { command: string; description: string; score: number }[] = []

  for (const [cmd, desc] of COMMANDS_DB) {
    const cmdLower = cmd.toLowerCase()
    const descLower = desc.toLowerCase()
    let score = 0

    for (const term of terms) {
      if (cmdLower.includes(term)) score += 3
      if (descLower.includes(term)) score += 1
    }

    const queryLower = query.toLowerCase()
    if (cmdLower.includes(queryLower)) score += 5
    if (descLower.includes(queryLower)) score += 2

    if (score > 0) {
      scored.push({ command: cmd, description: desc, score })
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 30)
}

function formatLocalResults(results: { command: string; description: string; score: number }[]): string {
  if (!results.length) return 'No matching commands found in the local database for this query.'
  return results.map(r => `${r.command} - ${r.description}`).join('\n')
}

const rateLimitedModels = new Set<string>()
const FALLBACK_CHAIN: ModelKey[] = ['meta-llama/llama-4-scout-17b-16e-instruct', 'moonshotai/kimi-k2-instruct', 'qwen/qwen3-32b', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'llama-3.3-70b-versatile']

async function callGroq(messages: any[], model?: ModelKey, maxTokens?: number): Promise<string | null> {
  for (const m of FALLBACK_CHAIN) {
    const modelToUse = model ?? m
    if (rateLimitedModels.has(modelToUse)) continue

    const body = JSON.stringify({
      model: modelToUse,
      messages,
      temperature: 0.3,
      max_tokens: maxTokens ?? 1024,
    })

    for (let attempt = 0; attempt < GROQ_API_KEYS.length; attempt++) {
      const key = getNextKey()
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body,
      })

      if (res.status === 429) continue
      if (!res.ok) continue

      const data = await res.json()
      return data?.choices?.[0]?.message?.content ?? null
    }

    rateLimitedModels.add(modelToUse)
  }

  return null
}

const THINKING_PROMPT = `You are a mainframe expert assistant with deep knowledge of IBM z/OS systems. You are having a CONVERSATION with a user — the previous messages in this conversation are provided below as "Chat History".

Before answering, you MUST think step-by-step.

You have THREE sources of information available:
1. **Chat History** — Previous messages in this conversation (provides context for follow-up questions)
2. **Local DB Matches** — Commands from our website's curated database (provided below)
3. **Web Research Results** — LIVE content fetched from the internet (provided below, if available)

ANALYZE THE QUESTION:
1. What specific mainframe topic or command is being asked about?
2. How does this question relate to the previous conversation?
3. What sub-systems, components, or related concepts are involved?
4. Which information sources are most relevant?

REASON STEP-BY-STEP:
- Review the Chat History to understand the conversation context
- Break down the question into parts
- Examine the Web Research Results for relevant information from the internet
- Cross-reference with Local DB Matches for curated command syntax
- Consider your own training knowledge to fill any gaps
- Think about best practices, common pitfalls, and real-world usage

FORMULATE YOUR ANSWER:
- Be thorough and precise
- Reference relevant points from the conversation history when appropriate
- PRIORITIZE live web research data when available — it represents current internet content
- Include command syntax, explanations, and practical examples
- Note any important caveats or prerequisites
- Draw from ALL available sources (web research, local DB, chat history, training knowledge)

You MUST structure your thinking as a clear, logical chain of reasoning. Do NOT skip steps.`

const RESPONSE_PROMPT = `You are a mainframe expert assistant having a CONVERSATION with a user. Below is your step-by-step reasoning about the user's question, along with the chat history. Now produce a clear, well-structured final answer.

Your answer should:
1. Start with a brief context or overview of what the user is asking
2. Reference relevant points from the conversation history when appropriate (e.g. "As you asked earlier about...")
3. List every relevant command with full syntax and description
4. Include practical examples where helpful
5. Draw from ALL available information sources
6. End with any important notes, prerequisites, or related concepts

IMPORTANT — Cite your sources clearly:
  **Command:** <syntax> — Source: Website (for local DB matches)
  **Context:** <explanation> — Source: Web Research (for live internet data)
  **Context:** <explanation> — Source: Knowledge base (for your training knowledge)

Format commands in monospace and keep descriptions clear and actionable.

When Web Research data is available, give it priority — it represents current, live internet content that is more up-to-date than either the local database or your training knowledge.

This is a CONTINUOUS conversation — treat it as such. The user may ask follow-up questions that reference previous topics.`

interface ThinkingStep {
  step: string
  content: string
}

async function generateThinking(userMessage: string, localResults: { command: string; description: string; score: number }[], webResearchText?: string, history?: { role: string; content: string }[]): Promise<{ thinking: string; steps: ThinkingStep[] }> {
  const messages: any[] = [
    { role: 'system', content: THINKING_PROMPT },
    { role: 'system', content: `### Local DB Matches (from our website database):\n${formatLocalResults(localResults)}` },
  ]

  if (webResearchText) {
    messages.push({ role: 'system', content: `### Web Research Results (live from internet):\n${webResearchText}` })
  }

  if (history && history.length > 0) {
    for (const entry of history) {
      messages.push({ role: entry.role, content: entry.content })
    }
  }

  messages.push({ role: 'user', content: userMessage })

  const thinking = await callGroq(messages, undefined, 2048)
  if (!thinking) throw new Error('Failed to generate thinking')

  const steps = parseThinkingSteps(thinking)
  return { thinking, steps }
}

function parseThinkingSteps(text: string): ThinkingStep[] {
  const steps: ThinkingStep[] = []
  const lines = text.split('\n')
  let currentStep = ''
  let currentContent: string[] = []

  for (const line of lines) {
    const headerMatch = line.match(/^(?:ANALYZE|REASON|FORMULATE|Step\s+\d+|1\.|2\.|3\.|4\.|5\.)/i)
    if (headerMatch) {
      if (currentStep) {
        steps.push({ step: currentStep, content: currentContent.join('\n').trim() })
      }
      currentStep = line.trim()
      currentContent = []
    } else if (line.trim()) {
      currentContent.push(line)
    }
  }

  if (currentStep) {
    steps.push({ step: currentStep, content: currentContent.join('\n').trim() })
  }

  if (steps.length === 0) {
    const paragraphs = text.split('\n\n').filter(p => p.trim())
    for (let i = 0; i < paragraphs.length; i++) {
      steps.push({ step: `Step ${i + 1}`, content: paragraphs[i].trim() })
    }
  }

  return steps
}

async function generateResponse(userMessage: string, thinking: string, localResults: { command: string; description: string; score: number }[], webResearchText?: string, history?: { role: string; content: string }[]): Promise<string> {
  const messages: any[] = [
    { role: 'system', content: RESPONSE_PROMPT },
    { role: 'system', content: `### Local DB Matches:\n${formatLocalResults(localResults)}` },
  ]

  if (webResearchText) {
    messages.push({ role: 'system', content: `### Live Web Research Data:\n${webResearchText}` })
  }

  if (history && history.length > 0) {
    for (const entry of history) {
      messages.push({ role: entry.role, content: entry.content })
    }
  }

  messages.push(
    { role: 'system', content: `### Your step-by-step reasoning:\n${thinking}` },
    { role: 'user', content: `Based on your reasoning above, provide your final comprehensive answer to: ${userMessage}` },
  )

  const reply = await callGroq(messages, undefined, 1536)
  if (!reply) throw new Error('Failed to generate response')
  return reply
}

function extractDuckDuckGoResults(html: string): { title: string; snippet: string; url: string }[] {
  const results: { title: string; snippet: string; url: string }[] = []
  const resultBlocks = html.split('<div class="result">')

  for (let i = 1; i < resultBlocks.length; i++) {
    const block = resultBlocks[i]
    const urlMatch = block.match(/href="(https?:\/\/[^"]+)"/)
    const titleMatch = block.match(/<a[^>]*>([^<]+)<\/a>/)
    const snippetMatch = block.match(/class="result-snippet">([^<]*)<\/span>/)

    if (urlMatch && titleMatch) {
      results.push({
        url: urlMatch[1],
        title: titleMatch[1].trim(),
        snippet: snippetMatch ? snippetMatch[1].trim() : '',
      })
    }
  }

  return results
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

function extractRelevantContent(text: string, query: string): string {
  const lowerText = text.toLowerCase()
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2)

  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20)

  const scored = sentences.map(s => {
    const lower = s.toLowerCase()
    let score = 0
    for (const term of queryTerms) {
      if (lower.includes(term)) score++
    }
    return { sentence: s, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .map(s => s.sentence)
    .join('. ')
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
const SEARCH_TIMEOUT = 8000
const PAGE_TIMEOUT = 10000

async function fetchWithTimeout(url: string, timeout: number, headers?: Record<string, string>): Promise<Response | null> {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        ...headers,
      },
    })
    clearTimeout(id)
    return res
  } catch {
    return null
  }
}

async function webResearch(query: string): Promise<{
  found: boolean
  research: string
  sources: { title: string; url: string }[]
}> {
  const searchQuery = encodeURIComponent(query + ' mainframe z/OS IBM')
  const sources: { title: string; url: string }[] = []
  const researchParts: string[] = []

  try {
    const res = await fetchWithTimeout(
      `https://lite.duckduckgo.com/lite/?q=${searchQuery}`,
      SEARCH_TIMEOUT
    )

    if (!res || !res.ok) {
      return { found: false, research: '', sources: [] }
    }

    const html = await res.text()
    const searchResults = extractDuckDuckGoResults(html)

    if (searchResults.length === 0) {
      return { found: false, research: '', sources: [] }
    }

    const topResults = searchResults.slice(0, 3)

    for (const result of topResults) {
      sources.push({ title: result.title, url: result.url })

      const pageRes = await fetchWithTimeout(result.url, PAGE_TIMEOUT)
      if (pageRes && pageRes.ok) {
        const pageHtml = await pageRes.text()
        const cleanText = stripHtml(pageHtml)
        const relevant = extractRelevantContent(cleanText, query)

        if (relevant.length > 50) {
          researchParts.push(`From: ${result.title} (${result.url})\n${relevant}`)
        } else if (result.snippet) {
          researchParts.push(`From: ${result.title} (${result.url})\n${result.snippet}`)
        }
      } else if (result.snippet) {
        researchParts.push(`From: ${result.title} (${result.url})\n${result.snippet}`)
      }
    }

    if (researchParts.length === 0) {
      return { found: false, research: '', sources: [] }
    }

    return {
      found: true,
      research: researchParts.join('\n\n---\n\n'),
      sources,
    }
  } catch {
    return { found: false, research: '', sources: [] }
  }
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

  if (!GROQ_API_KEYS.length) {
    return json(res, 500, { error: 'No GROQ_API_KEYS configured' })
  }

  try {
    const body = await readBody(req)
    const { message, history: rawHistory } = JSON.parse(body)

    if (!message || typeof message !== 'string') {
      return json(res, 400, { error: 'Message is required' })
    }

    const history = (Array.isArray(rawHistory) ? rawHistory : []).filter(
      (m: any) => m.role === 'user' || m.role === 'assistant'
    ).slice(-10) as { role: string; content: string }[]

    const mainframeQuery = message.trim().endsWith('?') ? message.trim().slice(0, -1) + ' in mainframe?' : message.trim() + ' in mainframe'

    const relevance = await checkRelevance(message)
    if (relevance === 'irrelevant') {
      return json(res, 200, { reply: 'I only answer mainframe-related questions. Please ask about IBM z/OS, JCL, COBOL, CICS, console commands, or other mainframe topics.' })
    }

    const localResults = searchLocalDB(mainframeQuery)

    const { found: webFound, research: webResearchText, sources: webSources } = await webResearch(mainframeQuery)

    const { thinking, steps } = await generateThinking(mainframeQuery, localResults, webFound ? webResearchText : undefined, history)

    const reply = await generateResponse(mainframeQuery, thinking, localResults, webFound ? webResearchText : undefined, history)

    return json(res, 200, {
      reply,
      thinking,
      thinkingSteps: steps,
      localMatches: localResults.length,
      webSources: webFound ? webSources : undefined,
      webResearch: webFound ? true : false,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Chat error:', msg)
    return json(res, 500, { error: msg })
  }
}
