
//this file is created for the reasopn to make Gemini reuasbe to clients that every API route can import without routing re creating its own connection

import {GoogleGenerativeAI} from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * @getGeminiModel is a ready to use instance for the gemeni model
 */

export function getGeminiModel(){
      return genAI.getGenerativeModel({
            model:"gemini-3.5-flash-lite"
      });
      
}
