import type { AnswerMap, CaseWithQuestions, ExamSize, OptionValue } from '@/types/exam';
export type AttemptListItem = {
  attemptId: string;
  userId: string;
  caseIds: string[];
  examSize: ExamSize;
  answers: AnswerMap;
  totalCorrect: number;
  totalIncorrect: number;
  percentage: number;
  createdAt: Date | null;
};

export type AttemptQuestionReview = {
  questionId: string;
  numero: number;
  pregunta: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  opcion_d: string;
  userAnswer: OptionValue | null;
  correctAnswer: OptionValue;
  isCorrect: boolean;
};

export type AttemptCaseReview = {
  caseId: string;
  tema: string;
  subtema?: string;
  caso: string;
  referencia: string;
  questions: AttemptQuestionReview[];
  correctCount: number;
  totalQuestions: number;
};

export type AttemptReview = {
  attempt: AttemptListItem;
  cases: AttemptCaseReview[];
};

export type SaveAttemptInput = {
  userId: string;
  caseIds: string[];
  examSize: ExamSize;
  answers: AnswerMap;
  totalCorrect: number;
  totalIncorrect: number;
  percentage: number;
  caseSnapshots?: CaseWithQuestions[];
  createdAt?: Date;
};

export function calculateExamScore(cases: CaseWithQuestions[], answers: AnswerMap) {
  let totalQuestions = 0;
  let totalCorrect = 0;

  for (const caseItem of cases) {
    for (const question of caseItem.questions) {
      totalQuestions += 1;
      const key = `${caseItem.caseId}:${question.questionId}`;
      if (answers[key] === question.opcion_correcta) {
        totalCorrect += 1;
      }
    }
  }

  const totalIncorrect = totalQuestions - totalCorrect;
  const percentage = totalQuestions === 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 100);

  return {
    totalQuestions,
    totalCorrect,
    totalIncorrect,
    percentage,
  };
}

export function buildAttemptReviewFromCaseSnapshots(
  attempt: AttemptListItem,
  caseSnapshots: CaseWithQuestions[],
): AttemptReview {
  const cases = attempt.caseIds.map<AttemptCaseReview>((caseId) => {
    const caseItem = caseSnapshots.find((item) => item.caseId === caseId);

    if (!caseItem) {
      return {
        caseId,
        tema: 'Caso no encontrado',
        caso: 'Caso no disponible',
        referencia: 'N/A',
        questions: [],
        correctCount: 0,
        totalQuestions: 0,
      };
    }

    const questions = [...caseItem.questions]
      .sort((a, b) => a.numero - b.numero)
      .map<AttemptQuestionReview>((question) => {
        const answerKey = `${caseId}:${question.questionId}`;
        const userAnswer = attempt.answers[answerKey] ?? null;

        return {
          questionId: question.questionId,
          numero: question.numero,
          pregunta: question.pregunta,
          opcion_a: question.opcion_a,
          opcion_b: question.opcion_b,
          opcion_c: question.opcion_c,
          opcion_d: question.opcion_d,
          userAnswer,
          correctAnswer: question.opcion_correcta,
          isCorrect: userAnswer !== null && userAnswer === question.opcion_correcta,
        };
      });

    return {
      caseId,
      tema: caseItem.tema,
      subtema: caseItem.subtema,
      caso: caseItem.caso,
      referencia: caseItem.referencia,
      correctCount: questions.filter((item) => item.isCorrect).length,
      totalQuestions: questions.length,
      questions,
    };
  });

  return {
    attempt,
    cases,
  };
}


// Session-only memory: no account, browser persistence, or network writes.
const attempts: { attempt: AttemptListItem; cases: CaseWithQuestions[] }[] = [];
let sequence = 0;
export function getRequiredUserId(): string { return 'portfolio-demo'; }
export async function saveExamAttempt(input: SaveAttemptInput): Promise<string> {
  if (!input.caseSnapshots || input.caseSnapshots.length !== input.examSize) throw new Error('Invalid case snapshot');
  const score = calculateExamScore(input.caseSnapshots, input.answers);
  const attemptId = `demo-attempt-${++sequence}`;
  const attempt: AttemptListItem = { ...input, ...score, attemptId, createdAt: new Date() };
  attempts.unshift({attempt, cases: input.caseSnapshots});
  return attemptId;
}
export async function fetchUserAttempts(userId: string): Promise<AttemptListItem[]> {
  return attempts.filter(item => item.attempt.userId === userId).map(item => item.attempt);
}
export async function fetchAttemptReview(attemptId: string, userId: string): Promise<AttemptReview | null> {
  const entry = attempts.find(item => item.attempt.attemptId === attemptId && item.attempt.userId === userId);
  return entry ? buildAttemptReviewFromCaseSnapshots(entry.attempt, entry.cases) : null;
}
export async function deleteUserAttempts(userId: string): Promise<void> {
  for (let i=attempts.length-1;i>=0;i--) if(attempts[i].attempt.userId===userId) attempts.splice(i,1);
}
