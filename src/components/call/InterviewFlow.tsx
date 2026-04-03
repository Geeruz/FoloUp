"use client";

import type { Interview } from "@/types/interview";
import type { Question } from "@/types/interview";
import React, { useState, useCallback, useMemo } from "react";
import RoundStepper from "./rounds/RoundStepper";
import TextRound, { type TextRoundTranscript } from "./rounds/TextRound";
import OnCallRound from "./rounds/OnCallRound";

type RoundKey = "hr" | "evaluation" | "oncall";

interface InterviewFlowProps {
  interview: Interview;
  userName: string;
  userEmail: string;
  onInterviewComplete: (data: InterviewFlowResult) => void;
}

export interface InterviewFlowResult {
  hrTranscripts: TextRoundTranscript[];
  evaluationTranscripts: TextRoundTranscript[];
  onCallId: string;
}

interface RoundTransition {
  from: RoundKey;
  to: RoundKey;
  message: string;
  icon: string;
}

/**
 * Distributes interview questions across 3 rounds.
 * - If questions have a `round` field, use that
 * - Otherwise, split evenly: first third → HR, middle third → Evaluation, rest → On Call
 */
function distributeQuestions(questions: Question[]): {
  hr: Question[];
  evaluation: Question[];
  oncall: Question[];
} {
  const tagged = {
    hr: questions.filter((q) => q.round === "hr"),
    evaluation: questions.filter((q) => q.round === "evaluation"),
    oncall: questions.filter((q) => q.round === "oncall"),
  };

  // If questions are already tagged, use the tags
  const totalTagged = tagged.hr.length + tagged.evaluation.length + tagged.oncall.length;
  if (totalTagged > 0) {
    // Distribute untagged questions evenly
    const untagged = questions.filter((q) => !q.round);
    const perBucket = Math.ceil(untagged.length / 3);
    return {
      hr: [...tagged.hr, ...untagged.slice(0, perBucket)],
      evaluation: [
        ...tagged.evaluation,
        ...untagged.slice(perBucket, perBucket * 2),
      ],
      oncall: [...tagged.oncall, ...untagged.slice(perBucket * 2)],
    };
  }

  // No tags – split evenly by order
  const total = questions.length;
  const hrCount = Math.max(1, Math.ceil(total / 3));
  const evalCount = Math.max(1, Math.ceil((total - hrCount) / 2));

  return {
    hr: questions.slice(0, hrCount),
    evaluation: questions.slice(hrCount, hrCount + evalCount),
    oncall: questions.slice(hrCount + evalCount),
  };
}

const ROUND_TRANSITIONS: Record<string, RoundTransition> = {
  "hr-to-evaluation": {
    from: "hr",
    to: "evaluation",
    message: "HR Round Complete! Moving to Evaluation Round...",
    icon: "✅",
  },
  "evaluation-to-oncall": {
    from: "evaluation",
    to: "oncall",
    message: "Evaluation Complete! Connecting to AI Interviewer...",
    icon: "🚀",
  },
};

export default function InterviewFlow({
  interview,
  userName,
  userEmail,
  onInterviewComplete,
}: InterviewFlowProps) {
  const [currentRound, setCurrentRound] = useState<RoundKey>("hr");
  const [completedRounds, setCompletedRounds] = useState<RoundKey[]>([]);
  const [hrTranscripts, setHrTranscripts] = useState<TextRoundTranscript[]>([]);
  const [evaluationTranscripts, setEvaluationTranscripts] = useState<
    TextRoundTranscript[]
  >([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionData, setTransitionData] = useState<RoundTransition | null>(
    null,
  );

  const { hr, evaluation, oncall } = useMemo(
    () => distributeQuestions(interview.questions),
    [interview.questions],
  );

  const transitionToRound = useCallback(
    (from: RoundKey, to: RoundKey) => {
      const key = `${from}-to-${to}`;
      const transition = ROUND_TRANSITIONS[key];
      if (transition) {
        setIsTransitioning(true);
        setTransitionData(transition);
        setCompletedRounds((prev) => [...prev, from]);

        setTimeout(() => {
          setIsTransitioning(false);
          setTransitionData(null);
          setCurrentRound(to);
        }, 2500);
      }
    },
    [],
  );

  const handleHRComplete = useCallback(
    (transcripts: TextRoundTranscript[]) => {
      setHrTranscripts(transcripts);
      transitionToRound("hr", "evaluation");
    },
    [transitionToRound],
  );

  const handleEvaluationComplete = useCallback(
    (transcripts: TextRoundTranscript[]) => {
      setEvaluationTranscripts(transcripts);
      transitionToRound("evaluation", "oncall");
    },
    [transitionToRound],
  );

  const handleOnCallComplete = useCallback(
    (callId: string) => {
      setCompletedRounds((prev) => [...prev, "oncall"]);
      onInterviewComplete({
        hrTranscripts,
        evaluationTranscripts,
        onCallId: callId,
      });
    },
    [hrTranscripts, evaluationTranscripts, onInterviewComplete],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Stepper */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <RoundStepper
          currentRound={currentRound}
          completedRounds={completedRounds}
          themeColor={interview.theme_color || "#4F46E5"}
        />
      </div>

      {/* Transition overlay */}
      {isTransitioning && transitionData && (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl animate-bounce"
            style={{
              backgroundColor: `${interview.theme_color || "#4F46E5"}15`,
            }}
          >
            {transitionData.icon}
          </div>
          <p className="text-xl font-bold text-gray-800 mb-2">
            {transitionData.message}
          </p>
          <div className="flex gap-1 mt-4">
            <span
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: interview.theme_color || "#4F46E5",
                animationDelay: "0ms",
              }}
            />
            <span
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: interview.theme_color || "#4F46E5",
                animationDelay: "150ms",
              }}
            />
            <span
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: interview.theme_color || "#4F46E5",
                animationDelay: "300ms",
              }}
            />
          </div>
        </div>
      )}

      {/* Round content */}
      {!isTransitioning && (
        <div className="flex-1 overflow-y-auto">
          {currentRound === "hr" && (
            <TextRound
              roundLabel="HR Round"
              roundIcon="👤"
              questions={hr}
              themeColor={interview.theme_color || "#4F46E5"}
              onRoundComplete={handleHRComplete}
            />
          )}
          {currentRound === "evaluation" && (
            <TextRound
              roundLabel="Evaluation Round"
              roundIcon="📋"
              questions={evaluation}
              themeColor={interview.theme_color || "#4F46E5"}
              onRoundComplete={handleEvaluationComplete}
            />
          )}
          {currentRound === "oncall" && (
            <OnCallRound
              interview={interview}
              userName={userName}
              onRoundComplete={handleOnCallComplete}
            />
          )}
        </div>
      )}
    </div>
  );
}
