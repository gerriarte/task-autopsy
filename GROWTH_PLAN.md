# Task Autopsy — Plan de Crecimiento

> De side-project a producto real. Roadmap estrategico para convertir Task Autopsy en una herramienta de productividad rentable para personas con ADHD.

---

## Vision del Producto

**Task Autopsy** resuelve un problema real: las personas con ADHD (y cualquiera que sufra analisis-paralisis) no pueden arrancar tareas grandes porque no saben por donde empezar. La AI descompone tareas vagas en pasos concretos de 15-30 minutos, y el timer + Focus Mode mantienen el foco.

**Diferenciador clave:** No es otro todo-list. Es un sistema de descomposicion inteligente + ejecucion guiada, disenado para cerebros que se dispersan.

**Modelo BYOK (Bring Your Own Key):** El usuario conecta su propia API key de AI (Claude, OpenAI o Gemini). Esto significa cero costo de AI para nosotros, total transparencia para el usuario, y sin dependencia de un backend costoso.

---

## Modelo de Negocio: BYOK (Bring Your Own Key)

### Por que BYOK es la decision correcta

1. **Cero costo de AI** — El usuario paga directo a su proveedor. No hay margen que gestionar ni costos que escalen
2. **Confianza** — El usuario sabe exactamente donde va su data y su key (localStorage, nunca un server tercero)
3. **Sin backend obligatorio** — La app funciona 100% client-side. Reduce complejidad y costos de infra a casi cero
4. **Multi-provider nativo** — El usuario elige Claude, OpenAI o Gemini segun su preferencia/budget
5. **Target audience compatible** — Personas que ya usan herramientas de AI y tienen API keys. Early adopters, founders, devs, power users con ADHD

### El riesgo y como mitigarlo

El riesgo de BYOK es friccion de onboarding — no todo el mundo tiene una API key. Mitigaciones:

- **Guia paso a paso** en la app para obtener una key (ya implementado en Settings)
- **Google Gemini como default sugerido** — tiene tier gratuito generoso, perfecto para probar
- **Video tutorial de 60 segundos** — "Como obtener tu API key gratis en 2 minutos"
- **Futura opcion:** Ofrecer un tier "hosted" opcional donde nosotros proveemos la AI por un fee mensual (sin reemplazar BYOK)

---

## Tier 1 — Fundamentos (Sin esto no es producto)

### 1.1 Autenticacion + Cloud Sync
**Prioridad:** CRITICA | **Esfuerzo:** 1-2 dias | **Status:** Pendiente

localStorage no escala. Si el usuario borra cache, pierde todo.

- **Stack recomendado:** Supabase (Auth + Postgres + Realtime)
  - Login con Google en 1 click (minima friccion)
  - Postgres gratuito hasta 500MB (suficiente para miles de usuarios)
  - Row Level Security para multi-tenancy
- **Patron:** Offline-first con cola de sincronizacion
  - La app funciona sin internet (localStorage como cache)
  - Cuando hay conexion, sincroniza cambios al servidor
  - Conflictos: last-write-wins (simple, efectivo)
- **Migracion:** Script que toma datos de localStorage y los sube al crear cuenta
- **Importante:** La API key del usuario se guarda SOLO en localStorage, nunca se sube al server

### 1.2 Onboarding Guiado
**Prioridad:** ALTA | **Esfuerzo:** 4-6 horas | **Status:** Pendiente

El momento mas fragil. Un usuario con ADHD que no entiende la app en 30 segundos, se va.

- **Tarea demo pre-cargada:** Al entrar por primera vez, ya hay una tarea descompuesta de ejemplo para que el usuario interactue (sin necesitar API key)
- **3 tooltips maximo:** "Escribi algo vago -> la AI lo descompone -> timer por paso"
- **Celebracion al completar la primera subtask:** Feedback positivo inmediato
- **Setup de API key:** Guia visual para obtener una key gratis (Gemini como opcion recomendada para empezar)

### 1.3 Landing Page
**Prioridad:** ALTA | **Esfuerzo:** 1 dia | **Status:** Pendiente

Sin landing, no hay forma de capturar trafico ni explicar el producto.

- Hero: "Tu cerebro no esta roto. Solo necesita un sistema diferente."
- Demo interactiva (video 60s o GIF)
- 3 features clave con screenshots
- Seccion "Como empezar" explicando BYOK en terminos simples
- CTA: "Proba gratis — solo necesitas una API key"

---

## Tier 2 — Retencion (Lo que hace que vuelvan)

### 2.1 Notificaciones Push + Recordatorios
**Prioridad:** ALTA | **Status:** ✅ IMPLEMENTADO

Sistema completo de notificaciones browser:
- Timer complete, subtask/task complete
- Streak at risk (despues de las 14h)
- Pending tasks (despues de 2h sin actividad)
- Quiet hours configurable (default 22-08)
- Max 1 reminder cada 4 horas
- Panel de configuracion con toggles por tipo

### 2.2 Plantillas de Tareas Recurrentes
**Prioridad:** MEDIA | **Esfuerzo:** 3-4 horas | **Status:** Pendiente

Las personas con ADHD repiten las mismas tareas dificiles cada semana/mes.

- Boton "Repetir esta tarea" que clona la estructura de subtasks
- Plantillas pre-armadas por categoria:
  - Freelancer: "Preparar propuesta para cliente", "Hacer facturacion mensual"
  - Founder: "Preparar pitch deck", "Revisar metricas semanales"
  - Marketing: "Planificar contenido semanal", "Analizar performance de campana"
- Las plantillas se refinan con el uso (la AI aprende de tus descomposiciones anteriores)

### 2.3 Insights Personalizados con AI
**Prioridad:** ALTA | **Esfuerzo:** 1-2 dias | **Status:** Pendiente

Aca esta el verdadero moat del producto. Ningun todo-list hace esto. Usa la API key del usuario para generar insights — costo minimo, valor enorme.

- Analisis semanal automatico:
  - "Tus tareas de venta siempre tardan 2x mas de lo estimado"
  - "Completas mas en bloques de manana que de tarde"
  - "Hace 3 semanas que evitas tareas de tipo operativo"
- Sugerencias de mejora:
  - "Proba descomponer las tareas de venta en pasos mas chicos (10 min)"
  - "Tu ventana de foco optima parece ser 9-11am"
- Este feature es PREMIUM — justifica el precio solo

---

## Tier 3 — Monetizacion

### 3.1 Modelo Freemium (BYOK)

El usuario siempre usa su propia API key. Lo que se monetiza es la plataforma, no la AI.

```
GRATIS (para siempre):
- 3 tareas activas simultaneas
- Descomposicion basica (hasta 5 subtasks)
- Timer + Focus Mode
- Stats basicos (streak, subtasks completadas)
- Notificaciones
- Datos en localStorage (sin sync)

PRO ($7-10 USD/mes):
- Tareas ilimitadas
- Descomposicion profunda (subtasks ilimitadas)
- Insights de AI personalizados (reporte semanal)
- Plantillas recurrentes
- Export CSV/JSON + Webhooks
- Cloud sync multi-dispositivo (Supabase)
- Soporte prioritario

TEAM ($12-18 USD/usuario/mes) — Fase futura:
- Todo PRO + dashboard de equipo
- Tareas compartidas
- Metricas de equipo
```

### 3.2 Pricing Strategy

- **$7-10/mes** — mas accesible que Todoist ($5) y Notion ($10), con angulo unico
- El precio es bajo porque no tenemos costos de AI (BYOK)
- **Annual discount:** 2 meses gratis ($70-80/ano)
- **Lifetime deal** para early adopters: $120-150 (genera cash flow inicial + evangelistas)
- Payment: Stripe Checkout o Lemon Squeezy (integra en horas)

### 3.3 Que justifica pagar si la AI es del usuario?

La gente paga por:
1. **Cloud sync** — no perder sus datos al cambiar de browser/device
2. **Insights** — analisis de patrones que la AI genera sobre SUS datos
3. **Plantillas** — no re-descomponer la misma tarea cada mes
4. **Ilimitado** — mas de 3 tareas activas
5. **La UX** — el sistema completo (timer + foco + streak + learning path) es el valor

### 3.4 Metricas Target

| Metrica | Target Mes 3 | Target Mes 6 | Target Mes 12 |
|---------|-------------|-------------|---------------|
| Usuarios registrados | 500 | 2,000 | 10,000 |
| Usuarios activos (WAU) | 150 | 600 | 3,000 |
| Conversion free->pro | 5% | 8% | 10% |
| MRR | $300 | $1,200 | $10,000 |
| Churn mensual | <15% | <10% | <7% |

---

## Tier 4 — Distribucion y Growth

### 4.1 Landing Page + SEO
**Keywords target:**
- "task manager for adhd" (baja competencia, alta intencion)
- "adhd productivity app" (volumen medio)
- "how to break down tasks adhd" (informacional, funnel top)
- "pomodoro for adhd" (competencia media)
- "ai task decomposition" (nicho, alta intencion)

**Estructura de la landing:**
1. Hero: "Tu cerebro no esta roto. Solo necesita un sistema diferente."
2. Demo interactiva (video 60s o GIF)
3. 3 features clave con screenshots
4. "Como funciona" — explicar BYOK de forma simple y atractiva
5. Testimonio personal (tu historia como founder con ADHD)
6. CTA: "Proba gratis — solo necesitas una API key gratuita"

**Stack sugerido:** Misma app React con ruta /landing, o Astro para SSG + SEO

### 4.2 Comunidad ADHD (Growth Organico)

**Reddit:**
- r/ADHD (1.8M miembros) — compartir tu historia, no vender
- r/productivity (2M) — posts de valor sobre descomposicion de tareas
- r/EntrepreneurRideAlong — tu build-in-public journey

**Twitter/X:**
- Build in public: compartir progreso, metricas, decisiones
- Threads sobre ADHD + productividad (alto engagement)
- Conectar con creators del nicho ADHD

**TikTok:**
- Videos cortos mostrando la magia: "mira como la AI descompone esto"
- Formato: problema (tarea enorme) -> solucion (3 clicks, ya esta descompuesta)
- El nicho ADHD en TikTok es ENORME

**YouTube:**
- "Como uso AI para manejar mi ADHD como founder" — formato documental
- Tutoriales de la herramienta

### 4.3 Product Hunt Launch

**Cuando:** Despues de tener ~50 beta users con feedback positivo

**Preparacion:**
- 5 testimonios reales de beta users
- GIF/video demo pulido
- Responder cada comentario el dia del launch
- Postear un martes o miercoles (mejores dias)

**Target:** Top 5 del dia = ~500-1,000 signups

### 4.4 Partnerships

- **Coaches de ADHD:** Que recomienden la herramienta a sus clientes
- **Terapeutas/psicologos:** Como herramienta complementaria
- **Podcasts de productividad:** Guest appearances contando tu historia
- **Influencers ADHD:** Colaboraciones (ellos prueban la app en video)

---

## Roadmap de Ejecucion

### Mes 1 — Fundamentos
- [ ] Supabase auth + sync
- [ ] Onboarding con tarea demo (funciona sin API key)
- [ ] Landing page basica
- [ ] Video "Como obtener tu API key gratis"
- [ ] Empezar a juntar emails (waitlist)

### Mes 2 — Retencion
- [x] Notificaciones push (implementado)
- [ ] Plantillas recurrentes
- [ ] Analytics basico (Plausible/PostHog)
- [ ] Beta cerrado con 20-50 usuarios
- [ ] Iterar basado en feedback

### Mes 3 — Monetizacion
- [ ] Stripe/Lemon Squeezy integration
- [ ] Paywall de features PRO
- [ ] Insights de AI v1
- [ ] Product Hunt launch
- [ ] Empezar contenido Reddit/Twitter

### Mes 4-6 — Growth
- [ ] SEO optimization
- [ ] Contenido en TikTok/YouTube
- [ ] Partnerships con coaches ADHD
- [ ] Feature requests de usuarios PRO
- [ ] A/B test de pricing

### Mes 6-12 — Escala
- [ ] App nativa (React Native o Capacitor)
- [ ] Team features
- [ ] Integraciones nativas (Slack, Calendar)
- [ ] Internacionalizacion (ingles prioritario)
- [ ] Opcion "hosted AI" para usuarios que no quieren BYOK

---

## Stack Tecnico

| Capa | Actual | Para escalar |
|------|--------|-------------|
| Frontend | React + Vite | Mantener |
| State | Zustand | Mantener + sync layer |
| Styling | Tailwind v4 | Mantener |
| Auth | — | Supabase Auth |
| DB | localStorage | Supabase Postgres (PRO) / localStorage (FREE) |
| AI | BYOK multi-provider | Mantener + opcion hosted futura |
| Payments | — | Stripe o Lemon Squeezy |
| Analytics | — | PostHog (free tier) |
| Hosting | — | Vercel o Cloudflare Pages |
| CDN | — | Cloudflare (gratis) |

---

## Features Implementados (Status actual)

| Feature | Status |
|---------|--------|
| Descomposicion de tareas con AI | ✅ |
| Multi-provider (Claude, OpenAI, Gemini) | ✅ |
| Timer por subtask con pause/resume | ✅ |
| Focus Mode (pantalla completa) | ✅ |
| Drag & drop de subtasks | ✅ |
| Learning Path (gaps de conocimiento) | ✅ |
| Dashboard de progreso + streaks | ✅ |
| Tiempo estimado vs real por tarea | ✅ |
| Export CSV/JSON | ✅ |
| Webhooks (Zapier, Make, n8n, Sheets) | ✅ |
| PWA (instalable + offline) | ✅ |
| Diseno Zen japones | ✅ |
| Notificaciones browser | ✅ |
| Agregar mas pasos con AI | ✅ |

---

## Ventaja Competitiva

1. **Nicho definido:** ADHD productivity (no "todo para todos")
2. **AI como core, no como feature:** La descomposicion inteligente ES el producto
3. **BYOK = cero costo de AI:** Modelo sostenible desde el dia 1
4. **Insights conductuales:** Ningun competidor analiza tus patrones de procrastinacion
5. **Historia autentica:** Founder con ADHD construyendo para personas con ADHD
6. **Bajo costo operativo:** Sin servidores de AI, Supabase free tier, hosting estatico

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigacion |
|--------|-------------|------------|
| Friccion de BYOK (no todos tienen API key) | Media | Guia paso a paso, Gemini gratis como default, video tutorial. Futura opcion hosted |
| Baja retencion | Alta | Notificaciones (ya implementado), gamificacion (streaks), insights semanales |
| Competencia de apps grandes | Media | Nicho ADHD es demasiado chico para que Todoist/Notion lo ataquen seriamente |
| Dependencia de APIs de AI | Baja | Multi-provider ya implementado (Claude, OpenAI, Gemini) |
| Cambios en pricing de APIs | Baja | El usuario absorbe el costo; multi-provider permite migrar |
| Burnout del founder | Alta | Lanzar rapido, validar rapido, no over-engineer |

---

## Conclusion

Task Autopsy tiene un wedge claro: **AI decomposition + ADHD-optimized UX + BYOK**. El mercado de productividad para ADHD esta creciendo, y no hay una herramienta que combine AI + timer + insights conductuales + costo cero de forma simple.

El modelo BYOK es una ventaja, no una limitacion: cero costos de AI, total transparencia, y un producto que puede ser rentable desde el primer usuario PRO.

El path es: **Auth + Sync -> Onboarding -> Landing -> Beta -> Monetizar -> Crecer.**

No over-engineer. Lanza rapido. Itera con usuarios reales.

---

*Documento creado: Mayo 2026*
*Ultima actualizacion: Mayo 2026*
