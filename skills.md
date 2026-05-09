# Skills.md - Proyecto Skills & Knowledge Base

## Propósito
Documentar skills, learnings, decisiones técnicas y best practices descubiertos durante el proyecto.

---

## Skills Utilizadas

### Frontend
- **React:** Functional components, hooks (useState, useEffect, custom hooks)
- **Zustand:** State management, subscription pattern, devtools integration
- **localStorage:** Persisting JSON, serialization/deserialization
- **Fetch API:** HTTP requests a Anthropic API
- **ES6+:** Arrow functions, destructuring, async/await

### API Integration
- **Anthropic Claude API:** Message format, system prompts, token management
- **JSON parsing:** Handling Claude's markdown-wrapped responses
- **Error handling:** Retry logic, timeout handling, graceful degradation

### Architecture
- **Component design:** Props, lifting state, composition
- **Custom hooks:** useDecompose, useTimer, useOfflineSync
- **State management patterns:** Zustand actions, subscriptions
- **Data modeling:** Normalizing nested data (tasks → subtasks)

### Development Tools
- **Vite:** Fast dev server, HMR, build optimization
- **dotenv:** Environment variables (.env.local)
- **uuid:** Generating unique IDs
- **date-fns:** Date manipulation (if used)

---

## Key Learnings

### Learning 1: Claude API JSON Handling
**Problem:** Claude a veces retorna JSON con markdown backticks (```json\n...)
**Solution:** Limpiar response antes de JSON.parse():
```javascript
const cleaned = response
  .replace(/```json\n?/g, '')
  .replace(/```\n?/g, '')
  .trim();
const parsed = JSON.parse(cleaned);
```
**Lesson:** Always validate + sanitize API responses

---

### Learning 2: Zustand State Batching
**Problem:** Multiple updates en sequence causaban re-renders duplicados
**Solution:** Usar single `set()` call con todos los updates:
```javascript
// ❌ MALO - 2 renders
updateTask(id, data);
setCurrentTask(id);

// ✅ BUENO - 1 render
set((state) => ({
  tasks: updatedTasks,
  currentTaskId: id
}));
```
**Lesson:** Batch state updates cuando sea posible

---

### Learning 3: localStorage + Zustand Sync
**Problem:** Zustand store y localStorage se desincronizaban
**Solution:** Siempre llamar saveTasks() después de actualizaciones:
```javascript
// En store action
const updatedTasks = [...state.tasks, newTask];
saveTasks(updatedTasks); // ← siempre
return { tasks: updatedTasks };
```
**Lesson:** localStorage es "write-through", no automático

---

### Learning 4: API Key Environment Variables
**Problem:** VITE usa prefijo diferente a CRA
**Solution:** Detectar en runtime:
```javascript
const key = import.meta?.env?.VITE_ANTHROPIC_API_KEY || 
            process.env.REACT_APP_ANTHROPIC_API_KEY;
```
**Lesson:** Abstractizar env vars en utils/api.js para reutilizar

---

## Best Practices Discovered

### BP1: Prompt Engineering para Claude
- System prompt = instrucciones generales (nunca cambia)
- User message = datos específicos (cambia por tarea)
- Request JSON response explicitly
- Clean respuesta antes de parse

**Example:**
```javascript
const response = await callClaudeAPI(
  DECOMPOSE_PROMPT, // system (constante)
  `Tarea: ${title}\n...`, // user (variable)
  2500 // max_tokens
);
```

---

### BP2: Error Handling Strategy
Cada función que llamaa Claude debe:
1. Try/catch con error específico
2. Retry logic (max 3 intentos)
3. Timeout handling (30s)
4. User-friendly error messages
5. Log to console para debugging

**Example:**
```javascript
try {
  const response = await callClaudeAPI(...);
  // Process response
} catch (error) {
  console.error('Failed:', error);
  set({ error: 'Descomposición falló, reintentando...' });
  // Retry logic aquí
}
```

---

### BP3: Component Composition
- Components should be small (<300 loc)
- Props para configuration, actions para behavior
- Custom hooks para logic reutilizable
- Separar concerns (rendering vs logic)

**Example:**
```javascript
// ✅ BUENO - separate logic
function SubtaskCard({ subtaskId, taskId }) {
  const { updateSubtask } = useTaskStore();
  const { timeLeft, start } = useTimer(900);
  
  return (
    <Card>
      <Timer value={timeLeft} onStart={start} />
      <Actions onComplete={() => updateSubtask(...)} />
    </Card>
  );
}
```

---

### BP4: Offline-First Thinking
- localStorage = primary source of truth
- API/Drive = sync después
- Always have graceful degradation
- User should never see sync errors

**Pattern:**
```javascript
// 1. Save local
saveTasks(updatedTasks);
addPendingSync(...);

// 2. Try sync async (no bloqueante)
useDriveSync().then(onSuccess).catch(onError);

// 3. UI muestra status, no bloquea
```

---

## Decisiones Técnicas Documentadas

### Decision 1: Zustand vs Redux vs Context
**Options:**
- Redux: Overkill, mucho boilerplate
- Context: Prop drilling para nested updates
- Zustand: Simple, tiny, perfect para este caso

**Decision:** ✅ Zustand
**Reasoning:** Minimal setup, easy to debug, built-in devtools

---

### Decision 2: localStorage vs IndexedDB
**Options:**
- localStorage: Simple, JSON, ~5-10MB limit
- IndexedDB: Más capacity, más complejo

**Decision:** ✅ localStorage
**Reasoning:** MVP no necesita >5MB, IndexedDB es future (Fase 4)

---

### Decision 3: Claude API vs OpenAI API
**Options:**
- Claude: Better reasoning, no jailbreak risk
- OpenAI: GPT-4, más maduro

**Decision:** ✅ Claude
**Reasoning:** Better at structured tasks, alignment con Anthropic

---

### Decision 4: Vite vs Create React App
**Options:**
- Vite: Fast, modern, ESM
- CRA: Estable, familiar

**Decision:** ✅ Vite
**Reasoning:** Faster dev, smaller bundle, HMR better

---

## Technical Debt / Future Improvements

### TD1: Error Retry Logic
**Current:** Basic try/catch
**Future:** Exponential backoff + circuit breaker
**Effort:** Medium

### TD2: TypeScript
**Current:** None
**Future:** Añadir TS (Fase 4)
**Effort:** High

### TD3: Testing
**Current:** None
**Future:** Vitest + React Testing Library (Fase 4)
**Effort:** High

### TD4: Performance
**Current:** No optimization
**Future:** Memoization, code splitting, lazy loading (Fase 5)
**Effort:** Medium

### TD5: Google Drive Integration
**Current:** Placeholder para Fase 3
**Future:** Full OAuth + sync
**Effort:** High (requiere backend o serverless)

---

## Common Issues & Solutions

### Issue 1: "API key not found"
**Symptoms:** Error en console diciendo API key undefined
**Solution:**
1. Checkea `.env.local` (no `.env`)
2. Reinicia dev server (`npm run dev`)
3. Variable debe ser `VITE_ANTHROPIC_API_KEY` (o `REACT_APP_...` si CRA)

---

### Issue 2: "JSON.parse() error"
**Symptoms:** "Unexpected token" error
**Solution:**
1. Add logs: `console.log('Raw response:', response)`
2. Check si Claude retornó markdown backticks
3. Use cleanup regex: `.replace(/```json|```/g, '')`

---

### Issue 3: "localStorage is undefined"
**Symptoms:** Safari private mode o algunos navegadores
**Solution:**
1. Try/catch todo localStorage access
2. Fallback a memory-only (temporario hasta sync)

```javascript
try {
  localStorage.setItem(key, value);
} catch (e) {
  console.warn('localStorage unavailable:', e);
  // Fallback a memory object
}
```

---

### Issue 4: "State not updating"
**Symptoms:** UI no refleja cambios en store
**Solution:**
1. Checkea que store action retorna nuevo state
2. Zustand no trackea nested mutations
3. Spread operators: `[...array]`, `{...obj}`

```javascript
// ❌ MALO - mutando directo
state.tasks[0].title = 'new';

// ✅ BUENO - nuevo objeto
tasks: state.tasks.map(t => 
  t.id === id ? {...t, title: 'new'} : t
)
```

---

## Resources & References

### Docs
- [Anthropic Claude API](https://docs.anthropic.com)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)

### Tools
- [Claude AI](https://claude.ai) - Testing prompts
- [DevTools Zustand](https://github.com/pmndrs/zustand#how-to-inspect-the-store-for-debug) - Debug store
- [Tailwind Play](https://play.tailwindcss.com) - Design prototyping

---

## Metrics & Progress

### Fase 1 Status
- Setup: ✅ Complete
- Utils: ✅ Complete
- Store: ✅ Complete
- Hooks: 🟡 In Progress
- Components: 🔴 Not Started
- App.jsx: 🔴 Not Started

### Estimated Timeline
- Fase 1: 2-3 días (MVP descomposición)
- Fase 2: 2-3 días (Core features)
- Fase 3: 3-4 días (Intelligence + Drive)
- Fase 4: 2-3 días (Gamificación)
- Fase 5: 3-4 días (Design & polish)

**Total:** ~13-17 días para production-ready

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-09 | Initial creation - Fase 1 specs | Ger |
| - | Learnings added | - |
| - | Best practices documented | - |

---

**Última actualización:** [HOY]
**Owner:** Ger
**Status:** Living document (update constantemente)