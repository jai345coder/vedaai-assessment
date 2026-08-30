import { getGeminiModel } from "@/app/lib/gemini";
import { QUESTION_EXTRACTION_PROMPT } from "@/app/lib/prompts/questionExtraction";
import { NextResponse , NextRequest } from "next/server";
import { QuestionExtractionResult } from "@/app/lib/types";

/**
 * @POST this only runs when the  frontend needs a @post request
 */

 export async function POST(req :NextRequest){
      try{
            //parse the json body sent by frontend logic
            const body = await req.json();
            const images : {
                  page:number ,
                  dataUrl:string

            }[] = body.images;

            //if not found
            if(!images || images.length === 0){
                  return NextResponse.json({
                        message:"No images uploaded",
                        status:400
                  })
            }

            //get the gemini model ready
            const model = getGeminiModel();
            //gemini api wants raw 64 base data
            //so our url string include that preffix , so we strip it ...

            const imageParts = images.map((img) => {
                  const url = img.dataUrl || (img as unknown as { imgUrl?: string }).imgUrl || "";
                  const match = url.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
                  const mimeType = match ? match[1] : "image/jpeg";
                  return {
                        inlineData: {
                              //split on the comma : everything after it is the actual base64 data
                              data: url.includes(",") ? url.split(",")[1] : url,
                              mimeType,
                        },
                  };
            });


            /**
             * @generateContext takes the array of @parts - we 're sending the prompt text first
             * @folloed bt all the @page_img
             */

            const result = await model.generateContent([
                  QUESTION_EXTRACTION_PROMPT,
                  ...imageParts
            ]);


            /**
             * @gemini response must be json as it was requested alredy in the @instruction
             */
            const rawText = result.response.text();
            const cleanedText = rawText.replace(/```json|```/g,"").trim();

            //parsed the cleaned string into an actual JS object
            //If Gemini didnt returned valid JSON , this throw - caught 
            const questions = JSON.parse(cleanedText) as QuestionExtractionResult;

            //Send the parsed result back to the frontend as JSON
            return NextResponse.json({success:true , questions})
      }catch(err){


            console.log("extraction-question error :", err);
             return NextResponse.json({
                  error:"Something went wrong",
                  status:500
             })
      }
}