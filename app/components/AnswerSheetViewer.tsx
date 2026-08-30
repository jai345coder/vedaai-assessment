"use client";

import { AnswerSegment } from "../lib/types";

interface AnswerSheetViewerProps {
  pageDataUrl: string;
  highlights: AnswerSegment[];
  selectedQuestionKey?: string | null;
}

export default function AnswerSheetViewer({
  pageDataUrl,
  highlights,
  selectedQuestionKey,
}: AnswerSheetViewerProps) {
  return (
    <div className="relative w-full overflow-hidden flex justify-center bg-gray-100/50 p-2 md:p-4">
      <div className="relative inline-block max-w-full shadow-md rounded-lg overflow-hidden bg-white">
        {/* Answer sheet page image */}
        <img
          src={pageDataUrl}
          alt="Answer sheet page"
          className="max-w-full h-auto block select-none"
        />

        {/* Highlight bounding boxes */}
        {highlights.map((h, i) => {
          const [ymin, xmin, ymax, xmax] = h.box;

          const top = (ymin / 1000) * 100;
          const left = (xmin / 1000) * 100;
          const height = ((ymax - ymin) / 1000) * 100;
          const width = ((xmax - xmin) / 1000) * 100;
          const label = h.matchedQuestion ? `Q${h.matchedQuestion}` : (selectedQuestionKey ? `Q${selectedQuestionKey}` : "");

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `${top}%`,
                left: `${left}%`,
                height: `${height}%`,
                width: `${width}%`,
              }}
              className="border-2 border-[#22C55E] bg-[#22C55E]/15 rounded-lg pointer-events-none transition-all duration-300 z-10"
            >
              {/* Question badge on top-left of box matching Figma */}
              {label && (
                <span className="absolute -top-3.5 left-1 bg-[#22C55E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                  {label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}