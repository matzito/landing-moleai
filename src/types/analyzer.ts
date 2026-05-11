export type SectionStatus = 'EXCELENTE' | 'BUENA' | 'REGULAR' | 'NECESITA TRABAJO'
export type Priority    = 'ALTA' | 'MEDIA' | 'BAJA'
export type DetectedSectionStatus = 'presente' | 'mejorar' | 'necesita mejora'

export interface SectionAnalysis {
  score: number
  status: SectionStatus
  points: string[]
  observation?: string
  details?: Record<string, number | string>
}

export interface ImprovementIdea {
  title: string
  section: string
  priority: Priority
  detail: string
  inspiration?: string[]
}

export interface SEOIssue {
  problem: string
  priority: Priority
  solution: string
}

export interface DetectedSection {
  number: number
  name: string
  status: DetectedSectionStatus
}

export interface PageSpeedData {
  mobileScore:  number
  desktopScore: number
  mobile:  { fcp: string; lcp: string; cls: string; tbt: string; si: string }
  desktop: { fcp: string; lcp: string; cls: string; tbt: string; si: string }
}

export interface AnalysisResult {
  url: string
  tipo: string
  objetivo: string
  persona: string
  industria: string
  overallScore: number
  label: string
  executiveSummary: string
  strengths: string[]
  toImprove: string[]
  sections: {
    topOfPage:        SectionAnalysis
    valueProposition: SectionAnalysis
    copywriting:      SectionAnalysis
    trust:            SectionAnalysis
    designUX:         SectionAnalysis
    conversion:       SectionAnalysis
    mobileExperience: SectionAnalysis
    pageSpeed:        SectionAnalysis
  }
  detectedSections: DetectedSection[]
  improvementIdeas: ImprovementIdea[]
  technicalSEO: SEOIssue[]
  pageSpeedData?: PageSpeedData
}

export interface HistoryItem {
  id: string
  url: string
  hostname: string
  score: number
  label: string
  createdAt: string
  result: AnalysisResult
}
