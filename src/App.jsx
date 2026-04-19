import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProcessFlow from './components/ProcessFlow'
import TheDifference from './components/TheDifference'
import ArchitectureSection from './components/ArchitectureSection'
import CapabilityMatrix from './components/CapabilityMatrix'
import ComparisonSection from './components/ComparisonSection'
import TechMarquee from './components/TechMarquee'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-[#F0F2F3]">
      <Navbar />
      <main>
        <Hero />
        <TechMarquee />
        <ProcessFlow />
        <ArchitectureSection />
        <TheDifference />
        <ComparisonSection />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
