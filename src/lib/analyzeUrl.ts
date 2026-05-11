import { AnalysisResult } from '@/types/analyzer'

// In production (Hostinger): no env vars set -> requests go through /api/ai.php (PHP proxy with server-side keys)
// In local dev: set NEXT_PUBLIC_AI_API_URL + NEXT_PUBLIC_AI_API_KEY in .env.local to hit OpenRouter directly
const AI_URL  = process.env.NEXT_PUBLIC_AI_API_URL ?? '/api/ai.php'
const MODEL   = process.env.NEXT_PUBLIC_AI_MODEL   ?? 'xiaomi/mimo-v2-pro'
const API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY ?? process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

function buildPrompt(url: string, content: string): string {
  return `Eres un experto en Optimizacion de Tasa de Conversion (CRO) con mas de 10 anos analizando landing pages B2B y B2C. Analiza el contenido de esta landing page y devuelve un reporte exhaustivo en espanol.

URL analizada: ${url}

CONTENIDO DE LA PAGINA (markdown extraido):
---
${content.slice(0, 12000)}
---

DETECCION DE CONTEXTO (aplica antes de analizar — usa esto para calibrar observation):
- Tipo de negocio: producto digital (SaaS/app), servicio profesional (consultoria, agencia, despacho), negocio con presencia fisica, ecommerce, u otro.
- Modelo de conversion: ¿busca contacto/cita, compra en linea, suscripcion, descarga, o solicitud de propuesta?
- Mercado: B2B, B2C, o mixto.
- Precios: ¿tiene precio fijo visible, requiere cotizacion, o no aplica precio directo?
Usa este contexto en observation para no asumir credito, suscripcion, trial o SaaS si no corresponde.

INSTRUCCIONES CRITICAS:
1. Responde UNICAMENTE con JSON valido puro. Sin markdown, sin backticks, sin texto adicional.
2. En "executiveSummary", empieza con el error mas grave. No digas "La pagina esta bien".
3. Todo el texto del analisis debe estar en ESPANOL.
4. Se especifico y accionable. Menciona elementos reales del contenido, no genericos.
5. Los "points" en cada seccion deben ser maximo 3 frases cortas (max 15 palabras cada una).
6. En secciones con score bajo los points son PROBLEMAS o MEJORAS necesarias.
7. En secciones con score alto los points son FORTALEZAS observadas.
8. improvementIdeas: exactamente 5 ideas ordenadas por prioridad (ALTA primero).
9. technicalSEO: exactamente 4 problemas tecnicos reales inferidos del contenido.
10. En pageSpeed agrega "details": {"desktop": X, "mobile": Y} con scores de velocidad inferidos por separado (0-100).
11. En cada idea de improvementIdeas agrega "inspiration": ["Empresa A", "Empresa B", "Empresa C"] con 2-3 empresas cuyas landing pages son referencia para ese tipo de mejora.
12. Nunca devuelvas un score de 0. El minimo posible es 10.
13. Si una seccion carece de los elementos requeridos, su score base es 15 y su status es "NECESITA TRABAJO".
14. Las UNICAS etiquetas de status validas para secciones son exactamente estas cuatro: "EXCELENTE" (80-100), "BUENA" (60-79), "REGULAR" (40-59), "NECESITA TRABAJO" (10-39). Ninguna otra.
15. overallScore = redondeo del promedio aritmetico de las 8 puntuaciones de secciones.
16. En detectedSections los unicos valores de status validos son: "presente", "mejorar", "necesita mejora". Nunca uses "ausente".
17. En cada seccion agrega "observation": 2 oraciones directas y especificas sobre LO QUE SE DETECTO en ESTA pagina para esa dimension. Menciona elementos reales (titulos, textos, secciones). Adapta el lenguaje al tipo de negocio detectado. No uses frases genericas ni asumas modelo de negocio que no corresponda.

### SISTEMA DE PUNTUACION (PUNTOS ACUMULATIVOS):
Evalua cada criterio como PRESENTE o AUSENTE basandote en el CONCEPTO, no en frases exactas. Variantes similares cuentan igual. Sin evidencia clara = 0 para ese criterio.

1. **TOP OF PAGE (Hero) - [Max 100]**
   - [+20] Propuesta de valor clara: El headline comunica que hace el producto o servicio. Un visitante puede entender el negocio en pocos segundos sin leer el cuerpo del texto. Cualquier headline que nombre la categoria, el beneficio principal o la audiencia puntua.
   - [+20] Prueba social en el hero: Cualquier elemento de credibilidad dentro de la seccion hero: logos de clientes, cifras de uso o rendimiento (numero de usuarios, clientes, metricas de resultado), o citas de clientes reales. Cuenta si esta en el hero aunque sea debajo del CTA.
   - [+15] Reductor de riesgo junto al CTA: Cualquier texto cercano al boton principal que reduzca el compromiso percibido: free trial, plan gratuito, sin tarjeta de credito, cancelacion facil, garantia, o similar.
   - [+12] Claridad de audiencia: Se menciona explicitamente para quien es el producto: tipo de empresa, industria, rol, tamano, o caso de uso especifico. "Empresas" o "negocios" sin mas detalle no puntua.
   - [+12] Visual del producto real: Se muestra la interfaz, dashboard o demo del producto. Ilustraciones genericas, iconos decorativos o fotos de personas no cuentan.
   - [+8] Jerarquia visual: Existe una estructura clara de headline principal, subtitulo y CTA, con diferencia perceptible de peso visual entre los niveles.
   - [+7] Timeframe de resultado: Se menciona un tiempo concreto de cuando el usuario vera resultados o podra empezar a usar el producto.
   - [+6] Diferenciacion: Se posiciona explicitamente frente a alternativas o se declara que hace unico al producto frente a la competencia.
   *DEDUCCION:* Si el headline es completamente vacio de informacion (solo marca, frase de relleno o esogan sin ningun referente al servicio), resta 10 puntos del total. Un headline que al menos comunica la categoria no sufre esta deduccion.

2. **VALUE PROPOSITION - [Max 100]**
   - [+30] Resultados cuantificados: Al menos un beneficio expresado con numero concreto: ahorro de tiempo, reduccion de costos, aumento de velocidad, mejora porcentual o cualquier metrica con magnitud real.
   - [+25] Beneficios especificos y visualizables: Los beneficios describen resultados concretos que el lector puede imaginar, no mejoras abstractas.
   - [+20] Multiples proposiciones: Se presentan 3 o mas beneficios o angulos de valor distintos, no un unico punto de venta.
   - [+15] Mecanismo diferenciador: Se explica, aunque sea brevemente, como o por que el producto logra esos resultados de forma distinta a las alternativas.
   - [+10] Links de profundidad: Existen enlaces a paginas o secciones que explican cada beneficio con mas detalle.
   *PENALIZACION:* Si todos los beneficios son genericos e intercambiables con cualquier competidor (frases del tipo "mejora tu productividad", "crece tu negocio", "transforma tu empresa" sin ningun respaldo concreto), score MAXIMO = 39.

3. **CONFIANZA (Testimonios) - [Max 100]**
   - [+30] Historia de transformacion: Al menos un testimonio que muestre el antes y el despues: como era la situacion del cliente antes del producto y que cambio. No aplica a elogios genericos sin contexto.
   - [+25] Resultados con metricas: Al menos un testimonio que incluya un numero, porcentaje o magnitud concreta del impacto obtenido.
   - [+20] Atribucion completa: Los testimonios muestran nombre, cargo y empresa del cliente. Testimonios anonimos o sin contexto profesional no puntuan este criterio.
   - [+15] Profundidad adicional: Existen casos de estudio, testimonios expandidos o links a historias completas de clientes.
   - [+10] Testimonio en video: Se incluye al menos un video testimonial de un cliente real.
   *PENALIZACION:* Si los testimonios son anonimos o carecen de cargo y empresa, score MAXIMO = 20.

4. **CONVERSION (CTA Section) - [Max 100]**
   - [+35] Camino secundario: Existe una opcion alternativa para visitantes que no estan listos para el CTA principal: ver demo, ver precios, leer casos de estudio, o similar.
   - [+30] Microcopy de apoyo: Hay texto cerca del boton que resuelve la ultima duda antes de hacer clic: numero de usuarios, promesa de acceso inmediato, ausencia de compromiso, o cualquier refuerzo de confianza.
   - [+20] Reductor de friccion: Texto adyacente al CTA principal que elimina la barrera del compromiso: sin tarjeta de credito, plan gratis, cancelacion facil, prueba gratuita, garantia, o equivalente.
   - [+15] CTA unico y claro: Hay un boton primario claramente dominante. Si hay multiples CTAs del mismo peso visual compitiendo por atencion, no puntua.
   *PENALIZACION:* Si no existe ningun camino alternativo para visitantes indecisos, score MAXIMO = 39.

5. **COPYWRITING - [Max 100]**
   - [+30] Lenguaje orientado al cliente: El copy habla del problema y resultado del cliente, no de las caracteristicas del producto. Usa el vocabulario del lector, no jerga interna de la empresa.
   - [+25] Agitacion del problema: Se describe el dolor o frustracion del cliente antes de presentar la solucion. La pagina no comienza directamente con features.
   - [+20] Manejo de objeciones: Se abordan explicitamente las principales dudas o resistencias del cliente potencial: precio, complejidad, tiempo de implementacion, o aprendizaje.
   - [+15] Verbos activos y directos: El copy usa verbos de accion que comunican resultados concretos, no verbos pasivos o corporativos que describen capacidades abstractas.
   - [+10] Segunda persona: El copy se dirige al lector directamente en lugar de hablar en tercera persona de los usuarios o las empresas.
   *PENALIZACION:* Si el copy es predominantemente empresa-centrico (mas sobre la historia, valores o equipo de la empresa que sobre el problema y resultado del cliente), score MAXIMO = 40.

6. **DISENO Y UX - [Max 100]**
   - [+30] Escaneabilidad: Los titulos de seccion comunican valor por si solos sin necesidad de leer el cuerpo. Un visitante que solo escanea los headings entiende la propuesta.
   - [+25] Flujo narrativo logico: La pagina sigue un arco coherente (problema, solucion, evidencia, accion). No comienza con la empresa ni termina sin llamada a la accion.
   - [+20] Jerarquia del CTA: El boton de accion principal es el elemento visualmente mas prominente de su seccion.
   - [+15] Densidad de contenido adecuada: No hay bloques de texto largos sin respiro visual. La informacion esta organizada en fragmentos legibles.
   - [+10] Coherencia del mensaje: El tono, la promesa y los CTAs son consistentes a lo largo de toda la pagina sin contradicciones.

7. **EXPERIENCIA MOVIL - [Max 100]** (inferida del contenido y su estructura)
   - [+35] Estructura adaptable: El contenido no depende de comparativas horizontales, tablas complejas o interacciones que solo funcionan en desktop.
   - [+30] CTAs accesibles: Los botones principales estan en posicion prominente y no requieren scroll excesivo para ser alcanzados.
   - [+20] Legibilidad del texto: El contenido esta organizado en parrafos cortos. No hay bloques densos de texto que requieran zoom o lectura continua.
   - [+15] Sin elementos intrusivos: No hay indicios de popups agresivos, banners superpuestos o videos de reproduccion automatica que degraden la experiencia.

8. **VELOCIDAD DE PAGINA - [Max 100]** (inferida de la complejidad detectada en el contenido)
   - [+40] Pocos assets pesados: No se detectan iframes multiples, embeds de video sin carga diferida, o scripts de terceros en cantidad.
   - [+35] Imagenes razonables: No hay indicios de imagenes de alta resolucion sin optimizacion o multiples imagenes de gran tamano en la parte superior.
   - [+25] Estructura tecnica simple: La pagina no presenta senales de frameworks muy pesados, exceso de trackers o fuentes externas multiples.
   Devuelve "details": {"desktop": X, "mobile": Y} donde el score mobile suele ser entre 15 y 25 puntos menor que desktop.


Devuelve EXACTAMENTE esta estructura JSON:

{
  "url": "${url}",
  "tipo": "tipo de pagina detectado",
  "objetivo": "objetivo principal de conversion inferido",
  "persona": "audiencia objetivo inferida",
  "industria": "industria o sector",
  "overallScore": 65,
  "label": "Buena",
  "executiveSummary": "2-3 oraciones criticas y directas sobre el estado actual de conversion de la pagina",
  "strengths": [
    "fortaleza especifica observada 1",
    "fortaleza especifica observada 2",
    "fortaleza especifica observada 3"
  ],
  "toImprove": [
    "mejora concreta y accionable 1",
    "mejora concreta y accionable 2",
    "mejora concreta y accionable 3"
  ],
  "sections": {
    "topOfPage": {
      "score": 82,
      "status": "EXCELENTE",
      "points": ["observation concreta 1", "observation concreta 2", "observation concreta 3"],
      "observation": "Oracion especifica sobre lo que se detecto en la primera pantalla de esta pagina. Segunda oracion con lo que falta o lo que funciona bien, adaptada al tipo de negocio."
    },
    "valueProposition": {
      "score": 72,
      "status": "BUENA",
      "points": ["observation 1", "observation 2", "observation 3"],
      "observation": "Observation especifica sobre como esta pagina comunica sus beneficios. Segunda oracion con la brecha concreta detectada."
    },
    "copywriting": {
      "score": 58,
      "status": "REGULAR",
      "points": ["problema 1", "problema 2", "problema 3"],
      "observation": "Observation especifica sobre el tono y enfoque del copy de esta pagina. Segunda oracion con el cambio concreto recomendado."
    },
    "trust": {
      "score": 30,
      "status": "NECESITA TRABAJO",
      "points": ["problema 1", "problema 2", "problema 3"],
      "observation": "Observation especifica sobre la prueba social detectada en esta pagina. Segunda oracion con lo que falta y por que importa para este tipo de negocio."
    },
    "designUX": {
      "score": 75,
      "status": "BUENA",
      "points": ["observation 1", "observation 2", "observation 3"],
      "observation": "Observation especifica sobre la estructura visual y navegacion de esta pagina. Segunda oracion sobre el flujo del visitante."
    },
    "conversion": {
      "score": 65,
      "status": "BUENA",
      "points": ["observation 1", "observation 2", "observation 3"],
      "observation": "Observation especifica sobre los llamados a la accion de esta pagina. Segunda oracion sobre lo que facilita o dificulta que el visitante de el siguiente paso."
    },
    "mobileExperience": {
      "score": 68,
      "status": "BUENA",
      "points": ["observation 1", "observation 2", "observation 3"],
      "observation": "Observation especifica sobre como se comporta esta pagina en dispositivos moviles basada en su estructura. Segunda oracion con el impacto concreto detectado."
    },
    "pageSpeed": {
      "score": 70,
      "status": "BUENA",
      "points": ["observation 1", "observation 2", "observation 3"],
      "details": {"desktop": 78, "mobile": 52},
      "observation": "Observation especifica sobre los elementos de peso o complejidad detectados en esta pagina. Segunda oracion sobre el impacto en la experiencia del visitante."
    }
  },
  "detectedSections": [
    {"number": 1, "name": "Hero", "status": "presente"},
    {"number": 2, "name": "CTA Principal", "status": "presente"},
    {"number": 3, "name": "Prueba Social / Trust", "status": "necesita mejora"},
    {"number": 4, "name": "Como Funciona", "status": "presente"},
    {"number": 5, "name": "Features / Beneficios", "status": "presente"},
    {"number": 6, "name": "Problema / Pain Point", "status": "mejorar"},
    {"number": 7, "name": "Testimonios", "status": "necesita mejora"},
    {"number": 8, "name": "Pricing", "status": "necesita mejora"}
  ],
  "improvementIdeas": [
    {
      "title": "titulo accionable corto de la mejora",
      "section": "HERO",
      "priority": "ALTA",
      "detail": "Explicacion especifica de que cambiar, por que y que impacto tendra",
      "inspiration": ["Scout", "Intercom", "Synthesia"]
    }
  ],
  "technicalSEO": [
    {
      "problem": "nombre del problema SEO detectado",
      "priority": "MEDIA",
      "solution": "como solucionarlo concretamente"
    }
  ]
}`
}

export async function fetchPageContent(url: string): Promise<string> {
  const jinaUrl = `https://r.jina.ai/${url}`
  const res = await fetch(jinaUrl, {
    headers: {
      'Accept': 'text/plain',
      'X-Return-Format': 'markdown',
    },
  })
  if (!res.ok) throw new Error(`No se pudo acceder a la pagina (${res.status})`)
  return res.text()
}

function repairTruncatedJson(raw: string): string {
  // Find the start of the root object
  const start = raw.indexOf('{')
  if (start === -1) return raw
  let s = raw.slice(start)

  // Drop any trailing incomplete string (unclosed quote)
  const lastQuote = s.lastIndexOf('"')
  const beforeLastQuote = s.slice(0, lastQuote)
  const quoteCount = (beforeLastQuote.match(/(?<!\\)"/g) ?? []).length
  if (quoteCount % 2 !== 0) {
    // The last quote opened a string that never closed — trim back to the last comma or colon
    s = s.slice(0, lastQuote).replace(/[,:\s]+$/, '')
  }

  // Close open arrays and objects by tracking depth
  const stack: string[] = []
  let inString = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '\\' && inString) { i++; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') stack.push('}')
    else if (ch === '[') stack.push(']')
    else if (ch === '}' || ch === ']') stack.pop()
  }

  // Remove trailing comma before we close
  s = s.replace(/,\s*$/, '')
  return s + stack.reverse().join('')
}

export async function analyzeWithAI(url: string, content: string): Promise<AnalysisResult> {
  const systemPrompt = 'Actua como un Auditor de Conversion (CRO) cinico y ultra-exigente. Tu estandar es la perfeccion. No regales puntos. Se directo, critico y especifico. No des consejos genericos.'

  const res = await fetch(AI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? {
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://moleai.io',
        'X-Title': 'MoleAI Landing Analyzer',
      } : {}),
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: buildPrompt(url, content) },
      ],
      max_tokens: 16000,
      temperature: 0,
      top_p: 1,
      seed: 42,
      provider: {
        order: ['DeepSeek'],
        allow_fallbacks: false,
      },
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    const msg = data?.error?.message ?? data?.error ?? JSON.stringify(data)
    throw new Error(`Error del modelo: ${msg}`)
  }

  const choice = data.choices?.[0]
  const finishReason: string = choice?.finish_reason ?? ''

  // Pull raw text — some providers nest it differently
  const raw: string = choice?.message?.content ?? choice?.text ?? ''

  if (!raw) {
    // finish_reason=length means the model ran out of tokens mid-response
    if (finishReason === 'length') {
      throw new Error('La respuesta fue cortada por límite de tokens. Intenta de nuevo o usa un modelo con mayor contexto de salida.')
    }
    const detail = JSON.stringify(data).slice(0, 400)
    throw new Error(`La IA no devolvió contenido. Respuesta: ${detail}`)
  }

  // Warn in console but don't crash — truncated JSON may still be repairable
  if (finishReason === 'length') {
    console.warn('[analyzeWithAI] finish_reason=length — intentando reparar JSON truncado')
  }

  // Normalize: strip markdown code fences models add despite being told not to
  function extractJsonString(s: string): string {
    // ```json ... ``` or ``` ... ```
    const fenced = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (fenced) return fenced[1].trim()
    // Bare JSON object anywhere in the string
    const obj = s.match(/\{[\s\S]*\}/)
    return obj ? obj[0] : s
  }

  const candidates: string[] = []
  const extracted = extractJsonString(raw)
  candidates.push(extracted)
  candidates.push(repairTruncatedJson(extracted))
  // Also try from the raw string directly
  const rawObj = raw.match(/\{[\s\S]*\}/)
  if (rawObj) {
    candidates.push(rawObj[0])
    candidates.push(repairTruncatedJson(rawObj[0]))
  }

  for (const candidate of candidates) {
    try { return JSON.parse(candidate) as AnalysisResult } catch { /* try next */ }
  }

  throw new Error('No se pudo parsear la respuesta de la IA')
}
