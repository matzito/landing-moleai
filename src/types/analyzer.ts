export type EstadoSeccion = 'EXCELENTE' | 'BUENA' | 'REGULAR' | 'NECESITA TRABAJO'
export type Prioridad    = 'ALTA' | 'MEDIA' | 'BAJA'
export type EstadoSeccionDetectada = 'presente' | 'mejorar' | 'necesita mejora'

export interface SeccionAnalisis {
  puntuacion: number
  estado: EstadoSeccion
  puntos: string[]
  observacion?: string
  detalles?: Record<string, number | string>
}

export interface IdeaMejora {
  titulo: string
  seccion: string
  prioridad: Prioridad
  detalle: string
  inspiracion?: string[]
}

export interface ProblemasSEO {
  problema: string
  prioridad: Prioridad
  solucion: string
}

export interface SeccionDetectada {
  numero: number
  nombre: string
  estado: EstadoSeccionDetectada
}

export interface PageSpeedData {
  mobileScore:  number
  desktopScore: number
  mobile:  { fcp: string; lcp: string; cls: string; tbt: string; si: string }
  desktop: { fcp: string; lcp: string; cls: string; tbt: string; si: string }
}

export interface AnalisisResult {
  url: string
  tipo: string
  objetivo: string
  persona: string
  industria: string
  puntuacionGeneral: number
  etiqueta: string
  resumenEjecutivo: string
  fortalezas: string[]
  aMejorar: string[]
  secciones: {
    topOfPage:        SeccionAnalisis
    propuestaDeValor: SeccionAnalisis
    copywriting:      SeccionAnalisis
    confianza:        SeccionAnalisis
    disenoUX:         SeccionAnalisis
    conversion:       SeccionAnalisis
    experienciaMovil: SeccionAnalisis
    velocidadPagina:  SeccionAnalisis
  }
  seccionesDetectadas: SeccionDetectada[]
  ideasMejora: IdeaMejora[]
  seoTecnico: ProblemasSEO[]
  pageSpeedData?: PageSpeedData
}

export interface HistorialItem {
  id: string
  url: string
  hostname: string
  score: number
  label: string
  createdAt: string
  result: AnalisisResult
}
