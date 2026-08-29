
"use client"

import { useState } from 'react';
import UploadPanel, { PageImage } from './components/UploadPanel';

export default function Home() {

  /**
   * @questionPaperImg hold the images of question paper oncve uploaded
   */
  const [questionPaperImg, setQuestionPaperImg] = useState<PageImage[]>([]);

  /**
   * @anserPaperImg is used for collecting the anser images after uploading
   * 
   */
  const [answerPaperImg, setAnwerPaperImg] = useState<PageImage[]>([]);

  const [extractQuestions, setExtractQuestions] = useState<any[]>([]);

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
    <h1 className="text-2xl font-bold">VedaAI — Assessment Extraction</h1>

    {/* First upload panel: question paper.
          When UploadPanel finishes processing a file, it calls onExtracted
          with the resulting PageImage[] — here, we just save that into state. */}
    <UploadPanel
      label="Upload Question Paper (PDF or image)"
      onExtracted={(images) => setQuestionPaperImg(images)}
    />

    {answerPaperImg.length > 0 && extractQuestions.length > 0 && (
      <button
        onClick={async () => {
          console.log("Sending answer sheet to Gemini...");
          const res = await fetch("/api/extract-answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              images: answerPaperImg,
              questions: extractQuestions,
            }),
          });
          const data = await res.json();
          console.log("Answer mapping result:", data);
        }}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Test Answer Mapping
      </button>
    )}

    {/* Second upload panel: answer sheet. Same pattern, separate state. */}
    <UploadPanel
      label="Upload Answer Sheet (PDF or image)"
      onExtracted={(images) => setAnwerPaperImg(images)}
    />

    {/* Temporary debug view — NOT final UI, just so we can SEE that
          rasterization actually worked before building the real interface.
          We'll replace this with the real side-by-side view later. */}
    {questionPaperImg.length > 0 && (
      <div>
        <h2 className="font-semibold mt-4">Question Paper Pages:</h2>
        <div className="flex gap-2 flex-wrap">
          {/* .map() loops over each page image and renders it as an <img>.
                "key" is required by React whenever you render a list — it
                helps React track which item is which. We use page number. */}
          {questionPaperImg.map((img) => (
            <img key={img.pageIndex} src={img.imgUrl} alt={`Page ${img.pageIndex}`} className="w-40 border" />
          ))}
        </div>
      </div>
    )}




    {/* Temporary test button — sends the already-uploaded question paper
    images to our new API route and logs the result. Remove once we
    wire this into the real UI flow. */}
    {questionPaperImg.length > 0 && (
      <button
        onClick={async () => {
          console.log("Sending to Gemini...");
          const res = await fetch("/api/extract-questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images: questionPaperImg }),
          });
          const data = await res.json();
          console.log("Extraction result:", data);

          // NEW: save the questions array into state so the answer-mapping
          // test button below can use it too.
          setExtractQuestions(data.questions.questions);
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Test Question Extraction
      </button>
    )}

    {answerPaperImg.length > 0 && (
      <div>
        <h2 className="font-semibold mt-4">Answer Sheet Pages:</h2>
        <div className="flex gap-2 flex-wrap">
          {answerPaperImg.map((img) => (
            <img key={img.pageIndex} src={img.imgUrl} alt={`Page ${img.pageIndex}`} className="w-40 border" />
          ))}
        </div>
      </div>
    )}
  </main>


  );
}