/**
 * @answer_Mapping is the one needs the actual @question list as @context, so it's a FUNCTION that builds the
 * prompt string dynamically, not a fixed @constant.
 */

import type { Question } from "../types";

export function buildAnswerMappingPrompt(question:Question[]):string{
      //turn list of question into a single block
      //as 1. <the question>

      const questionListText = question.map((q)=>
      `${q.number} ${q.subpart ? `(${q.subpart})` :""}: ${q.text}`).join("\n");
      
            return `
You are analyzing a scanned, handwritten student answer sheet (provided as one or more page images).

Here is the list of questions from the question paper, for reference:
${questionListText}

Your task:
1. Identify every distinct handwritten answer segment on the page(s).
2. For each segment, determine which question number it answers, by matching content — NOT by position or order (answers may be out of order, or on a different page than expected).
3. If a segment doesn't clearly match any question, set "matchedQuestion" to null.
4. If a question from the list has NO matching answer anywhere, simply don't include it in your output — the frontend will detect the gap itself.
5. For each segment, provide a bounding box in the format [ymin, xmin, ymax, xmax], with each value normalized to a 0-1000 scale relative to that page image's dimensions (NOT pixel values). This is critical — the box must tightly enclose only that answer's handwritten text.
6. If a single answer spans multiple pages, output it as SEPARATE segments (one per page) with the SAME matchedQuestion value — the frontend will group them.

Return ONLY valid JSON, no markdown formatting, no code fences, no explanation. Match this exact shape:

{
  "answers": [
    { "matchedQuestion": "1", "text": "...", "page": 1, "box": [120, 80, 340, 900] },
    { "matchedQuestion": null, "text": "...", "page": 2, "box": [50, 60, 200, 850] }
  ]
}

      `;
}