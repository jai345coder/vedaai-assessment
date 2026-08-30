"use client";

import { useState } from "react";
import UploadPanel, { PageImage, FileDetails } from "./components/UploadPanel";
import AnswerSheetViewer from "./components/AnswerSheetViewer";
import Sidebar from "./components/Sidebar";
import { Question, AnswerSegment } from "./lib/types";

export default function Home() {
  // Uploaded images state
  const [questionPaperImg, setQuestionPaperImg] = useState<PageImage[]>([]);
  const [answerPaperImg, setAnwerPaperImg] = useState<PageImage[]>([]);

  // File metadata state
  const [questionFile, setQuestionFile] = useState<FileDetails | null>(null);
  const [answerFile, setAnswerFile] = useState<FileDetails | null>(null);

  // AI extracted results state
  const [extractQuestions, setExtractQuestions] = useState<Question[]>([]);
  const [extractedAnswers, setExtractedAnswers] = useState<AnswerSegment[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  // UI state
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<"questions" | "answers">("questions");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExpandedAll, setIsExpandedAll] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const hasBothFiles = questionPaperImg.length > 0 && answerPaperImg.length > 0;
  const isMapped = extractQuestions.length > 0 && extractedAnswers.length > 0;

  // Handle full extraction and grading flow
  const handleStartMapping = async () => {
    if (!hasBothFiles) return;

    setIsExtracting(true);
    setErrorMessage(null);

    try {
      // Step 1: Extract questions
      const qRes = await fetch("/api/extract-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: questionPaperImg }),
      });

      if (!qRes.ok) {
        throw new Error("Failed to extract questions from question paper.");
      }

      const qData = await qRes.json();
      const rawQuestions = qData.questions?.questions || qData.questions || [];
      setExtractQuestions(rawQuestions);

      // Step 2: Extract answers, map bounding boxes, and grade correctness
      const aRes = await fetch("/api/extract-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: answerPaperImg,
          questions: rawQuestions,
        }),
      });

      if (!aRes.ok) {
        throw new Error("Failed to map and grade answers from answer sheets.");
      }

      const aData = await aRes.json();
      const rawAnswers = aData.answer || aData.answers || [];
      setExtractedAnswers(rawAnswers);

      // Select first question by default
      if (rawQuestions.length > 0) {
        const firstKey = `${rawQuestions[0].number}${rawQuestions[0].subpart ?? ""}`;
        setSelectedQuestion(firstKey);

        const firstMatch = rawAnswers.find((a: AnswerSegment) => a.matchedQuestion === firstKey);
        if (firstMatch && firstMatch.page) {
          setCurrentPage(firstMatch.page);
        } else {
          setCurrentPage(1);
        }
      }
    } catch (err: any) {
      console.error("Mapping pipeline error:", err);
      setErrorMessage(err.message || "An error occurred during extraction & grading.");
    } finally {
      setIsExtracting(false);
    }
  };

  // Select question and automatically focus corresponding page
  const handleSelectQuestion = (key: string) => {
    setSelectedQuestion(key);
    const matches = extractedAnswers.filter((a) => a.matchedQuestion === key);
    if (matches.length > 0 && matches[0].page) {
      setCurrentPage(matches[0].page);
    }
  };

  // Reset to re-upload files
  const handleReset = () => {
    setExtractQuestions([]);
    setExtractedAnswers([]);
    setSelectedQuestion(null);
    setQuestionPaperImg([]);
    setAnwerPaperImg([]);
    setQuestionFile(null);
    setAnswerFile(null);
    setCurrentPage(1);
    setErrorMessage(null);
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 150));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 75));
  const handleZoomReset = () => setZoomLevel(100);

  // Pagination on answer sheet
  const totalPages = answerPaperImg.length > 0 ? answerPaperImg.length : 1;
  const currentPageImg = answerPaperImg.find((img) => img.pageIndex === currentPage) || answerPaperImg[0];

  // Highlights & feedback for currently selected question
  const currentPageHighlights = selectedQuestion
    ? extractedAnswers.filter(
        (a) => a.matchedQuestion === selectedQuestion && a.page === currentPage
      )
    : [];

  const selectedQuestionMatches = selectedQuestion
    ? extractedAnswers.filter((a) => a.matchedQuestion === selectedQuestion)
    : [];

  const selectedAnswerFeedback = selectedQuestionMatches.find((m) => m.feedback)?.feedback;
  const selectedAnswerMarks = selectedQuestionMatches[0]?.marksAwarded ?? (selectedQuestionMatches.length > 0 ? 0 : null);

  // Helper for score badge rendering
  const renderScoreBadge = (marks: number | undefined | null) => {
    if (marks === undefined || marks === null) return null;
    const maxMarks = 2;

    if (marks >= maxMarks) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shadow-2xs">
          <span>{marks}/{maxMarks}</span>
        </span>
      );
    } else if (marks > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shadow-2xs">
          <span>{marks}/{maxMarks}</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md shadow-2xs">
          <span>0/{maxMarks}</span>
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-gray-900 flex p-2 md:p-4 gap-4 font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* LEFT SIDEBAR (Matching Figma) */}
      <div className="hidden lg:flex flex-col flex-shrink-0">
        <Sidebar
          activeNav="Exams"
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 bg-white md:rounded-3xl border border-gray-200/70 shadow-sm overflow-hidden">
        {/* TOP APPLICATION BAR */}
        <header className="px-4 md:px-6 py-3.5 border-b border-gray-100 flex items-center justify-between gap-4 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Sidebar / Home link */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-sm">
                V
              </div>
              <span className="font-bold text-sm text-gray-900">VedaAI</span>
            </div>

            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 font-medium">
              <button
                onClick={handleReset}
                className="hover:text-gray-900 flex items-center gap-1 cursor-pointer transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Exams</span>
              </button>
              <span>/</span>
              <span className="text-gray-900 font-semibold truncate">
                {isMapped ? "Assessment Evaluation & Mapping" : "Upload Assessment"}
              </span>
            </div>
          </div>

          {/* User profile & Actions */}
          <div className="flex items-center gap-3">
            {/* Help Icon */}
            <button className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Notification Bell */}
            <button className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition relative cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="w-2 h-2 rounded-full bg-orange-500 absolute top-1.5 right-1.5" />
            </button>

            {/* User Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                MR
              </div>
              <span className="text-xs font-semibold text-gray-800 hidden sm:inline">
                Madhur Rastogi
              </span>
            </div>
          </div>
        </header>

        {/* SCREEN CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* 1. LOADING SCREEN */}
          {isExtracting ? (
            <main className="flex-1 flex items-center justify-center p-6 bg-[#FAFBFD]">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 md:p-16 max-w-lg w-full flex flex-col items-center text-center animate-fade-in">
                {/* Coral Sparkle Cluster */}
                <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                  <svg
                    className="w-14 h-14 text-[#F25C3B] animate-pulse"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L14.2 8.3L20.5 10.5L14.2 12.7L12 19L9.8 12.7L3.5 10.5L9.8 8.3L12 2Z" />
                  </svg>
                  <svg
                    className="w-7 h-7 text-[#F25C3B] absolute -top-1 -right-1 animate-bounce"
                    style={{ animationDuration: "2s" }}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L13.8 7.2L19 9L13.8 10.8L12 16L10.2 10.8L5 9L10.2 7.2L12 2Z" />
                  </svg>
                  <svg
                    className="w-4 h-4 text-[#F25C3B] absolute bottom-0 -left-1 animate-pulse"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Extracting & Grading...
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-normal">
                  Evaluating student answers with AI subject knowledge
                </p>

                <div className="w-52 h-1.5 bg-gray-100 rounded-full mt-8 overflow-hidden">
                  <div className="h-full bg-[#F25C3B] rounded-full animate-indeterminate" />
                </div>
              </div>
            </main>
          ) : !isMapped ? (
            /* 2. UPLOAD SCREEN */
            <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 md:py-14 max-w-4xl mx-auto w-full">
              {/* Headline */}
              <div className="text-center mb-4">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">
                  Upload{" "}
                  <span className="text-[#F25C3B] underline decoration-orange-200 decoration-wavy underline-offset-4">
                    Question Paper & Answer Sheets
                  </span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 mt-2 font-normal">
                  Upload both files to get started
                </p>
              </div>

              {/* Center Avatar Badge */}
              <div className="relative my-3 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-orange-100/70 border border-orange-200/60 flex items-center justify-center shadow-inner">
                  <div className="w-18 h-18 rounded-full bg-orange-200/70 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#F25C3B] text-white flex items-center justify-center shadow-sm">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="w-full max-w-2xl mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-700 flex items-center gap-2 shadow-2xs">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Two Upload Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl mt-4">
                <UploadPanel
                  label="Question Paper"
                  sublabel="Upload PDF or image"
                  onExtracted={(images, details) => {
                    setQuestionPaperImg(images);
                    setQuestionFile(details);
                  }}
                />

                <UploadPanel
                  label="Answer Sheet"
                  sublabel="Upload PDF or image"
                  onExtracted={(images, details) => {
                    setAnwerPaperImg(images);
                    setAnswerFile(details);
                  }}
                />
              </div>

              {/* Start Mapping Action */}
              <div className="flex flex-col items-center mt-8 space-y-2.5">
                <button
                  onClick={handleStartMapping}
                  disabled={!hasBothFiles}
                  className={`px-8 py-3 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 shadow-sm ${
                    hasBothFiles
                      ? "bg-[#1E1F24] hover:bg-black text-white cursor-pointer hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span>Start Mapping</span>
                  <span>→</span>
                </button>

                <p className="text-[11px] md:text-xs text-gray-400 text-center max-w-sm">
                  Once both files are uploaded, you&apos;ll be able to map answers with questions
                </p>
              </div>
            </main>
          ) : (
            /* 3. MAPPING & GRADING SCREEN */
            <main className="flex-1 flex flex-col p-3 md:p-6 w-full">
              {/* Top Sub-Bar with Reset button & Mobile Switcher */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 px-3.5 py-1.5 rounded-full transition shadow-2xs cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Upload New Files</span>
                  </button>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    • {extractQuestions.length} Questions Evaluated
                  </span>
                </div>

                {/* Mobile Tab Switcher */}
                <div className="flex md:hidden bg-gray-200/80 p-1 rounded-full">
                  <button
                    onClick={() => setActiveMobileTab("questions")}
                    className={`text-xs font-medium px-4 py-1.5 rounded-full transition ${
                      activeMobileTab === "questions"
                        ? "bg-[#1E1F24] text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Questions
                  </button>
                  <button
                    onClick={() => setActiveMobileTab("answers")}
                    className={`text-xs font-medium px-4 py-1.5 rounded-full transition ${
                      activeMobileTab === "answers"
                        ? "bg-[#1E1F24] text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Answer Sheet
                  </button>
                </div>
              </div>

              {/* Two-Panel Split Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 items-start">
                {/* LEFT PANEL: Extracted Questions with Score Badges & AI Feedback */}
                <div
                  className={`md:col-span-6 lg:col-span-5 flex flex-col bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden ${
                    activeMobileTab === "questions" ? "block" : "hidden md:flex"
                  }`}
                >
                  {/* Panel Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h2 className="text-xs md:text-sm font-semibold text-gray-800 tracking-tight">
                      Extracted Questions (from question paper)
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsExpandedAll((prev) => !prev)}
                      className="text-[11px] font-medium text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200/80 px-2.5 py-1 rounded-full transition cursor-pointer"
                    >
                      {isExpandedAll ? "Collapse All" : "Expand All"}
                    </button>
                  </div>

                  {/* Questions List */}
                  <div className="p-3 space-y-2.5 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {extractQuestions.map((q) => {
                      const key = `${q.number}${q.subpart ?? ""}`;
                      const isSelected = selectedQuestion === key;
                      const matches = extractedAnswers.filter((a) => a.matchedQuestion === key);
                      const hasAnswer = matches.length > 0;
                      const marks = hasAnswer ? matches[0].marksAwarded : null;
                      const feedback = matches.find((m) => m.feedback)?.feedback;

                      return (
                        <div
                          key={key}
                          onClick={() => handleSelectQuestion(key)}
                          className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer border ${
                            isSelected
                              ? "border-2 border-[#F25C3B] bg-orange-50/30 shadow-xs"
                              : "border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Circular Number Badge */}
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-colors ${
                                isSelected
                                  ? "bg-[#F25C3B] text-white shadow-xs"
                                  : "bg-[#2A2B2F] text-white"
                              }`}
                            >
                              {key}
                            </div>

                            {/* Question Text & Feedback */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs md:text-sm text-gray-800 leading-relaxed font-normal ${isExpandedAll || isSelected ? "" : "line-clamp-2"}`}>
                                {q.text}
                              </p>

                              {/* AI Feedback Card (matching Figma design when expanded or selected) */}
                              {hasAnswer && feedback && (isSelected || isExpandedAll) && (
                                <div className="mt-3 bg-gray-50/90 border border-gray-100 rounded-xl p-3 text-xs animate-fade-in">
                                  <p className="font-bold text-gray-900 text-[11px] mb-1 flex items-center gap-1.5">
                                    <span className="text-orange-500">✦</span>
                                    <span>AI Feedback</span>
                                  </p>
                                  <p className="text-gray-600 leading-relaxed text-[11px]">
                                    {feedback}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Right Status Badge: Score or Unmatched Tag */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {hasAnswer ? (
                                renderScoreBadge(marks)
                              ) : (
                                <span className="inline-flex items-center text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                                  No answer found
                                </span>
                              )}

                              {/* Chevron Icon */}
                              <div className="text-gray-400">
                                <svg
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                    isSelected ? "rotate-180 text-orange-600" : ""
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT PANEL: Answer Sheet Viewer + Feedback Callout */}
                <div
                  className={`md:col-span-6 lg:col-span-7 flex flex-col bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden ${
                    activeMobileTab === "answers" ? "block" : "hidden md:flex"
                  }`}
                >
                  {/* Dark Navigation Top Header */}
                  <div className="bg-[#2A2B2F] text-white px-4 py-2.5 flex items-center justify-between text-xs select-none">
                    <span className="font-medium text-gray-200">Answer Sheet</span>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-md text-gray-300">
                      <button
                        onClick={handleZoomOut}
                        title="Zoom Out"
                        type="button"
                        className="hover:text-white px-1 font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        onClick={handleZoomReset}
                        title="Reset Zoom"
                        type="button"
                        className="hover:text-white text-[11px] font-medium px-1 cursor-pointer"
                      >
                        {zoomLevel}%
                      </button>
                      <button
                        onClick={handleZoomIn}
                        title="Zoom In"
                        type="button"
                        className="hover:text-white px-1 font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Page Navigation */}
                    <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-md text-gray-300 text-[11px]">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage <= 1}
                        className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer px-1 font-bold"
                        title="Previous Page"
                      >
                        &lt;
                      </button>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage >= totalPages}
                        className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer px-1 font-bold"
                        title="Next Page"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>

                  {/* Viewer Content Area */}
                  <div className="bg-gray-100/60 p-3 md:p-5 overflow-auto max-h-[calc(100vh-200px)] min-h-[420px] flex flex-col items-center justify-start">
                    {/* Notice if question has no answer */}
                    {selectedQuestion && selectedQuestionMatches.length === 0 && (
                      <div className="w-full max-w-lg mb-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800 flex items-center gap-2 shadow-2xs">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>No handwritten answer region found for Q{selectedQuestion}.</span>
                      </div>
                    )}

                    {/* Notice if answer is on a different page */}
                    {selectedQuestion && selectedQuestionMatches.length > 0 && currentPageHighlights.length === 0 && (
                      <div className="w-full max-w-lg mb-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-blue-800 flex items-center justify-between shadow-2xs">
                        <span>
                          Answer for Q{selectedQuestion} is on{" "}
                          {selectedQuestionMatches.map((m) => `Page ${m.page}`).join(", ")}.
                        </span>
                        <button
                          onClick={() => setCurrentPage(selectedQuestionMatches[0].page)}
                          className="underline font-semibold ml-2 cursor-pointer text-blue-900"
                        >
                          Jump to page →
                        </button>
                      </div>
                    )}

                    {/* Answer Sheet Page Image & Highlights */}
                    {currentPageImg ? (
                      <div
                        style={{
                          transform: `scale(${zoomLevel / 100})`,
                          transformOrigin: "top center",
                          transition: "transform 0.15s ease-out",
                        }}
                        className="max-w-full"
                      >
                        <AnswerSheetViewer
                          pageDataUrl={currentPageImg.imgUrl}
                          highlights={currentPageHighlights}
                          selectedQuestionKey={selectedQuestion}
                        />
                      </div>
                    ) : (
                      <div className="py-16 text-center text-gray-400 text-sm">
                        No answer sheet page available
                      </div>
                    )}

                    {/* Small Feedback Callout Box below Answer Sheet (as requested) */}
                    {selectedQuestion && selectedAnswerFeedback && (
                      <div className="w-full max-w-xl mt-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                            <span className="text-orange-500">✦</span>
                            <span>Evaluation for Question {selectedQuestion}</span>
                          </div>
                          {selectedAnswerMarks !== null && renderScoreBadge(selectedAnswerMarks)}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {selectedAnswerFeedback}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          )}
        </div>
      </div>
    </div>
  );
}