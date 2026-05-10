# Task Autopsy — Plan de Crecimiento

> De side-project a producto real. Roadmap estrategico para convertir Task Autopsy en una herramienta de productividad rentable para personas con ADHD.

---

## Vision del Producto

**Task Autopsy** resuelve un problema real: las personas con ADHD (y cualquiera que sufra analisis-paralisis) no pueden arrancar tareas grandes porque no saben por donde empezar. La AI descompone tareas vagas en pasos concretos de 15-30 minutos, y el timer + Focus Mode mantienen el foco.

**Diferenciador clave:** No es otro todo-list. Es un sistema de descomposicion inteligente + ejecucion guiada, disenado para cerebros que se dispersan.

---

## Tier 1 — Fundamentos (Sin esto no es producto)

### 1.1 Backend Proxy para API
**Prioridad:** CRITICA | **Esfuerzo:** 2-4 horas

Hoy el usuario necesita su propia API key. Esto mata la conversion.

- **Solucion:** Cloudflare Worker o Vercel Edge Function que proxee las llamadas a Claude/OpenAI
- La API key la maneja el backend, el usuario no se entera
- Rate limiting por IP/sesion (evitar abuso)
- Logging de uso para controlar costos

**Impacto:** Elimina la barrera de entrada #1. Sin esto, solo programadores pueden usar la app.

### 1.2 Autenticacion + Cloud Sync
**Prioridad:** CRITICA | **Esfuerzo:** 1-2 dias

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

### 1.3 Onboarding Guiado
**Prioridad:** ALTA | **Esfuerzo:** 4-6 horas

El momento mas fragil. Un usuario con ADHD que no entiende la app en 30 segundos, se va.

- **Tarea demo pre-cargada:** Al entrar por primera vez, ya hay una tarea descompuesta de ejemplo para que el usuario interactue
- **3 tooltips maximo:** "Escribi algo vago -> la AI lo descompone -> timer por paso"
- **Celebracion al completar la primera subtask:** Feedback positivo inmediato
- **Cero formularios antes de probar:** El usuario prueba primero, se registra despues (si quiere guardar)

---

## Tier 2 — Retencion (Lo que hace que vuelvan)

### 2.1 Notificaciones Push + Recordatorios
**Prioridad:** ALTA | **Esfuerzo:** 4-6 horas

ADHD = se olvidan de volver. La app necesita "tirar" del usuario.

- PWA ya soporta push notifications (service worker esta implementado)
- Notificaciones inteligentes (no spam):
  - "Tenes 3 subtasks pendientes de ayer"
  - "Tu racha de 5 dias se corta hoy si no completas algo"
  - "Hace 2 dias que no abris Task Autopsy"
- Horario configurable (no molestar fuera de horario laboral)
- Maximo 1 notificacion por dia

### 2.2 Plantillas de Tareas Recurrentes
**Prioridad:** MEDIA | **Esfuerzo:** 3-4 horas

Las personas con ADHD repiten las mismas tareas dificiles cada semana/mes.

- Boton "Repetir esta tarea" que clona la estructura de subtasks
- Plantillas pre-armadas por categoria:
  - Freelancer: "Preparar propuesta para cliente", "Hacer facturacion mensual"
  - Founder: "Preparar pitch deck", "Revisar metricas semanales"
  - Marketing: "Planificar contenido semanal", "Analizar performance de campana"
- Las plantillas se refinan con el uso (la AI aprende de tus descomposiciones anteriores)

### 2.3 Insights Personalizados con AI
**Prioridad:** ALTA | **Esfuerzo:** 1-2 dias

Aca esta el verdadero moat del producto. Ningun todo-list hace esto.

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

### 3.1 Modelo Freemium

```
GRATIS (para siempre):
- 3 tareas activas simultaneas
- Descomposicion basica (hasta 5 subtasks)
- Timer + Focus Mode
- Stats basicos (streak, subtasks completadas)

PRO ($8-12 USD/mes):
- Tareas ilimitadas
- Descomposicion profunda (subtasks ilimitadas)
- Insights de AI personalizados (reporte semanal)
- Plantillas recurrentes
- Export CSV/JSON + Webhooks
- Cloud sync multi-dispositivo
- Soporte prioritario

TEAM ($15-20 USD/usuario/mes) — Fase futura:
- Todo PRO + dashboard de equipo
- Tareas compartidas
- Metricas de equipo
```

### 3.2 Pricing Strategy

- **$8-12/mes** es el sweet spot para herramientas de productividad individual
- Mas barato que Todoist Premium ($5), Notion ($10), pero con un angulo unico
- **Annual discount:** 2 meses gratis ($80-100/ano vs $96-144)
- **Lifetime deal** para early adopters: $150-200 (genera cash flow inicial + evangelistas)
- Payment: Stripe Checkout (integra en horas, no dias)

### 3.3 Metricas Target

| Metrica | Target Mes 3 | Target Mes 6 | Target Mes 12 |
|---------|-------------|-------------|---------------|
| Usuarios registrados | 500 | 2,000 | 10,000 |
| Usuarios activos (WAU) | 150 | 600 | 3,000 |
| Conversion free->pro | 5% | 8% | 10% |
| MRR | $400 | $1,600 | $12,000 |
| Churn mensual | <15% | <10% | <7% |

---

## Tier 4 — Distribucion y Growth

### 4.1 Landing Page + SEO
**Keywords target:**
- "task manager for adhd" (baja competencia, alta intencion)
- "adhd productivity app" (volumen medio)
- "how to break down tasks adhd" (informacional, funnel top)
- "pomodoro for adhd" (competencia media)

**Estructura de la landing:**
1. Hero: "Tu cerebro no esta roto. Solo necesita un sistema diferente."
2. Demo interactiva (video 60s o GIF)
3. 3 features clave con screenshots
4. Testimonio personal (tu historia como founder con ADHD)
5. CTA: "Proba gratis — sin tarjeta"

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
- [ ] Backend proxy (Cloudflare Worker)
- [ ] Supabase auth + sync
- [ ] Onboarding con tarea demo
- [ ] Landing page basica
- [ ] Empezar a juntar emails (waitlist)

### Mes 2 — Retencion
- [ ] Push notifications
- [ ] Plantillas recurrentes
- [ ] Analytics basico (Plausible/PostHog)
- [ ] Beta cerrado con 20-50 usuarios
- [ ] Iterar basado en feedback

### Mes 3 — Monetizacion
- [ ] Stripe integration (checkout + portal)
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
- [ ] API publica
- [ ] Integraciones nativas (Slack, Calendar)
- [ ] Internacionalizacion (ingles prioritario)

---

## Stack Tecnico Recomendado para Escalar

| Capa | Actual | Recomendado |
|------|--------|-------------|
| Frontend | React + Vite | Mantener (funciona bien) |
| State | Zustand | Mantener + sync layer |
| Auth | — | Supabase Auth |
| DB | localStorage | Supabase Postgres |
| Backend | — | Cloudflare Workers |
| Payments | — | Stripe |
| Analytics | — | PostHog (free tier) |
| Email | — | Resend |
| Hosting | — | Vercel o Cloudflare Pages |
| CDN | — | Cloudflare (viene gratis) |

---

## Ventaja Competitiva

1. **Nicho definido:** ADHD productivity (no "todo para todos")
2. **AI como core, no como feature:** La descomposicion inteligente ES el producto
3. **Insights conductuales:** Ningun competidor analiza tus patrones de procrastinacion
4. **Historia autentica:** Founder con ADHD construyendo para personas con ADHD
5. **Bajo costo operativo:** Sin servidores pesados, AI como servicio, freemium natural

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigacion |
|--------|-------------|------------|
| Costos de API altos | Media | Rate limiting, cache de descomposiciones similares, modelos mas baratos para tareas simples |
| Baja retencion | Alta | Notificaciones, gamificacion (streaks), insights semanales |
| Competencia de apps grandes | Media | Nicho ADHD es demasiado chico para que Todoist/Notion lo ataquen seriamente |
| Dependencia de APIs de AI | Baja | Multi-provider ya implementado (Claude, OpenAI, Gemini) |
| Burnout del founder | Alta | Lanzar rapido, validar rapido, no over-engineer |

---

## Conclusion

Task Autopsy tiene un wedge claro: **AI decomposition + ADHD-optimized UX**. El mercado de productividad para ADHD esta creciendo (mas diagnosticos, mas awareness), y no hay una herramienta que combine AI + timer + insights conductuales de forma simple.

El path es: **Backend proxy -> Auth -> Onboarding -> Landing -> Beta -> Monetizar -> Crecer.**

No over-engineer. Lanza rapido. Itera con usuarios reales.

---

*Documento creado: Mayo 2026*
*Ultima actualizacion: Mayo 2026*
