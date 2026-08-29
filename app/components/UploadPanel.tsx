


"use client";

import { useState } from "react";

export type PageImage = { //type declaration to hold page image data
    pageIndex: number; //stores the page number
    imgUrl: string; //stores the blob/base64 url of the img
};

/***
 * @fileToPageImages - async function that takes a pdf File objects and return array of page img objects
 */
async function fileToPageImages(file: File): Promise<PageImage[]> {
    // given file is a PDF file
    if (file.type === "application/pdf") {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const array_Buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: array_Buffer }).promise;
        const images: PageImage[] = [];

        //loop at each page of the pdf
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);

            /**
             * @viewport -- > helps to describe @page_size and @zoom scale
             * @important as matters because @Gemini needs to read small handwritten text clearly
             */
            const viewport = page.getViewport({ scale: 2 });

            /**
             * @canvas to actual work where @PDF actually gets converted to pixels
             */
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            /**
             * @context a drawing tool -- like a pen on the @canvas
             */
            const context = canvas.getContext("2d")!;

            await page.render({
                canvasContext: context,
                viewport,
                canvas
            }).promise;

            images.push({ pageIndex: i, imgUrl: canvas.toDataURL("image/png") });
        }

        return images;
    } else {
        /**
         * if uploaded file is already an image @no_rendering_needed
         */
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        return [{ pageIndex: 1, imgUrl: dataUrl }];
    }
}


//UI
export default function UploadPanel({
  label,
  onExtracted,
}: {
  label: string;
  onExtracted: (images: PageImage[]) => void;
}) {
const [status , setStatus] = useState <"idle" | "done" | "loading" | "error" > ("idle");

const [progress ,setProgress] = useState<string>("");//show how many pages got rendered

/**
 * @handleFile run s when even user selects a file
 */
async function handleFile(e:React.ChangeEvent<HTMLInputElement>){
const file  = e.target.files?.[0];//grab the selectded file
if(!file){
      return;
}

setStatus("loading");
setProgress("rendering page....");

try{
      //PDF to img conversion
      const images = await fileToPageImages(file);
      setProgress(`Rendered ${images.length} pages`);
      onExtracted(images);
        setStatus("done");
}catch(err){
      console.log("error :",err);
      setStatus("error");
}



}
     
 return (
    <div className="border rounded-lg p-4">
      <label className="block font-medium mb-2">{ label}</label>
      <input
        type="file"
        accept="application/pdf,image/*"  // restricts the file picker to PDFs and images
        onChange={handleFile}              // run handleFile whenever a file is chosen
        disabled={status === "loading"} // prevent re-uploading while one is in progress
      />
      {status === "loading" && <p className="text-sm text-gray-500 mt-2">{progress}</p>}
      {status === "done" && <p className="text-sm text-green-600 mt-2">{progress} ✓</p>}
      {status === "error" && <p className="text-sm text-red-600 mt-2">Failed to process file</p>}
    </div>
  );

}
