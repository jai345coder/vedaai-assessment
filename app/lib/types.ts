

//One extracted question from the question paper
export type Question = {
      number:string;
      subpart:string | null;
      text:string;
      page:number;
}


//full result of question extraction - just an array of Question
export type QuestionExtractionResult = {
      questions: Question[];
      // Support singular for compatibility if needed
      question?: Question[];
}

// Detected answer segment from the answer sheet + mapping info
export type AnswerSegment = {
      matchedQuestion: string | null;
      text: string; // handwritten answer text
      page: number; // page no.

      /**
       * Gemini standard bounding box format [ymin, xmin, ymax, xmax]
       * Values are between 0 to 1000 relative to the image size
       */
      box: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export type AnswerExtractionResult = {
      answers: AnswerSegment[];
}