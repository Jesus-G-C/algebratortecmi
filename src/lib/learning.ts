export const LEVELS = [
  { level: 1, name: "Novato", min: 0, next: 200 },
  { level: 2, name: "Aprendiz", min: 200, next: 500 },
  { level: 3, name: "Algebraico", min: 500, next: 1000 },
  { level: 4, name: "Analista", min: 1000, next: 2000 },
  { level: 5, name: "Maestro del Álgebra", min: 2000, next: null },
] as const;

export function levelInfo(xp: number) {
  const current = [...LEVELS].reverse().find((l) => xp >= l.min) ?? LEVELS[0];
  const span = current.next === null ? 1 : current.next - current.min;
  const done = current.next === null ? 1 : xp - current.min;
  return {
    ...current,
    pct: Math.min(100, Math.round((done / span) * 100)),
    toNext: current.next === null ? 0 : current.next - xp,
  };
}

export const DIFFICULTY_LABEL: Record<string, string> = {
  facil: "Fácil",
  media: "Media",
  dificil: "Difícil",
};

/** Progressive assistance ladder — never reveals the final answer. */
export const ASSISTANCE_LADDER = [
  "Sin asistencia",
  "Pista de contexto",
  "Concepto involucrado",
  "Siguiente operación",
  "Paso parcial resuelto",
  "Ejemplo completo análogo",
];

export const REASONING_OPTIONS = [
  "Porque quiero eliminar el término independiente.",
  "Porque necesito dejar la variable sola.",
  "Porque debo aplicar la misma operación en ambos lados.",
  "Otro.",
];

export function assistanceMessage(level: number) {
  if (level === 0) return "Esta vez lo resolviste sin ayuda.";
  if (level <= 2) return "Esta vez lo resolviste con menos ayuda.";
  return "Usaste la escalera de ayuda para llegar al resultado.";
}

export const LEVEL_LABEL: Record<string, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};
