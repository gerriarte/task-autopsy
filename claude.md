# Claude.md - Instrucciones para Claude Code

## Propósito
Este archivo contiene instrucciones para que Claude (en Claude Code) entienda el contexto, arquitectura y próximos pasos del proyecto Task Autopsy.

## Contexto del Usuario
- **Nombre:** Ger
- **Rol:** Founder (a:bra + Nougram), Growth Marketer con TDH
- **Challenge:** Transformar entusiasmo en disciplina, romper análisis parálisis
- **Pain Points:** Abandona tareas operativas/venta, se dispersa en técnica

## Stack Confirmado
- **Frontend:** React (Vite)
- **State:** Zustand
- **Storage:** localStorage + Google Drive API (Fase 3)
- **API:** Anthropic Claude Sonnet 4
- **Styling:** Tailwind (Fase 3 - Claude Design)

## Fase Actual: FASE 1 (MVP)

### Entregables Fase 1
1. ✅ Setup proyecto + estructura
2. ✅ taskStore.js (Zustand)
3. ✅ utils/api.js (Claude API integration)
4. ✅ utils/storage.js (localStorage)
5. ✅ utils/constants.js
6. ✅ hooks/useDecompose.js
7. ✅ components/TaskInput.jsx
8. ✅ components/TaskTree.jsx
9. ✅ App.jsx (orquestación)

### NO hacemos en Fase 1
- Styling/Tailwind (eso es Fase 3)
- Timer, LearningPath, DayView (Fases 2-3)
- Drive sync (Fase 3)
- Drag & drop (Fase 2)

## Principios de Desarrollo

### Code Style
- Componentes funcionales + hooks
- Comentarios en funciones principales
- Nombres claros (no abreviar)
- Manejo de errores explícito

### UX Priority
- Feedback visual claro (loading states)
- Error messages específicos (no genéricos)
- localStorage automático (nunca pierde data)
- Offline resilience (graceful degradation)

### Decisiones Arquitectónicas
- Zustand: Simple, sin Context boilerplate
- localStorage: Offline-first, sync later
- JSON format de Claude: Strict parsing con validación
- Google Drive: Source of truth (Fase 3)

## Próximos Pasos Después de Fase 1

1. **Fase 2:** Timer + SubtaskCard + Drag & drop
2. **Fase 3:** Drive sync + offline queue
3. **Fase 4:** LearningPath + useLearningGaps
4. **Fase 5:** DayView + gamificación
5. **Design:** Claude Design hace styling Tailwind

## Cosas Importantes
- **API Key:** Debe estar en .env.local (VITE_ANTHROPIC_API_KEY)
- **UUID:** npm install uuid (para IDs únicos)
- **Error Handling:** Reintentos en useDecompose (3 intentos)
- **Validación:** Claude retorna JSON, parsear + validar siempre

## Si Algo Falla
1. Checkea API key en .env.local
2. Validá respuesta JSON de Claude (a veces agrega markdown)
3. Checkea localStorage (dev tools → Application → Local Storage)
4. Logs en console para debugging

## File Structure Final (Fase 1)