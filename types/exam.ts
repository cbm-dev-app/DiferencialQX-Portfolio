// types/exam.ts

export type ExamStatus = "idle" | "in_progress" | "submitted";
export type ExamSize = 5 | 10 | 25;

export type OptionValue = "A" | "B" | "C" | "D";

export type Question = {
  questionId: string;
  numero: 1 | 2 | 3 | 4;
  pregunta: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  opcion_d: string;
  opcion_correcta: OptionValue;
};

export type CaseWithQuestions = {
  caseId: string;
  tema: string;
  subtema?: string; // now optional
  caso: string;
  referencia: string;
  questions: Question[];
};

export type AnswerMap = Record<string, OptionValue>;
