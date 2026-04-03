"use client";

import type { Interview } from "@/types/interview";
import { RetellWebClient } from "retell-client-js-sdk";
import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  onRoundComplete: (callId: string) => void;
}

export default function OnCallRound({
  interview,
  userName,
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

    webClient.on("call_started", () => {
      console.log("On Call round: Call started");
      setIsCalling(true);
      setIsConnecting(false);
    });

    webClient.on("call_ended", () => {
      console.log("On Call round: Call ended");
      setIsCalling(false);
      setIsEnded(true);
    });

    webClient.on("agent_start_talking", () => {
      setActiveTurn("agent");
    });

    webClient.on("agent_stop_talking", () => {
      setActiveTurn("user");
    });

    webClient.on("error", (error) => {
      console.error("On Call round error:", error);
      webClient.stopCall();
      setIsEnded(true);
      setIsCalling(false);
      setIsConnecting(false);
    });

    webClient.on("update", (update) => {
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
      };

      try {
        const registerCallResponse: registerCallResponseType =
          await axios.post("/api/register-call", {
            dynamic_data: data,
            interviewer_id: interview.interviewer_id,
          });

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
          setIsConnecting(false);
        }
      } catch (error) {
        console.error("Failed to start On Call round:", error);
        setIsConnecting(false);
      }
    };

    startCall();

    return () => {
      webClient.removeAllListeners();
      if (isCalling) {
        try {
          webClient.stopCall();
        } catch (_e) {
          // ignore
        }
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
          <div className="w-20 h-20 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin" />
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-700">
          Connecting to AI Interviewer...
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Please ensure your microphone is enabled
        </p>
      </div>
    );
  }

  if (isEnded) {
    return null; // Parent handles the end state
  }

  return (
    <div className="flex flex-col h-full px-2 py-2">
      {/* Round header */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-xl">📞</span>
        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          On Call Round
        </span>
        {isCalling && (
          <span className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-green-100 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-700">Live</span>
          </span>
        )}
      </div>

      {/* Call content */}
      <div className="flex flex-row p-2 grow">
        {/* Interviewer side */}
        <div className="border-x-2 border-grey w-[50%] my-auto min-h-[70%]">
          <div className="flex flex-col justify-evenly">
            <div className="text-[22px] w-[80%] md:text-[26px] mt-4 min-h-[250px] mx-auto px-6">
              {lastInterviewerResponse}
            </div>
            <div className="flex flex-col mx-auto justify-center items-center align-middle">
              {interviewerImg && (
                <Image
                  src={interviewerImg}
                  alt="Image of the interviewer"
                  width={120}
                  height={120}
                  className={`object-cover object-center mx-auto my-auto ${
                    activeTurn === "agent"
                      ? `border-4 rounded-full`
                      : ""
                  }`}
                  style={
                    activeTurn === "agent"
                      ? { borderColor: interview.theme_color }
                      : undefined
                  }
                />
              )}
              <div className="font-semibold">Interviewer</div>
            </div>
          </div>
        </div>

        {/* User side */}
        <div className="flex flex-col justify-evenly w-[50%]">
          <div
            ref={lastUserResponseRef}
            className="text-[22px] w-[80%] md:text-[26px] mt-4 mx-auto h-[250px] px-6 overflow-y-auto"
          >
            {lastUserResponse}
          </div>
          <div className="flex flex-col mx-auto justify-center items-center align-middle">
            <Image
              src="/user-icon.png"
              alt="Picture of the user"
              width={120}
              height={120}
              className={`object-cover object-center mx-auto my-auto ${
                activeTurn === "user"
                  ? `border-4 rounded-full`
                  : ""
              }`}
              style={
                activeTurn === "user"
                  ? { borderColor: interview.theme_color }
                  : undefined
              }
            />
            <div className="font-semibold">You</div>
          </div>
        </div>
      </div>

      {/* End call button */}
      <div className="items-center p-2">
        <AlertDialog>
          <AlertDialogTrigger className="w-full">
            <Button
              className="bg-white text-black border border-indigo-600 h-10 mx-auto flex flex-row justify-center mb-4"
              disabled={!isCalling}
            >
              End Interview{" "}
              <XCircleIcon className="h-[1.5rem] ml-2 w-[1.5rem] rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-red" />
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
                className="bg-indigo-600 hover:bg-indigo-800"
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
