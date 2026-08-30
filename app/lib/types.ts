// One extracted question from the question paper
export type Question = {
  number: string;
  subpart: string | null;
  text: string;
  page: number;
};

// Full result of question extraction
export type QuestionExtractionResult = {
  questions: Question[];
  question?: Question[];
};

// Detected answer segment from the answer sheet + mapping & grading info
export type AnswerSegment = {
  matchedQuestion: string | null;
  text: string; // handwritten answer text
  page: number; // page no.

  /**
   * Gemini standard bounding box format [ymin, xmin, ymax, xmax]
   * Values are between 0 to 1000 relative to the image size
   */
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax]

  /**
   * AI Grading fields
   */
  isCorrect?: boolean; // true if the answer correctly addresses the question, false otherwise
  marksAwarded?: number; // 0, 1, or 2 (out of maxMarks of 2)
  feedback?: string; // short one-sentence explanation of why marks were awarded or deducted
};

export type AnswerExtractionResult = {
  answers: AnswerSegment[];
};