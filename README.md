# Task Autopsy

**Tu cerebro no esta roto. Solo necesita un sistema diferente.**

Task Autopsy es una herramienta de productividad potenciada por AI, disenada especificamente para personas con TDAH y cualquiera que sufra analisis-paralisis. Transforma tareas vagas y abrumadoras en micro-pasos concretos de 15-30 minutos, con timer integrado y modo foco para mantener la concentracion.

---

## El Problema

Las personas con TDAH enfrentan un patron comun:

1. Tienen una tarea grande ("Crear propuesta para cliente")
2. No saben por donde empezar
3. Se paralizan o se dispersan en otra cosa
4. La tarea se acumula, genera ansiedad, y el ciclo se repite

**Task Autopsy rompe ese ciclo.** La AI descompone cualquier tarea en pasos tan pequenos que arrancar se vuelve trivial.

---

## Features

### Descomposicion Inteligente con AI
Escribi una tarea vaga. La AI la convierte en 3-6 micro-tareas de 15-30 minutos, cada una con descripcion clara y estimacion de tiempo.

### Multi-proveedor AI
Soporte para tres proveedores de AI con patron adapter:
- **Anthropic** (Claude Sonnet 4, Haiku 4)
- **OpenAI** (GPT-4.1, GPT-4.1 Mini, GPT-4.1 Nano)
- **Google** (Gemini 2.5 Flash, Gemini 2.5 Pro)

Configura tu API key preferida desde Ajustes. Podes cambiar de proveedor en cualquier momento.

### Timer por Subtask
Cada micro-tarea tiene un timer con estimacion. Colores graduados indican el progreso: calmo durante el trabajo, ambar cuando queda poco tiempo, sin ser invasivo.

### Focus Mode
Modo pantalla completa sin distracciones. Fondo oscuro, timer circular con anillo de progreso, respiracion visual sutil. Solo vos y la tarea. ESC para salir.

### Drag & Drop
Reordena las subtasks arrastrando. Cambia la prioridad segun tu energia o contexto.

### Learning Path
La AI detecta gaps de conocimiento en tus tareas. Agregas temas a tu Learning Path personal y los marcas como aprendidos.

### Dashboard de Progreso
- Streak de dias consecutivos (como GitHub contributions)
- Tiempo estimado vs real por tarea
- Precision de estimaciones con color-coding
- Vista "Que hago ahora?" con subtasks activas y proximas

### Export e Integraciones
- **CSV/JSON export** para backup o analisis externo
- **Webhooks** para conectar con Zapier, Make, n8n, Google Sheets
- Guia paso a paso para configurar cada integracion

### PWA (Progressive Web App)
Se instala como app nativa en celular o desktop. Funciona offline. Service worker con estrategia network-first para navegacion, cache-first para assets.

### Diseno Zen Japones
Estetica minimalista con paleta de papel washi (crema calido), elevaciones suaves, y animaciones con proposito:
- `pulse-ring`: respiracion sutil en subtask activa
- `nudge`: vibracion suave cuando el timer llega a cero
- `complete-pop`: satisfaccion visual al completar
- `fade-in`: entrada elegante de elementos nuevos
- `focus-breathe`: glow de respiracion en Focus Mode

---

## Stack Tecnico

| Capa | Tecnologia |
|------|-----------|
| Framework | React 18 |
| Build | Vite 5 |
| State | Zustand |
| Styling | Tailwind CSS v4 |
| Drag & Drop | @dnd-kit |
| Storage | localStorage (offline-first) |
| AI | Multi-provider (Anthropic, OpenAI, Gemini) |
| IDs | uuid v9 |

---

## Estructura del Proyecto

```
src/
  App.jsx                    # Layout principal, routing de vistas
  main.jsx                   # Entry point
  index.css                  # Design system Zen (tokens, animaciones)

  components/
    TaskInput.jsx             # Input para crear tareas nuevas
    TaskTree.jsx              # Vista de tarea con subtasks
    SubtaskCard.jsx           # Card de subtask con timer y urgencia
    TaskNav.jsx               # Sidebar de navegacion + mobile pills
    AddStepsInput.jsx         # Agregar mas subtasks con AI
    FocusMode.jsx             # Modo pantalla completa sin distracciones
    LearningPanel.jsx         # Panel de Learning Path
    StatsPanel.jsx            # Dashboard de progreso y metricas
    SettingsPanel.jsx         # Config de API, export, webhooks
    index.js                  # Barrel exports

  hooks/
    useDecompose.js           # Hook para descomponer tareas con AI
    useTimer.js               # Hook de timer con pause/resume/reset
    useStats.js               # Hook de metricas y streak
    useLearningGaps.js        # Hook para gaps de conocimiento

  store/
    taskStore.js              # Zustand store (state global + persistencia)

  utils/
    api.js                    # Llamadas a AI con retry y validacion JSON
    providers.js              # Adapter pattern para multi-proveedor AI
    constants.js              # Constantes, prompts, configuracion
    storage.js                # Persistencia en localStorage
    dates.js                  # Utilidades de fechas relativas
    export.js                 # CSV/JSON export
    webhook.js                # Webhook config y dispatch

public/
    manifest.json             # PWA manifest
    sw.js                     # Service worker
    icons/                    # SVG icons para PWA
```

---

## Instalacion

### Prerequisitos
- Node.js 18+
- npm 9+
- API key de al menos un proveedor (Anthropic, OpenAI o Google)

### Setup

```bash
# Clonar el repositorio
git clone https://github.com/gerriarte/task-autopsy.git
cd task-autopsy

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional, tambien se configura desde la UI)
cp .env.example .env.local
# Editar .env.local con tu API key

# Iniciar servidor de desarrollo
npm run dev
```

La app se abre en `http://localhost:5173`.

### Configurar la API key

Hay dos formas:

1. **Desde la UI (recomendado):** Click en el icono de ajustes, selecciona tu proveedor, pega tu API key y guarda.

2. **Desde `.env.local`:** Agrega `VITE_ANTHROPIC_API_KEY=tu_key_aqui` (solo para Anthropic).

### Build para produccion

```bash
npm run build
npm run preview   # Preview local del build
```

El build se genera en `dist/`.

---

## Como Funciona

### 1. Descomponer
Escribis una tarea grande o vaga:
> "Crear propuesta de servicios para cliente nuevo"

### 2. AI la procesa
La AI analiza la tarea y genera 3-6 micro-pasos:
- Investigar al cliente y su industria (15 min)
- Definir los servicios a ofrecer (20 min)
- Redactar la propuesta de valor (25 min)
- Armar el presupuesto (15 min)
- Revisar y enviar (15 min)

### 3. Ejecutar con timer
Arrancas la primera subtask, el timer corre. Si necesitas concentracion total, activas Focus Mode.

### 4. Aprender
La AI detecta que quizas no sabes "como calcular pricing de servicios" y lo sugiere como Learning Gap. Lo agregas a tu Learning Path.

---

## Persistencia de Datos

Los datos se guardan en `localStorage` del navegador:

| Key | Contenido |
|-----|-----------|
| `task_autopsy_tasks` | Tareas con subtasks, timers, status |
| `task_autopsy_learning_path` | Items del Learning Path |
| `task_autopsy_api_config` | Provider, API key, modelo |
| `task_autopsy_webhook_config` | URL y configuracion de webhooks |

**Importante:** Los datos persisten hasta que se borre el cache del navegador. Para backup, usa la funcion de Export (JSON) desde Ajustes.

---

## Webhooks

Task Autopsy puede enviar eventos a servicios externos:

| Evento | Cuando se dispara |
|--------|-------------------|
| `task.created` | Al crear una tarea nueva |
| `task.completed` | Al completar todas las subtasks |
| `subtask.completed` | Al completar una subtask individual |

### Payload de ejemplo

```json
{
  "event": "subtask.completed",
  "timestamp": "2026-05-10T14:30:00.000Z",
  "data": {
    "taskId": "abc-123",
    "taskTitle": "Crear propuesta",
    "subtaskId": "st_1",
    "subtaskTitle": "Investigar al cliente",
    "estimatedMinutes": 15,
    "timeSpentSeconds": 840
  }
}
```

Se configura desde Ajustes > Webhooks. Incluye guias para Zapier, Make, n8n y Google Sheets.

---

## Scripts

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de produccion |
| `npm run preview` | Preview del build |

---

## Decisiones de Arquitectura

### Zustand sobre Context API
Zustand elimina el boilerplate de Context + Reducers. Un solo store con acciones claras. Sin providers wrapper.

### localStorage como storage primario
Offline-first. La app funciona sin internet. Cloud sync planeado para futuras versiones con Supabase.

### Multi-proveedor con Adapter Pattern
Cada proveedor (Anthropic, OpenAI, Gemini) implementa `buildRequest()` y `extractText()`. Agregar un nuevo proveedor = agregar un objeto al mapa.

### Tailwind v4 con @theme
Design tokens definidos en `@theme` dentro de `index.css`. Sin `tailwind.config.js`. Colores zen-* y brand-* como sistema completo.

### Validacion estricta del JSON de AI
La AI a veces agrega markdown o texto extra al JSON. `api.js` parsea con regex para extraer el JSON limpio, valida estructura, y reintenta hasta 3 veces si falla.

---

## Roadmap

Consulta [GROWTH_PLAN.md](./GROWTH_PLAN.md) para el plan completo de producto.

### Proximo
- Backend proxy (eliminar necesidad de API key del usuario)
- Autenticacion + cloud sync con Supabase
- Onboarding guiado con tarea demo
- Notificaciones push

### Futuro
- Insights personalizados con AI
- Plantillas de tareas recurrentes
- Modelo freemium
- App nativa (React Native)

---

## Contribuir

Task Autopsy es un proyecto en desarrollo activo. Si queres contribuir:

1. Fork el repositorio
2. Crea una branch (`git checkout -b feature/mi-feature`)
3. Hace tus cambios y commiteá
4. Push a la branch (`git push origin feature/mi-feature`)
5. Abri un Pull Request

### Principios de codigo
- Componentes funcionales + hooks
- Comentarios en funciones principales
- Nombres claros, sin abreviar
- Manejo de errores explicito con feedback al usuario

---

## Licencia

Este proyecto esta bajo desarrollo privado por [@gerriarte](https://github.com/gerriarte).

---

## Autor

**Ger Iriarte** — Founder de [a:bra](https://abra.com.ar) + [Nougram](https://nougram.com)

Growth Marketer con TDAH que construyo esta herramienta porque ninguna app de productividad existente estaba disenada para cerebros que se dispersan.

> *"La disciplina no es hacer mas. Es saber que hacer primero."*
