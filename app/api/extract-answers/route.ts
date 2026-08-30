import { getGeminiModel } from "@/app/lib/gemini";
import { buildAnswerMappingPrompt } from "@/app/lib/prompts/answerMapping";
import { NextRequest, NextResponse } from "next/server";
import { AnswerExtractionResult, Question } from "@/app/lib/types";


/**
 * @POST /api/extract-answers
 * takes two things 
 * @params  questions[] - list of questions already extracted from question paper
 * @params answers[] - answer sheet page images
 * 
 * @returns 
 */

export async function POST(req: NextRequest) {
      try {

            const body = await req.json();
            const images: { page?: number; pageIndex?: number; dataUrl?: string; imgUrl?: string }[] = body.images;
            const questions: Question[] = body.questions;

            //if no answer images are found
            if (!images || images.length === 0) {
                  return NextResponse.json({
                        message: "No images uploaded",
                        status: 400
                  })
            }
            // if no question are found return error
            if (!questions || questions.length === 0) {
                  return NextResponse.json({
                        message: "No questions found",
                        status: 400
                  })
            }


            //get the gemini model ready
            const model = getGeminiModel();
            //dynamically injecting the question in the prompt structure
            const prompt = buildAnswerMappingPrompt(questions);

            // Convert images to inlineData parts with dynamically detected MIME type
            const imageParts = images.map((img) => {
                  const url = img.dataUrl || img.imgUrl || "";
                  const match = url.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
                  const mimeType = match ? match[1] : "image/jpeg";
                  return {
                        inlineData: {
                              data: url.includes(",") ? url.split(",")[1] : url,
                              mimeType,
                        }
                  };
            });

            const result = await model.generateContent([
                  prompt,
                  ...imageParts
            ]);

            const rawText = await result.response.text();
            const cleanedText = rawText.replace(/```json|```/g, "").trim();
            const parsed: AnswerExtractionResult = JSON.parse(cleanedText);

            return NextResponse.json({
                  success: true,
                  answer: parsed.answers
            })


      } catch (err) {
            console.error("extract-answers error:", err);
            return NextResponse.json({ error: "Failed to extract answers" }, { status: 500 });
      }
}