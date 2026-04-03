"use client";

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import type { Question } from "@/types/interview";
import { MicIcon, MicOffIcon, ArrowRightIcon, RotateCcwIcon } from "lucide-react";
import React, { useState, useCallback } from "react";
import { Button } from "../../ui/button";

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

type QuestionState = "ready" | "recording" | "review";

export default function TextRound({
  roundLabel,
  roundIcon,
  questions,
  themeColor,
  onRoundComplete,
}: TextRoundProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionState, setQuestionState] = useState<QuestionState>("ready");
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

  const handleStartRecording = useCallback(() => {
    resetTranscript();
    startListening();
    setQuestionState("recording");
  }, [resetTranscript, startListening]);

  const handleStopRecording = useCallback(() => {
    stopListening();
    setQuestionState("review");
  }, [stopListening]);

  const handleReRecord = useCallback(() => {
    resetTranscript();
    setQuestionState("ready");
  }, [resetTranscript]);

  const handleSubmitAnswer = useCallback(() => {
    const newTranscript: TextRoundTranscript = {
      question: currentQuestion.question,
      answer: transcript || "(No answer provided)",
    };

    const updatedTranscripts = [...transcripts, newTranscript];
    setTranscripts(updatedTranscripts);

    if (isLastQuestion) {
      onRoundComplete(updatedTranscripts);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionState("ready");
      resetTranscript();
    }
  }, [
    currentQuestion,
    transcript,
    transcripts,
    isLastQuestion,
    onRoundComplete,
    resetTranscript,
  ]);

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-5xl mb-4">🎙️</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Speech Recognition Not Supported
        </h3>
        <p className="text-sm text-gray-500 max-w-md">
          Your browser doesn&apos;t support speech recognition. Please use
          Chrome, Edge, or Safari for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4 py-2">
      {/* Round header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{roundIcon}</span>
          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            {roundLabel}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Question{" "}
          <span className="font-bold" style={{ color: themeColor }}>
            {currentQuestionIndex + 1}
          </span>{" "}
          of {questions.length}
        </div>
      </div>

      {/* Question progress bar */}
      <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: themeColor,
          }}
        />
      </div>

      {/* Question card */}
      <div
        className="rounded-xl p-6 mb-6 border"
        style={{
          backgroundColor: `${themeColor}08`,
          borderColor: `${themeColor}25`,
        }}
      >
        <p className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed">
          {currentQuestion?.question}
        </p>
      </div>

      {/* Answer area */}
      <div className="flex-1 flex flex-col">
        {/* Transcript display */}
        <div
          className={`
            flex-1 min-h-[120px] max-h-[200px] rounded-xl border-2 p-4 mb-4 overflow-y-auto
            transition-all duration-300
            ${
              questionState === "recording"
                ? "border-red-300 bg-red-50"
                : questionState === "review"
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-gray-50"
            }
          `}
        >
          {questionState === "ready" && (
            <p className="text-gray-400 text-sm italic">
              Click the microphone button below to start recording your
              answer...
            </p>
          )}
          {questionState === "recording" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-red-600 uppercase">
                  Recording...
                </span>
              </div>
              <p className="text-gray-800 text-base leading-relaxed">
                {transcript}
                {interimTranscript && (
                  <span className="text-gray-400">{interimTranscript}</span>
                )}
                {!transcript && !interimTranscript && (
                  <span className="text-gray-400 italic">
                    Speak now...
                  </span>
                )}
              </p>
            </div>
          )}
          {questionState === "review" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-green-600 uppercase">
                  Your Answer
                </span>
              </div>
              <p className="text-gray-800 text-base leading-relaxed">
                {transcript || "(No speech detected)"}
              </p>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-3">
            Microphone error: {error}. Please check your permissions.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 pb-2">
          {questionState === "ready" && (
            <button
              type="button"
              onClick={handleStartRecording}
              className="group relative w-16 h-16 rounded-full flex items-center justify-center
                         bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg
                         hover:shadow-xl hover:scale-105 transition-all duration-200
                         active:scale-95"
              style={{
                boxShadow: `0 4px 20px rgba(239, 68, 68, 0.4)`,
              }}
            >
              <MicIcon className="w-7 h-7" />
              <span className="absolute -bottom-7 text-xs font-medium text-gray-500 whitespace-nowrap">
                Tap to record
              </span>
            </button>
          )}

          {questionState === "recording" && (
            <button
              type="button"
              onClick={handleStopRecording}
              className="group relative w-16 h-16 rounded-full flex items-center justify-center
                         bg-gradient-to-br from-gray-700 to-gray-800 text-white shadow-lg
                         hover:shadow-xl hover:scale-105 transition-all duration-200
                         active:scale-95 animate-pulse"
            >
              <MicOffIcon className="w-7 h-7" />
              <span className="absolute -bottom-7 text-xs font-medium text-gray-500 whitespace-nowrap">
                Stop recording
              </span>
            </button>
          )}

          {questionState === "review" && (
            <>
              <Button
                variant="outline"
                className="h-10 px-4 border-gray-300 text-gray-600 hover:bg-gray-100"
                onClick={handleReRecord}
              >
                <RotateCcwIcon className="w-4 h-4 mr-2" />
                Re-record
              </Button>
              <Button
                className="h-10 px-6 text-white"
                style={{ backgroundColor: themeColor }}
                onClick={handleSubmitAnswer}
              >
                {isLastQuestion ? "Complete Round" : "Next Question"}
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
