import type { CaseWithQuestions } from '@/types/exam';
// Original, non-clinical fixtures. No content was derived from the private bank.
export const DEMO_CASES: CaseWithQuestions[] = Array.from({ length: 25 }, (_, index) => ({
  caseId: `demo-${index + 1}`,
  tema: `Demo de flujo ${index + 1}`,
  subtema: 'Contenido sintético',
  caso: `Ejemplo sintético ${index + 1}. Una sesión de práctica contiene tres preguntas agrupadas. El caso permanece visible mientras respondes. Este ejemplo demuestra la interfaz; no contiene información clínica ni datos de pacientes.`,
  referencia: 'Material original de demostración de software. Sin referencia clínica.',
  questions: [
    { questionId:'q1', numero:1, pregunta:'¿Cuántas preguntas contiene este ejemplo?', opcion_a:'Tres', opcion_b:'Una', opcion_c:'Dos', opcion_d:'Cinco', opcion_correcta:'A' },
    { questionId:'q2', numero:2, pregunta:'¿Qué permanece visible mientras respondes?', opcion_a:'Una cuenta real', opcion_b:'El texto del caso', opcion_c:'Un pago', opcion_d:'Un expediente', opcion_correcta:'B' },
    { questionId:'q3', numero:3, pregunta:'¿Cuál es el propósito de este contenido?', opcion_a:'Indicar tratamiento', opcion_b:'Evaluar pacientes', opcion_c:'Demostrar el flujo de la aplicación', opcion_d:'Sustituir una guía clínica', opcion_correcta:'C' },
  ],
}));
export function selectDemoCases(size: 5 | 10 | 25): CaseWithQuestions[] {
  const pool = [...DEMO_CASES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, size);
}
