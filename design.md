# Design.md - Design System & Guía Visual

## Propósito
Especificación visual + componentes para Claude Design (Fase 5).

## Filosofía de Diseño

### Principios
1. **Dark-first:** Tema oscuro por defecto (energía, focus)
2. **Minimal:** Sin adornos, máximo signal
3. **Dopaminérgico:** Celebraciones visuales, feedback constante
4. **TDH-friendly:** Alto contraste, sin ambigüedad
5. **Offshore-readable:** Limpio, escaneable, jerárquico

---

## Paleta de Colores

### Base (Dark Mode)
| Nombre | Hex | Uso |
|--------|-----|-----|
| Background | #0F172A | Fondo principal |
| Surface | #1E293B | Cards, inputs |
| Border | #334155 | Separadores |
| Text Primary | #F1F5F9 | Texto principal |
| Text Secondary | #94A3B8 | Etiquetas, hints |
| Text Muted | #64748B | Disabled, secondary |

### Semantic
| Nombre | Hex | Uso |
|--------|-----|-----|
| Success (Green) | #10B981 | Completado, checkmarks |
| Warning (Yellow) | #F59E0B | Media prioridad, caution |
| Alert (Red) | #EF4444 | Error, high priority |
| Info (Blue) | #3B82F6 | Learning, info |
| Accent (Lime) | #84CC16 | Gamificación, streaks |

### Gradients (para celebraciones)
```css
/* Streak celebration */
linear-gradient(135deg, #84CC16, #10B981)

/* Completion glow */
linear-gradient(90deg, #10B981 0%, transparent 100%)
```

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Scale
| Uso | Size | Weight | Line-Height |
|-----|------|--------|-------------|
| H1 (Title) | 28px | 700 | 1.2 |
| H2 (Section) | 20px | 600 | 1.3 |
| H3 (Subsection) | 16px | 600 | 1.4 |
| Body (Default) | 14px | 400 | 1.6 |
| Body Small | 12px | 400 | 1.5 |
| Code/Mono | 13px | 500 | 1.5 |

---

## Componentes & Estados

### TaskCard (Subtask Visual)