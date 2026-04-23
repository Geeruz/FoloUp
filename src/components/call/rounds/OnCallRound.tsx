"use client";

import type { Interview } from "@/types/interview";
import { RetellWebClient } from "retell-client-js-sdk";
import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { TextRoundTranscript } from "./TextRound";
import axios from "axios";
import { XCircleIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
import MiniLoader from "../../loaders/mini-loader/miniLoader";
import { InterviewerService } from "@/services/interviewers.service";

type registerCallResponseType = {
  data: {
    registerCallResponse: {
      call_id: string;
      access_token: string;
    };
  };
};

type transcriptType = {
  role: string;
  content: string;
};

interface OnCallRoundProps {
  interview: Interview;
  userName: string;
  hrTranscripts?: TextRoundTranscript[];
  evaluationTranscripts?: TextRoundTranscript[];
  resumeText?: string;
  onRoundComplete: (callId: string) => void;
}

export default function OnCallRound({
  interview,
  userName,
  hrTranscripts,
  evaluationTranscripts,
  resumeText,
  onRoundComplete,
}: OnCallRoundProps) {
  const webClientRef = useRef<RetellWebClient | null>(null);
  const [lastInterviewerResponse, setLastInterviewerResponse] = useState("");
  const [lastUserResponse, setLastUserResponse] = useState("");
  const [activeTurn, setActiveTurn] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const [interviewerImg, setInterviewerImg] = useState("");
  const [callId, setCallId] = useState("");

  const lastUserResponseRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll user response
  useEffect(() => {
    if (lastUserResponseRef.current) {
      lastUserResponseRef.current.scrollTop =
        lastUserResponseRef.current.scrollHeight;
    }
  }, [lastUserResponse]);

  // Fetch interviewer image
  useEffect(() => {
    const fetchInterviewer = async () => {
      const interviewer = await InterviewerService.getInterviewer(
        interview.interviewer_id,
      );
      setInterviewerImg(interviewer.image);
    };
    fetchInterviewer();
  }, [interview.interviewer_id]);

  // Initialize Retell and start the call
  useEffect(() => {
    const webClient = new RetellWebClient();
    webClientRef.current = webClient;
    let cancelled = false;

    webClient.on("call_started", () => {
      if (cancelled) return;
      console.log("On Call round: Call started");
      setIsCalling(true);
      setIsConnecting(false);
    });

    webClient.on("call_ended", () => {
      if (cancelled) return;
      console.log("On Call round: Call ended");
      setIsCalling(false);
      setIsEnded(true);
    });

    webClient.on("agent_start_talking", () => {
      if (!cancelled) setActiveTurn("agent");
    });

    webClient.on("agent_stop_talking", () => {
      if (!cancelled) setActiveTurn("user");
    });

    webClient.on("error", (error) => {
      if (cancelled) return;
      console.error("On Call round error:", error);
      webClient.stopCall();
      setIsEnded(true);
      setIsCalling(false);
      setIsConnecting(false);
    });

    webClient.on("update", (update) => {
      if (cancelled) return;
      if (update.transcript) {
        const transcripts: transcriptType[] = update.transcript;
        const roleContents: { [key: string]: string } = {};

        for (const transcript of transcripts) {
          roleContents[transcript?.role] = transcript?.content;
        }

        setLastInterviewerResponse(roleContents.agent);
        setLastUserResponse(roleContents.user);
      }
    });

    // Auto-start the call
    const startCall = async () => {
      const onCallQuestions = interview.questions
        .filter((q) => !q.round || q.round === "oncall")
        .map((q) => q.question)
        .join(", ");

      const data = {
        mins: interview.time_duration,
        objective: interview.objective,
        questions:
          onCallQuestions ||
          interview.questions.map((q) => q.question).join(", "),
        name: userName || "not provided",
        resume: resumeText || "No resume provided",
        previous_answers: `HR Round Answers:\n${
          hrTranscripts?.map((t) => `Q: ${t.question}\nA: ${t.answer}`).join("\n\n") || "None"
        }\n\nEvaluation Round Answers:\n${
          evaluationTranscripts?.map((t) => `Q: ${t.question}\nA: ${t.answer}`).join("\n\n") || "None"
        }`
      };

      try {
        if (cancelled) return;

        const registerCallResponse: registerCallResponseType =
          await axios.post("/api/register-call", {
            dynamic_data: data,
            interviewer_id: interview.interviewer_id,
          });

        if (cancelled) return;

        if (registerCallResponse.data.registerCallResponse.access_token) {
          setCallId(registerCallResponse.data.registerCallResponse.call_id);
          await webClient
            .startCall({
              accessToken:
                registerCallResponse.data.registerCallResponse.access_token,
            })
            .catch(console.error);
        } else {
          console.log("Failed to register call");
          if (!cancelled) setIsConnecting(false);
        }
      } catch (error) {
        console.error("Failed to start On Call round:", error);
        if (!cancelled) setIsConnecting(false);
      }
    };

    startCall();

    return () => {
      cancelled = true;
      webClient.removeAllListeners();
      try {
        webClient.stopCall();
      } catch (_e) {
        // ignore — call may not be active
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify parent when call ends
  useEffect(() => {
    if (isEnded && callId) {
      onRoundComplete(callId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnded, callId]);

  const handleEndCall = useCallback(() => {
    if (webClientRef.current) {
      webClientRef.current.stopCall();
    }
    setIsEnded(true);
    setIsCalling(false);
  }, []);

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-slate-200 border-t-sky-600 animate-spin" />
        </div>
        <p className="mt-6 text-lg font-semibold text-slate-900">
          Connecting to AI Interviewer...
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Please ensure your microphone is enabled
        </p>
      </div>
    );
  }

  if (isEnded) {
    return null; // Parent handles the end state
  }

  return (
    <div className="flex flex-col h-full px-6 py-6">
      {/* Round header */}
      <div className="flex items-center justify-center gap-2 mb-6 pb-4 border-b border-slate-200">
        <span className="text-2xl">📞</span>
        <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          On Call Round
        </span>
        {isCalling && (
          <span className="flex items-center gap-1 ml-2 px-3 py-1 bg-green-100 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-700">Live</span>
          </span>
        )}
      </div>

      {/* Call content */}
      <div className="flex flex-row gap-6 flex-1 overflow-hidden">
        {/* Interviewer side */}
        <div className="flex-1 border-r border-slate-200 flex flex-col">
          <div className="flex flex-col justify-between h-full">
            <div className="text-lg md:text-xl font-normal leading-relaxed min-h-[140px] outline-none text-slate-900 py-4">
              {lastInterviewerResponse || <span className="text-slate-400 italic">Listening...</span>}
            </div>
            <div className="flex flex-col justify-center items-center gap-3">
              {interviewerImg && (
                <Image
                  src={interviewerImg}
                  alt="Interviewer"
                  width={100}
                  height={100}
                  className={`object-cover object-center rounded-full ${
                    activeTurn === "agent"
                      ? `border-4`
                      : "border-2 border-slate-200"
                  }`}
                  style={
                    activeTurn === "agent"
                      ? { borderColor: interview.theme_color }
                      : undefined
                  }
                />
              )}
              <div className="font-semibold text-slate-900">Interviewer</div>
            </div>
          </div>
        </div>

        {/* User side */}
        <div className="flex-1 flex flex-col">
          <div
            ref={lastUserResponseRef}
            className="text-lg md:text-xl font-normal leading-relaxed min-h-[140px] py-4 overflow-y-auto text-slate-900"
          >
            {lastUserResponse || <span className="text-slate-400 italic">You are listening...</span>}
          </div>
          <div className="flex flex-col justify-center items-center gap-3">
            <Image
              src="/user-icon.png"
              alt="You"
              width={100}
              height={100}
              className={`object-cover object-center rounded-full ${
                activeTurn === "user"
                  ? `border-4`
                  : "border-2 border-slate-200"
              }`}
              style={
                activeTurn === "user"
                  ? { borderColor: interview.theme_color }
                  : undefined
              }
            />
            <div className="font-semibold text-slate-900">You</div>
          </div>
        </div>
      </div>

      {/* End call button */}
      <div className="mt-6 flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger className="w-full">
            <Button
              className="bg-white text-slate-900 border border-red-300 hover:bg-red-50 h-10 mx-auto flex flex-row justify-center"
              disabled={!isCalling}
            >
              End Interview{" "}
              <XCircleIcon className="h-5 w-5 ml-2 text-red-500" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will end the interview.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-sky-600 hover:bg-sky-700 text-white"
                onClick={handleEndCall}
              >
                End Interview
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
