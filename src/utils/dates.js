/**
 * Formatea una fecha ISO a texto legible relativo o corto.
 * No usa dependencias externas.
 */
export function formatRelativeDate(isoString) {
  if (!isoString) return '';

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHr < 24) return `hace ${diffHr}h`;
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;

  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Formatea fecha corta: "9 may 2026"
 */
export function formatShortDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
