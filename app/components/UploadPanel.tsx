"use client";

import { useState, useRef } from "react";

export type PageImage = {
  pageIndex: number;
  imgUrl: string;
};

export type FileDetails = {
  name: string;
  size: string;
  pages: number;
};

/**
 * Takes a @raw_image File and returns a @compressed_base64 dataUrl.
 * Caps the longest side at 1600 px and exports as @JPEG at 80% quality —
 * @raw_phone_camera photo (which can be 4000px+ and several MB)
 */

async function compressImage(file:File):Promise<string>{
  const rawData = await new Promise<string>((resolve ,reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve,reject)=>{
    const img = new Image();
    img.onload = ()=> resolve(img);
    img.onerror = reject;
    img.src = rawData;
  });

 const MAX_DIMENSION=1600;
 let {width , height} = img;

 /**
  * we need to @calculate the @dimension and scale down @proportionally
  * so that the longest side is @exactly 1600px, no larger.
  */

 if(width > MAX_DIMENSION || height > MAX_DIMENSION){
  const scale = MAX_DIMENSION / Math.max(width , height);
  width = Math.round(width * scale);
  height = Math.round(height * scale);
 }


 const canvas = document.createElement("canvas");
 canvas.width = width;
 canvas.height = height;
 const ctx = canvas.getContext("2d")!;
 ctx.imageSmoothingQuality="high";
 ctx.drawImage(img,0,0,width,height);

 // JPEG at 80%
 const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.5);
 return jpegDataUrl;
}



function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

async function fileToPageImages(file: File): Promise<PageImage[]> {
  if (file.type === "application/pdf") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images: PageImage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d")!;

      await page.render({
        canvasContext: context,
        viewport,
        canvas,
      }).promise;

      images.push({ pageIndex: i, imgUrl: canvas.toDataURL("image/png") });
    }

    return images;
  } else {
    console.log("Original file size (MB):", file.size / (1024 * 1024));
    const dataUrl = await compressImage(file);
    console.log("Compressed size (MB):", dataUrl.length / (1024 * 1024));
    return [{ pageIndex: 1, imgUrl: dataUrl }];
  }
}

interface UploadPanelProps {
  label: string;
  sublabel?: string;
  onExtracted: (images: PageImage[], fileDetails: FileDetails | null) => void;
}

export default function UploadPanel({
  label,
  sublabel = "Upload PDF or Image",
  onExtracted,
}: UploadPanelProps) {
  const [status, setStatus] = useState<"idle" | "done" | "loading" | "error">("idle");
  const [progress, setProgress] = useState<string>("");
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setStatus("loading");
    setProgress("Processing pages...");

    try {
      const images = await fileToPageImages(file);
      const details: FileDetails = {
        name: file.name,
        size: formatBytes(file.size),
        pages: images.length,
      };

      setFileDetails(details);
      setStatus("done");
      setProgress(`Rendered ${images.length} pages`);
      onExtracted(images, details);
    } catch (err) {
      console.error("Error parsing file:", err);
      setStatus("error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus("idle");
    setFileDetails(null);
    setProgress("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onExtracted([], null);
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileChange}
        disabled={status === "loading"}
        className="hidden"
        id={`upload-${label.replace(/\s+/g, "-")}`}
      />

      {status === "done" && fileDetails ? (
        // Filled State Card
        <div className="relative w-full rounded-2xl border-2 border-dashed border-gray-200/90 bg-white p-5 md:p-6 shadow-sm flex items-center justify-center min-h-[140px] transition-all hover:border-gray-300">
          <div className="flex items-center gap-3.5 bg-gray-50/80 border border-gray-100/80 rounded-xl px-4 py-3.5 w-full max-w-[340px] shadow-sm relative pr-10">
            {/* PDF Red Badge Icon */}
            <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <span className="text-[10px] font-black tracking-wider uppercase">PDF</span>
            </div>

            {/* File Info */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 truncate tracking-tight" title={fileDetails.name}>
                {fileDetails.name}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                {fileDetails.size} • {fileDetails.pages} {fileDetails.pages === 1 ? "Page" : "Pages"}
              </p>
            </div>

            {/* Small 'x' remove button */}
            <button
              onClick={handleRemove}
              title="Remove file"
              type="button"
              className="absolute right-2.5 top-2.5 w-5 h-5 rounded-full bg-gray-700/80 hover:bg-gray-900 text-white flex items-center justify-center transition shadow-sm cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        // Empty / Uploading State Card
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 p-6 md:p-8 flex flex-col items-center justify-center min-h-[140px] text-center ${
            isDragging
              ? "border-orange-400 bg-orange-50/50 scale-[1.01]"
              : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50 shadow-sm"
          }`}
        >
          {status === "loading" ? (
            <div className="flex flex-col items-center gap-2.5 py-2">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-gray-600">{progress}</p>
            </div>
          ) : status === "error" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-rose-600">Failed to parse file. Click to retry.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {/* Upload Icon */}
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mb-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-500">{sublabel}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
