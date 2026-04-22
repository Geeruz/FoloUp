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
  UploadIcon,
} from "lucide-react";
import { parsePdf } from "@/actions/parse-pdf";
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
  const [resumeText, setResumeText] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setIsParsingResume(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await parsePdf(formData);
        if (result?.success && result.text) {
          setResumeText(result.text);
          toast.success("Resume parsed successfully!");
        } else {
          toast.error("Failed to parse resume.");
          setResumeFile(null);
        }
      } catch (error) {
        toast.error("An error occurred while uploading. Please try again.");
        setResumeFile(null);
      } finally {
        setIsParsingResume(false);
      }
    }
  };

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
      details: {
        hr_transcript: hrTranscripts,
        evaluation_transcript: evaluationTranscripts,
      },
    });

    setIsEnded(true);
  };

  const progressPercent = isEnded
    ? 100
    : (Number(currentTimeDuration) /
        (Number(interviewTimeDuration) * 60)) *
      100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {isStarted && <TabSwitchWarning />}
      <div className="relative mx-auto flex w-full max-w-7xl justify-center px-4 py-8">
        <Card className="w-full rounded-[2rem] border border-slate-200 bg-white shadow-lg">
          <div className="flex flex-col">
            {/* Progress bar */}
            <div className="m-4 rounded-[1.5rem] border border-slate-200 bg-slate-100 p-3 shadow-sm">
              <div
                className="h-3 rounded-full bg-slate-200 transition-all duration-300"
                style={{
                  width: `${Math.min(progressPercent, 100)}%`,
                  backgroundColor: interview.theme_color || "#4F46E5",
                }}
              />
            </div>

            {/* Interview header */}
            <CardHeader className="flex flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200">
              {!isEnded && (
                <CardTitle className="text-3xl font-semibold tracking-tight text-slate-900">
                  {interview?.name}
                </CardTitle>
              )}
              {!isEnded && (
                <div className="rounded-3xl bg-sky-50 px-4 py-3 shadow-sm border border-sky-200">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <AlarmClockIcon className="h-5 w-5 text-sky-600" />
                    <span>
                      Expected duration: <span className="font-semibold text-slate-900">{interviewTimeDuration} mins</span>
                    </span>
                  </div>
                </div>
              )}
            </CardHeader>

            {/* Pre-start form */}
            {!isStarted && !isEnded && !isOldUser && (
              <div className="mx-auto w-full max-w-3xl rounded-[1.5rem] border border-slate-200 bg-slate-50 p-8 shadow-md my-6">
                <div className="space-y-8">
                  {interview?.logo_url && (
                    <div className="flex justify-center">
                      <Image
                        src={interview?.logo_url}
                        alt="Logo"
                        className="h-16 w-auto rounded-3xl bg-white p-3 border border-slate-200"
                        width={100}
                        height={100}
                      />
                    </div>
                  )}

                  <div className="space-y-4 text-sm leading-7 text-slate-600">
                    <p>{interview?.description}</p>
                    <div className="rounded-3xl border border-sky-200 bg-sky-50 p-5 text-slate-700 shadow-sm">
                      <p className="font-semibold text-slate-900">Interview Format</p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        <li>• HR Round — Text-based questions</li>
                        <li>• Evaluation Round — Technical assessment</li>
                        <li>• On Call Round — Live AI conversation</li>
                      </ul>
                      <p className="mt-4 text-slate-500">Note: Tab switching is monitored during the session.</p>
                    </div>
                  </div>

                  {!interview?.is_anonymous && (
                    <div className="grid gap-4">
                      <input
                        value={email}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                        placeholder="Enter your email address"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <input
                        value={name}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                        placeholder="Enter your first name"
                        onChange={(e) => setName(e.target.value)}
                      />
                      <label className="flex cursor-pointer flex-col gap-3 rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-600 shadow-sm transition hover:border-sky-500 hover:text-slate-900">
                        <div className="flex items-center gap-3">
                          {isParsingResume ? <MiniLoader /> : <UploadIcon className="w-4 h-4" />}
                          <span className="font-medium">
                            {isParsingResume ? "Parsing..." : resumeFile ? resumeFile.name : "Upload Resume (Optional)"}
                          </span>
                        </div>
                        <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} disabled={isParsingResume} />
                      </label>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      className="min-w-[10rem] rounded-2xl px-6 text-white"
                      style={{
                        backgroundColor: interview.theme_color ?? "#4F46E5",
                        color: isLightColor(interview.theme_color ?? "#4F46E5") ? "black" : "white",
                      }}
                      disabled={
                        Loading ||
                        isParsingResume ||
                        (!interview?.is_anonymous && (!isValidEmail || !name))
                      }
                      onClick={startInterview}
                    >
                      {!Loading ? "Start Interview" : <MiniLoader />}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="min-w-[8rem] rounded-2xl px-6 text-slate-900 border-slate-300 hover:bg-slate-50"
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
                            className="bg-sky-600 hover:bg-sky-700 text-white"
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
              </div>
            )}

            {/* Interview Flow (3 rounds) */}
            {isStarted && !isEnded && !isOldUser && (
              <InterviewFlow
                interview={interview}
                userName={name}
                userEmail={email}
                resumeText={resumeText}
                onInterviewComplete={handleInterviewComplete}
              />
            )}

            {/* End screen */}
            {isEnded && !isOldUser && (
              <div className="w-full max-w-[450px] mx-auto my-8 border border-sky-200 rounded-2xl p-8 bg-sky-50 shadow-md">
                <div>
                  <div className="font-normal text-base mb-6">
                    <CheckCircleIcon className="h-12 w-12 mx-auto my-4 text-sky-600" />
                    <p className="text-lg font-semibold text-center text-slate-900">
                      {isStarted
                        ? "Thank you for taking the time to participate in this interview"
                        : "Thank you very much for considering."}
                    </p>
                    <p className="text-center text-slate-700 mt-3">
                      You can close this tab now.
                    </p>
                  </div>

                  {!isFeedbackSubmitted && (
                    <AlertDialog
                      open={isDialogOpen}
                      onOpenChange={setIsDialogOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <div className="w-full flex justify-center mt-4">
                          <Button
                            className="bg-sky-600 text-white h-10 hover:bg-sky-700"
                            onClick={() => setIsDialogOpen(true)}
                          >
                            Provide Feedback
                          </Button>
                        </div>
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
              <div className="w-full max-w-[450px] mx-auto my-8 border border-amber-200 rounded-2xl p-8 bg-amber-50 shadow-md">
                <div>
                  <div className="font-normal text-base">
                    <CheckCircleIcon className="h-12 w-12 mx-auto my-4 text-amber-600" />
                    <p className="text-lg font-semibold text-center text-slate-900">
                      You have already completed this interview or you
                      are not eligible to participate. Thank you!
                    </p>
                    <p className="text-center text-slate-700 mt-3">
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
