"use client";

import { FeedbackForm } from "@/components/call/feedbackForm";
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
} from "@/components/ui/alert-dialog";
import { useResponses } from "@/contexts/responses.context";
import { isLightColor, testEmail } from "@/lib/utils";
import { FeedbackService } from "@/services/feedback.service";
import { ResponseService } from "@/services/responses.service";
import type { Interview } from "@/types/interview";
import type { FeedbackData } from "@/types/response";
import {
  AlarmClockIcon,
  ArrowUpRightSquareIcon,
  CheckCircleIcon,
} from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import MiniLoader from "../loaders/mini-loader/miniLoader";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle } from "../ui/card";
import {
  TabSwitchWarning,
  useTabSwitchPrevention,
} from "./tabSwitchPrevention";
import InterviewFlow, {
  type InterviewFlowResult,
} from "./InterviewFlow";

type InterviewProps = {
  interview: Interview;
};

function Call({ interview }: InterviewProps) {
  const { createResponse } = useResponses();
  const [Loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isOldUser, setIsOldUser] = useState<boolean>(false);
  const [callId, setCallId] = useState<string>("");
  const { tabSwitchCount } = useTabSwitchPrevention();
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interviewTimeDuration, setInterviewTimeDuration] =
    useState<string>("1");
  const [time, setTime] = useState(0);
  const [currentTimeDuration, setCurrentTimeDuration] =
    useState<string>("0");

  const handleFeedbackSubmit = async (
    formData: Omit<FeedbackData, "interview_id">,
  ) => {
    try {
      const result = await FeedbackService.submitFeedback({
        ...formData,
        interview_id: interview.id,
      });

      if (result) {
        toast.success("Thank you for your feedback!");
        setIsFeedbackSubmitted(true);
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  // Timer - shared across all rounds
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    let intervalId: any;
    if (isStarted && !isEnded) {
      intervalId = setInterval(() => setTime((t) => t + 1), 10);
    }
    setCurrentTimeDuration(String(Math.floor(time / 100)));

    return () => clearInterval(intervalId);
  }, [isStarted, isEnded, time]);

  useEffect(() => {
    if (testEmail(email)) {
      setIsValidEmail(true);
    }
  }, [email]);

  useEffect(() => {
    if (interview?.time_duration) {
      setInterviewTimeDuration(interview?.time_duration);
    }
  }, [interview]);

  // Save response when interview ends
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isEnded && callId) {
      const updateInterview = async () => {
        await ResponseService.saveResponse(
          { is_ended: true, tab_switch_count: tabSwitchCount },
          callId,
        );
      };
      updateInterview();
    }
  }, [isEnded, callId]);

  const onEndCallClick = async () => {
    setIsEnded(true);
  };

  const startInterview = async () => {
    setLoading(true);

    const oldUserEmails: string[] = (
      await ResponseService.getAllEmails(interview.id)
    ).map((item) => item.email);
    const OldUser =
      oldUserEmails.includes(email) ||
      (interview?.respondents && !interview?.respondents.includes(email));

    if (OldUser) {
      setIsOldUser(true);
    } else {
      setIsStarted(true);
    }

    setLoading(false);
  };

  const handleInterviewComplete = async (result: InterviewFlowResult) => {
    const { hrTranscripts, evaluationTranscripts, onCallId } = result;

    setCallId(onCallId);

    // Create the response record with all round data
    await createResponse({
      interview_id: interview.id,
      call_id: onCallId,
      email: email,
      name: name,
      hr_transcript: hrTranscripts,
      evaluation_transcript: evaluationTranscripts,
    });

    setIsEnded(true);
  };

  const progressPercent = isEnded
    ? 100
    : (Number(currentTimeDuration) /
        (Number(interviewTimeDuration) * 60)) *
      100;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {isStarted && <TabSwitchWarning />}
      <div className="bg-white rounded-md md:w-[80%] w-[90%]">
        <Card className="h-[88vh] rounded-lg border-2 border-b-4 border-r-4 border-black text-xl font-bold transition-all md:block dark:border-white">
          <div className="flex flex-col h-full">
            {/* Progress bar */}
            <div className="m-4 h-[15px] rounded-lg border-[1px] border-black">
              <div
                className="bg-indigo-600 h-[15px] rounded-lg transition-all duration-300"
                style={{
                  width: `${Math.min(progressPercent, 100)}%`,
                  backgroundColor: interview.theme_color || "#4F46E5",
                }}
              />
            </div>

            {/* Interview header */}
            <CardHeader className="items-center p-1">
              {!isEnded && (
                <CardTitle className="flex flex-row items-center text-lg md:text-xl font-bold mb-2">
                  {interview?.name}
                </CardTitle>
              )}
              {!isEnded && (
                <div className="flex mt-2 flex-row">
                  <AlarmClockIcon
                    className="h-[1rem] w-[1rem] rotate-0 scale-100 dark:-rotate-90 dark:scale-0 mr-2 font-bold"
                    style={{ color: interview.theme_color }}
                  />
                  <div className="text-sm font-normal">
                    Expected duration:{" "}
                    <span
                      className="font-bold"
                      style={{ color: interview.theme_color }}
                    >
                      {interviewTimeDuration} mins{" "}
                    </span>
                    or less
                  </div>
                </div>
              )}
            </CardHeader>

            {/* Pre-start form */}
            {!isStarted && !isEnded && !isOldUser && (
              <div className="w-fit min-w-[400px] max-w-[400px] mx-auto mt-2 border border-indigo-200 rounded-md p-2 m-2 bg-slate-50">
                <div>
                  {interview?.logo_url && (
                    <div className="p-1 flex justify-center">
                      <Image
                        src={interview?.logo_url}
                        alt="Logo"
                        className="h-10 w-auto"
                        width={100}
                        height={100}
                      />
                    </div>
                  )}
                  <div className="p-2 font-normal text-sm mb-4 whitespace-pre-line">
                    {interview?.description}
                    <p className="font-bold text-sm">
                      {"\n"}Ensure your volume is up and grant microphone
                      access when prompted. Additionally, please make sure
                      you are in a quiet environment.
                      {"\n\n"}This interview consists of 3 rounds:
                      {"\n"}• HR Round — Text-based questions
                      {"\n"}• Evaluation Round — Technical assessment
                      {"\n"}• On Call Round — Live AI conversation
                      {"\n\n"}Note: Tab switching will be recorded.
                    </p>
                  </div>
                  {!interview?.is_anonymous && (
                    <div className="flex flex-col gap-2 justify-center">
                      <div className="flex justify-center">
                        <input
                          value={email}
                          className="h-fit mx-auto py-2 border-2 rounded-md w-[75%] self-center px-2 border-gray-400 text-sm font-normal"
                          placeholder="Enter your email address"
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-center">
                        <input
                          value={name}
                          className="h-fit mb-4 mx-auto py-2 border-2 rounded-md w-[75%] self-center px-2 border-gray-400 text-sm font-normal"
                          placeholder="Enter your first name"
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-[80%] flex flex-row mx-auto justify-center items-center align-middle">
                  <Button
                    className="min-w-20 h-10 rounded-lg flex flex-row justify-center mb-8"
                    style={{
                      backgroundColor:
                        interview.theme_color ?? "#4F46E5",
                      color: isLightColor(
                        interview.theme_color ?? "#4F46E5",
                      )
                        ? "black"
                        : "white",
                    }}
                    disabled={
                      Loading ||
                      (!interview?.is_anonymous &&
                        (!isValidEmail || !name))
                    }
                    onClick={startInterview}
                  >
                    {!Loading ? "Start Interview" : <MiniLoader />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button
                        className="bg-white border ml-2 text-black min-w-15 h-10 rounded-lg flex flex-row justify-center mb-8"
                        style={{
                          borderColor: interview.theme_color,
                        }}
                        disabled={Loading}
                      >
                        Exit
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-indigo-600 hover:bg-indigo-800"
                          onClick={async () => {
                            await onEndCallClick();
                          }}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {/* Interview Flow (3 rounds) */}
            {isStarted && !isEnded && !isOldUser && (
              <InterviewFlow
                interview={interview}
                userName={name}
                userEmail={email}
                onInterviewComplete={handleInterviewComplete}
              />
            )}

            {/* End screen */}
            {isEnded && !isOldUser && (
              <div className="w-fit min-w-[400px] max-w-[400px] mx-auto mt-2 border border-indigo-200 rounded-md p-2 m-2 bg-slate-50 absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <div>
                  <div className="p-2 font-normal text-base mb-4 whitespace-pre-line">
                    <CheckCircleIcon className="h-[2rem] w-[2rem] mx-auto my-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500" />
                    <p className="text-lg font-semibold text-center">
                      {isStarted
                        ? "Thank you for taking the time to participate in this interview"
                        : "Thank you very much for considering."}
                    </p>
                    <p className="text-center">
                      {"\n"}
                      You can close this tab now.
                    </p>
                  </div>

                  {!isFeedbackSubmitted && (
                    <AlertDialog
                      open={isDialogOpen}
                      onOpenChange={setIsDialogOpen}
                    >
                      <AlertDialogTrigger className="w-full flex justify-center">
                        <Button
                          className="bg-indigo-600 text-white h-10 mt-4 mb-4"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          Provide Feedback
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <FeedbackForm
                          email={email}
                          onSubmit={handleFeedbackSubmit}
                        />
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )}

            {/* Old user message */}
            {isOldUser && (
              <div className="w-fit min-w-[400px] max-w-[400px] mx-auto mt-2 border border-indigo-200 rounded-md p-2 m-2 bg-slate-50 absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <div>
                  <div className="p-2 font-normal text-base mb-4 whitespace-pre-line">
                    <CheckCircleIcon className="h-[2rem] w-[2rem] mx-auto my-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500" />
                    <p className="text-lg font-semibold text-center">
                      You have already responded in this interview or you
                      are not eligible to respond. Thank you!
                    </p>
                    <p className="text-center">
                      {"\n"}
                      You can close this tab now.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
        <a
          className="flex flex-row justify-center align-middle mt-3"
          href="https://pinestacks.com/"
          target="_blank"
          rel="noreferrer"
        >
          <div className="text-center text-md font-semibold mr-2">
            Powered by{" "}
            <span className="font-bold">Provly</span>
          </div>
          <ArrowUpRightSquareIcon className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500" />
        </a>
      </div>
    </div>
  );
}

export default Call;
