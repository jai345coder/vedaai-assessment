import type { Question } from "../types";

export function buildAnswerMappingPrompt(questions: Question[]): string {
  const questionListText = questions
    .map((q) => `${q.number}${q.subpart ? ` (${q.subpart})` : ""}: ${q.text}`)
    .join("\n");

  return `
You are analyzing a scanned, handwritten student answer sheet (provided as one or more page images).

Here is the list of questions from the question paper, for reference:
${questionListText}

Your tasks:
1. IDENTIFY: Detect every distinct handwritten answer segment on the page(s).
2. MATCH: For each segment, determine which question number it answers by matching content and context — NOT by order or position (answers may be out of order or on different pages).
   - If a segment does not clearly match any question, set "matchedQuestion" to null.
   - If a question has NO matching answer anywhere, do NOT invent one.
3. BOUNDING BOX: For each segment, provide a bounding box in the format [ymin, xmin, ymax, xmax] with normalized values on a 0-1000 scale relative to that page image's dimensions. The box must tightly enclose that answer's handwritten text.
4. MULTI-PAGE ANSWERS: If an answer spans multiple pages, output separate segments (one per page) with the SAME matchedQuestion value.
5. CORRECTNESS & GRADING:
   - For every matched answer segment, evaluate the student's answer against the corresponding question based on general subject knowledge and standard curriculum accuracy for the question's apparent grade level.
   - You do not have an official answer key, so evaluate CONSERVATIVELY and fairly (do not invent facts; judge based on foundational subject correctness).
   - "isCorrect": true if the answer correctly and adequately answers the question, false otherwise.
   - "marksAwarded": A score out of a fixed maximum of 2 marks:
     * 2 = Complete, accurate, and addresses all core parts of the question.
     * 1 = Partially correct, incomplete, or contains minor errors/omissions.
     * 0 = Incorrect, irrelevant, or fails to address the question.
   - "feedback": A short, encouraging one-sentence explanation of why marks were awarded or deducted (e.g., "Correctly identified the organelle and balanced equation.", "Partially correct but missed the role of xylem vessels.", or "Incorrect identification of the heart chamber.").

Return ONLY valid JSON, no markdown formatting, no code fences, no explanation. Match this exact JSON structure:

{
  "answers": [
    {
      "matchedQuestion": "1",
      "text": "Photosynthesis is the process used by green plants to convert light energy into chemical energy.",
      "page": 1,
      "box": [120, 80, 340, 900],
      "isCorrect": true,
      "marksAwarded": 2,
      "feedback": "Accurately defines photosynthesis and energy conversion."
    },
    {
      "matchedQuestion": "2",
      "text": "The chloroplast is responsible.",
      "page": 1,
      "box": [360, 80, 480, 900],
      "isCorrect": true,
      "marksAwarded": 2,
      "feedback": "Correctly identified the chloroplast as the primary organelle."
    },
    {
      "matchedQuestion": null,
      "text": "Rough working calculation...",
      "page": 2,
      "box": [50, 60, 200, 850],
      "isCorrect": false,
      "marksAwarded": 0,
      "feedback": "Unmatched rough notes or scribbles."
    }
  ]
}
`;
}