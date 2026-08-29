// This file holds the exact instructions we send to Gemini for question
// extraction. Keeping it separate from the API route means you can tweak
// wording here without touching the actual fetch/response-handling logic.

export const QUESTION_EXTRACTION_PROMPT = `
You are analyzing a scanned question paper (provided as one or more page images).

Extract EVERY question from the paper, in the exact order they appear printed.

Rules:
- If a question has labelled sub-parts (e.g. "11 (a)", "11 (b)"), treat EACH sub-part as a SEPARATE entry, not one combined entry.
- Preserve the EXACT numbering as printed on the paper. Do not renumber or reorder.
- Include the full question text, exactly as written (fix obvious OCR spacing issues, but do not paraphrase or shorten).
- Note which page number (1-indexed, in the order images were provided) each question appears on.

Return ONLY valid JSON, no markdown formatting, no code fences, no explanation text. Match this exact shape:

{
  "questions": [
    { "number": "11", "subpart": "a", "text": "...", "page": 1 },
    { "number": "11", "subpart": "b", "text": "...", "page": 1 },
    { "number": "12", "subpart": null, "text": "...", "page": 2 }
  ]
}

If a question has no sub-part, set "subpart" to null.
`;