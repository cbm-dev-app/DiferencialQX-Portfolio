import React, { createContext, useContext, useMemo, useReducer } from 'react';

import {
  buildAttemptReviewFromCaseSnapshots,
  calculateExamScore,
  getRequiredUserId,
  saveExamAttempt,
  type AttemptReview,
} from '@/lib/attempts-service';
import type { AnswerMap, CaseWithQuestions, ExamSize, ExamStatus, OptionValue } from '@/types/exam';

type ExamAttemptState = {
  status: ExamStatus;
  examSize: ExamSize | null;
  currentCaseIndex: number;
  cases: CaseWithQuestions[];
  caseSubmitted: Record<string, boolean>;
  answers: AnswerMap;
  lastSubmittedAttemptId: string | null;
  lastSubmittedReview: AttemptReview | null;
};

type StartExamAction = {
  type: 'START_EXAM';
  payload: {
    cases: CaseWithQuestions[];
    examSize: ExamSize;
  };
};

type SelectAnswerAction = {
  type: 'SELECT_ANSWER';
  payload: {
    caseId: string;
    questionId: string;
    answer: OptionValue;
  };
};

type SubmitCurrentCaseAction = {
  type: 'SUBMIT_CURRENT_CASE';
};

type SubmitExamAction = {
  type: 'SUBMIT_EXAM';
  payload: {
    attemptId: string;
    submittedCaseId: string | null;
    review: AttemptReview;
  };
};

type ResetExamAction = {
  type: 'RESET_EXAM';
};

type ExamAttemptAction =
  | StartExamAction
  | SelectAnswerAction
  | SubmitCurrentCaseAction
  | SubmitExamAction
  | ResetExamAction;

const initialState: ExamAttemptState = {
  status: 'idle',
  examSize: null,
  currentCaseIndex: 0,
  cases: [],
  caseSubmitted: {},
  answers: {},
  lastSubmittedAttemptId: null,
  lastSubmittedReview: null,
};

function buildAnswerKey(caseId: string, questionId: string): string {
  return `${caseId}:${questionId}`;
}

function isCurrentCaseFullyAnswered(state: ExamAttemptState): boolean {
  const currentCase = state.cases[state.currentCaseIndex];

  if (!currentCase) {
    return false;
  }

  return currentCase.questions.every(
    (question) => state.answers[buildAnswerKey(currentCase.caseId, question.questionId)] !== undefined,
  );
}

function getCurrentCase(state: ExamAttemptState): CaseWithQuestions | null {
  return state.cases[state.currentCaseIndex] ?? null;
}

function arePreviousCasesSubmitted(state: ExamAttemptState): boolean {
  if (state.currentCaseIndex === 0) {
    return true;
  }

  return state.cases
    .slice(0, state.currentCaseIndex)
    .every((caseItem) => state.caseSubmitted[caseItem.caseId] === true);
}

function areAllCasesSubmitted(state: ExamAttemptState): boolean {
  if (state.cases.length === 0) {
    return false;
  }

  return state.cases.every((caseItem) => state.caseSubmitted[caseItem.caseId] === true);
}

function validateCaseIntegrity(cases: CaseWithQuestions[], examSize: ExamSize): boolean {
  if (cases.length !== examSize) {
    return false;
  }

  const seenCaseIds = new Set<string>();

  return cases.every((caseItem) => {
    if (!caseItem.caseId || seenCaseIds.has(caseItem.caseId)) {
      return false;
    }

    seenCaseIds.add(caseItem.caseId);

    if (!caseItem.referencia || caseItem.referencia.trim().length === 0) {
      return false;
    }

    if (caseItem.questions.length < 3 || caseItem.questions.length > 4) {
      return false;
    }

    const seenQuestionNumbers = new Set<number>();
    return caseItem.questions.every((question) => {
      if (seenQuestionNumbers.has(question.numero)) {
        return false;
      }

      seenQuestionNumbers.add(question.numero);

      return (
        question.pregunta.trim().length > 0 &&
        question.opcion_a.trim().length > 0 &&
        question.opcion_b.trim().length > 0 &&
        question.opcion_c.trim().length > 0 &&
        question.opcion_d.trim().length > 0
      );
    });
  });
}

function canSubmitCurrentCase(state: ExamAttemptState): boolean {
  const currentCase = getCurrentCase(state);

  return (
    state.status === 'in_progress' &&
    currentCase !== null &&
    !state.caseSubmitted[currentCase.caseId] &&
    isCurrentCaseFullyAnswered(state)
  );
}

function canSubmitExam(state: ExamAttemptState): boolean {
  if (state.status !== 'in_progress' || state.examSize === null) {
    return false;
  }

  const currentCase = getCurrentCase(state);
  if (!currentCase) {
    return false;
  }

  const isLastCase = state.currentCaseIndex === state.cases.length - 1;
  if (!isLastCase || !arePreviousCasesSubmitted(state)) {
    return false;
  }

  return state.caseSubmitted[currentCase.caseId] === true || isCurrentCaseFullyAnswered(state);
}

function examAttemptReducer(state: ExamAttemptState, action: ExamAttemptAction): ExamAttemptState {
  switch (action.type) {
    case 'START_EXAM': {
      const { cases, examSize } = action.payload;
      if (!validateCaseIntegrity(cases, examSize)) {
        return state;
      }

      const caseSubmitted = Object.fromEntries(cases.map((caseItem) => [caseItem.caseId, false]));

      return {
        status: 'in_progress',
        examSize,
        currentCaseIndex: 0,
        cases,
        caseSubmitted,
        answers: {},
        lastSubmittedAttemptId: null,
        lastSubmittedReview: null,
      };
    }

    case 'SELECT_ANSWER': {
      if (state.status !== 'in_progress') {
        return state;
      }

      const currentCase = getCurrentCase(state);
      if (!currentCase) {
        return state;
      }

      if (action.payload.caseId !== currentCase.caseId) {
        return state;
      }

      if (state.caseSubmitted[currentCase.caseId]) {
        return state;
      }

      const questionExists = currentCase.questions.some((question) => question.questionId === action.payload.questionId);
      if (!questionExists) {
        return state;
      }

      const answerKey = buildAnswerKey(action.payload.caseId, action.payload.questionId);
      return {
        ...state,
        answers: {
          ...state.answers,
          [answerKey]: action.payload.answer,
        },
      };
    }

    case 'SUBMIT_CURRENT_CASE': {
      if (!canSubmitCurrentCase(state)) {
        return state;
      }

      const currentCase = getCurrentCase(state);
      if (!currentCase) {
        return state;
      }

      const nextCaseIndex = state.currentCaseIndex < state.cases.length - 1 ? state.currentCaseIndex + 1 : state.currentCaseIndex;

      return {
        ...state,
        currentCaseIndex: nextCaseIndex,
        caseSubmitted: {
          ...state.caseSubmitted,
          [currentCase.caseId]: true,
        },
      };
    }

    case 'SUBMIT_EXAM': {
      if (state.status !== 'in_progress') {
        return state;
      }

      return {
        ...state,
        status: 'submitted',
        caseSubmitted: action.payload.submittedCaseId
          ? {
              ...state.caseSubmitted,
              [action.payload.submittedCaseId]: true,
            }
          : state.caseSubmitted,
        lastSubmittedAttemptId: action.payload.attemptId,
        lastSubmittedReview: action.payload.review,
      };
    }

    case 'RESET_EXAM':
      return initialState;

    default:
      return state;
  }
}

type ExamAttemptContextValue = {
  state: ExamAttemptState;
  currentCase: CaseWithQuestions | null;
  startExam: (cases: CaseWithQuestions[], examSize: ExamSize) => boolean;
  selectAnswer: (caseId: string, questionId: string, answer: OptionValue) => void;
  submitCurrentCase: () => void;
  submitExam: () => Promise<string | null>;
  resetExam: () => void;
  isCurrentCaseAnswered: boolean;
  canSubmitCurrentCase: boolean;
  canSubmitExam: boolean;
  allCasesSubmitted: boolean;
  lastSubmittedReview: AttemptReview | null;
};

const ExamAttemptContext = createContext<ExamAttemptContextValue | undefined>(undefined);

export function ExamAttemptProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(examAttemptReducer, initialState);

  const value = useMemo<ExamAttemptContextValue>(
    () => ({
      state,
      currentCase: getCurrentCase(state),
      startExam: (cases, examSize) => {
        if (!validateCaseIntegrity(cases, examSize)) {
          return false;
        }

        dispatch({ type: 'START_EXAM', payload: { cases, examSize } });
        return true;
      },
      selectAnswer: (caseId, questionId, answer) =>
        dispatch({
          type: 'SELECT_ANSWER',
          payload: { caseId, questionId, answer },
        }),
      submitCurrentCase: () => dispatch({ type: 'SUBMIT_CURRENT_CASE' }),
      submitExam: async () => {
        if (!canSubmitExam(state) || state.examSize === null) {
          return null;
        }

        const currentCase = getCurrentCase(state);
        if (!currentCase) {
          return null;
        }

        const submittedCaseId = state.caseSubmitted[currentCase.caseId] ? null : currentCase.caseId;

        const userId = getRequiredUserId();
        const createdAt = new Date();
        const score = calculateExamScore(state.cases, state.answers);

        const attemptId = await saveExamAttempt({
          userId,
          caseIds: state.cases.map((caseItem) => caseItem.caseId),
          examSize: state.examSize,
          answers: state.answers,
          totalCorrect: score.totalCorrect,
          totalIncorrect: score.totalIncorrect,
          percentage: score.percentage,
          caseSnapshots: state.cases,
          createdAt,
        });

        const review = buildAttemptReviewFromCaseSnapshots(
          {
            attemptId,
            userId,
            caseIds: state.cases.map((caseItem) => caseItem.caseId),
            examSize: state.examSize,
            answers: state.answers,
            totalCorrect: score.totalCorrect,
            totalIncorrect: score.totalIncorrect,
            percentage: score.percentage,
            createdAt,
          },
          state.cases,
        );

        dispatch({ type: 'SUBMIT_EXAM', payload: { attemptId, submittedCaseId, review } });
        return attemptId;
      },
      resetExam: () => dispatch({ type: 'RESET_EXAM' }),
      isCurrentCaseAnswered: isCurrentCaseFullyAnswered(state),
      canSubmitCurrentCase: canSubmitCurrentCase(state),
      canSubmitExam: canSubmitExam(state),
      allCasesSubmitted: areAllCasesSubmitted(state),
      lastSubmittedReview: state.lastSubmittedReview,
    }),
    [state],
  );

  return <ExamAttemptContext.Provider value={value}>{children}</ExamAttemptContext.Provider>;
}

export function useExamAttemptStore() {
  const ctx = useContext(ExamAttemptContext);

  if (!ctx) {
    throw new Error('useExamAttemptStore must be used within ExamAttemptProvider');
  }

  return ctx;
}
