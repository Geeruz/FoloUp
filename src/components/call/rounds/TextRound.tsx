"use client";

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import type { Question } from "@/types/interview";
import { ArrowRightIcon } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

export interface TextRoundTranscript {
  question: string;
  answer: string;
}

interface TextRoundProps {
  roundLabel: string;
  roundIcon: string;
  questions: Question[];
  themeColor: string;
  onRoundComplete: (transcripts: TextRoundTranscript[]) => void;
}

export default function TextRound({
  roundLabel,
  roundIcon,
  questions,
  themeColor,
  onRoundComplete,
}: TextRoundProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcripts, setTranscripts] = useState<TextRoundTranscript[]>([]);

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  } = useSpeechRecognition();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Automatically start and keep listening
  useEffect(() => {
    if (isSupported && !isListening) {
      startListening();
    }
  }, [isSupported, isListening, startListening]);

  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  const handleSubmitAnswer = useCallback(() => {
    const newTranscript: TextRoundTranscript = {
      question: currentQuestion.question,
      answer: transcript || "(No answer provided)",
    };

    const updatedTranscripts = [...transcripts, newTranscript];
    setTranscripts(updatedTranscripts);

    if (isLastQuestion) {
      stopListening();
      onRoundComplete(updatedTranscripts);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetTranscript();
    }
  }, [
    currentQuestion,
    transcript,
    transcripts,
    isLastQuestion,
    onRoundComplete,
    resetTranscript,
    stopListening,
  ]);

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-5xl mb-4">🎙️</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Speech Recognition Not Supported
        </h3>
        <p className="text-sm text-slate-500 max-w-md">
          Your browser doesn&apos;t support speech recognition. Please use
          Chrome, Edge, or Safari for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4 py-8 max-w-4xl mx-auto w-full">
      {/* Round header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{roundIcon}</span>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            {roundLabel}
          </span>
        </div>
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Question{" "}
          <span className="font-black text-lg text-slate-900">
            {currentQuestionIndex + 1}
          </span>{" "}
          / {questions.length}
        </div>
      </div>

      {/* Question progress bar */}
      <div className="h-2 bg-slate-100 rounded-full mb-10 overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-500 bg-slate-900"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 mb-8 border border-slate-100 shadow-sm">
        <p className="text-2xl md:text-3xl font-bold text-slate-900 leading-relaxed">
          {currentQuestion?.question}
        </p>
      </div>

      {/* Answer area */}
      <div className="flex-1 flex flex-col">
        {/* Transcript display */}
        <div className="flex-1 min-h-[200px] max-h-[300px] rounded-[2rem] border border-slate-200 bg-slate-50 p-8 mb-8 overflow-y-auto transition-all shadow-inner">
          <div className="flex items-center gap-3 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Live Recording
            </span>
          </div>
          <p className="text-slate-900 text-lg md:text-xl font-medium leading-relaxed">
            {transcript}
            {interimTranscript && (
              <span className="text-slate-400">{interimTranscript}</span>
            )}
            {!transcript && !interimTranscript && (
              <span className="text-slate-300 italic">
                Listening carefully...
              </span>
            )}
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="text-red-500 text-sm font-semibold text-center mb-6">
            Microphone error: {error}. Please check your permissions.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center pb-8 mt-auto">
            <button
              type="button"
              className="group relative px-10 py-5 rounded-full flex items-center justify-center bg-slate-900 text-white shadow-lg hover:bg-black hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              onClick={handleSubmitAnswer}
            >
              <span className="text-lg font-bold tracking-widest uppercase">
                {isLastQuestion ? "Complete Round" : "Next Question"}
              </span>
              <ArrowRightIcon className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform" />
            </button>
        </div>
      </div>
    </div>
  );
}
