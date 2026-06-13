import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import HeroSection from './components/HeroSection'
import ConsoleCommands from './components/ConsoleCommands'
import BatchOperations from './components/BatchOperations'
import YoutubeRepository from './components/YoutubeRepository'
import IPLConcept from './components/IPLConcept'
import Chatbot from './components/Chatbot'

export default function App() {
  return (
    <div
      className="min-h-screen bg-black tracking-[-0.02em] overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Nav />
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/console" element={<ConsoleCommands />} />
        <Route path="/batch" element={<BatchOperations />} />
        <Route path="/youtube" element={<YoutubeRepository />} />
        <Route path="/ipl" element={<IPLConcept />} />
      </Routes>
      <Chatbot />
    </div>
  )
}
