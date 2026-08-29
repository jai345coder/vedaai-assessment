

//One extracted question from the question paper
export type Question = {
      number:string;
      subpart:string | null;
      text:string;
      page:number;
}


//full result of question extraction - just an array of Question
export type  QuestionExtractionResult = {
      question :Question[],
}



//once detected the anser segment from the anser sheet + the mapping info

export type AnswerSegment = {
      matchedQuestion:string | null;
      text:string;//handwritten answer text
      page:number;//page no.

      /**
       * @Gemini_standared_bounding_box fomat @params {ymin , xmin , ymax , xmax}
       * @values are between 0 to 1000 relative to the iamge size
       *  We convert this to actual @pixel_positions later when drawing the highlight.
       */
     box:[number , number , number , number]//[ymin , xmin , ymax , xmax]
}

export type AnswerExtractionResult = {
      answers : AnswerSegment[];
}