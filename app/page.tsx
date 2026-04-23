import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ProcessFlow from '@/components/ProcessFlow'
import ArchitectureSection from '@/components/ArchitectureSection'
import TheDifference from '@/components/TheDifference'
import ComparisonSection from '@/components/ComparisonSection'
import TechMarquee from '@/components/TechMarquee'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Mole AI — Impulsando la Próxima Generación de Empresas con IA',
  description:
    'Diseñamos y desplegamos soluciones punta a punta: desde aplicaciones móviles robustas e integraciones críticas de sistemas, hasta arquitecturas de agentes autónomos que transforman procesos en flujos de ejecución deterministas.',
  keywords: [
    'ingeniería de software',
    'inteligencia artificial',
    'agentes autónomos',
    'orquestación de agentes',
    'integración de sistemas',
    'LangChain',
    'automatización de procesos',
  ],
  openGraph: {
    title:
      'Mole AI — Ingeniería de Software e Integración de Inteligencia Artificial para la Próxima Generación de Empresas',
    description:
      'Llevamos su negocio al siguiente nivel con agentes autónomos inteligentes. Desarrollamos la infraestructura necesaria para que su empresa opere con eficiencia máxima y autonomía.',
    locale: 'es_MX',
    type: 'website',
  },
}

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F0F2F3]">
      <Navbar />
      <main>
        <Hero />
        <TechMarquee />
        <ProcessFlow />
        <ArchitectureSection />
        {/* <AgentGraph /> */}
        <TheDifference />
        <ComparisonSection />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
