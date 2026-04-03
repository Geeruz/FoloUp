"use client";

import React from "react";

type RoundKey = "hr" | "evaluation" | "oncall";

interface RoundStepperProps {
  currentRound: RoundKey;
  completedRounds: RoundKey[];
  themeColor?: string;
}

const ROUNDS: { key: RoundKey; label: string; icon: string }[] = [
  { key: "hr", label: "HR Round", icon: "👤" },
  { key: "evaluation", label: "Evaluation", icon: "📋" },
  { key: "oncall", label: "On Call", icon: "📞" },
];

export default function RoundStepper({
  currentRound,
  completedRounds,
  themeColor = "#4F46E5",
}: RoundStepperProps) {
  const currentIndex = ROUNDS.findIndex((r) => r.key === currentRound);

  return (
    <div className="flex items-center justify-center w-full px-4 py-3">
      {ROUNDS.map((round, index) => {
        const isCompleted = completedRounds.includes(round.key);
        const isCurrent = round.key === currentRound;
        const isPending = !isCompleted && !isCurrent;

        return (
          <React.Fragment key={round.key}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center relative">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg
                  transition-all duration-500 ease-out
                  ${
                    isCompleted
                      ? "text-white shadow-lg"
                      : isCurrent
                        ? "text-white shadow-xl ring-4 ring-opacity-30 animate-pulse"
                        : "bg-gray-200 text-gray-400"
                  }
                `}
                style={{
                  backgroundColor: isCompleted || isCurrent ? themeColor : undefined,
                  boxShadow: isCurrent ? `0 0 20px ${themeColor}40` : undefined,
                }}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span>{round.icon}</span>
                )}
              </div>
              <span
                className={`
                  mt-1.5 text-xs font-semibold whitespace-nowrap
                  transition-colors duration-300
                  ${isCompleted || isCurrent ? "text-gray-800" : "text-gray-400"}
                `}
              >
                {round.label}
              </span>
            </div>

            {/* Connector line */}
            {index < ROUNDS.length - 1 && (
              <div className="flex-1 mx-3 mt-[-14px]">
                <div className="h-[3px] rounded-full bg-gray-200 relative overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      backgroundColor: themeColor,
                      width:
                        index < currentIndex
                          ? "100%"
                          : index === currentIndex
                            ? "50%"
                            : "0%",
                    }}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
