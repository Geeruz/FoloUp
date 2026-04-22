"use client";

import CreateInterviewerButton from "@/components/dashboard/interviewer/createInterviewerButton";
import InterviewerCard from "@/components/dashboard/interviewer/interviewerCard";
import { useInterviewers } from "@/contexts/interviewers.context";
import { ChevronLeft } from "lucide-react";
import { ChevronRight } from "lucide-react";
import React from "react";

function Interviewers() {
  const { interviewers, interviewersLoading } = useInterviewers();

  const slideLeft = () => {
    const slider = document.getElementById("slider");
    if (slider) {
      slider.scrollLeft = slider.scrollLeft - 190;
    }
  };

  const slideRight = () => {
    const slider = document.getElementById("slider");
    if (slider) {
      slider.scrollLeft = slider.scrollLeft + 190;
    }
  };

  function InterviewersLoader() {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full">
        <div className="h-48 w-full animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-48 w-full animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-48 w-full animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-48 w-full animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-32 text-black">
      <section className="grid gap-12 p-4 md:p-12">
        <div className="space-y-6">
          <p className="text-sm font-bold uppercase tracking-[0.5em] text-black">Team</p>
          <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-black uppercase leading-none">Interviewers</h1>
          <p className="max-w-2xl text-xl font-medium leading-relaxed text-gray-800">
            Manage interviewer profiles, customize their personas, and assign them to interviews.
          </p>
        </div>
        
        <div className="w-full mt-8">
          {interviewersLoading ? (
            <InterviewersLoader />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <CreateInterviewerButton />
              {interviewers.map((interviewer) => (
                <InterviewerCard key={interviewer.id} interviewer={interviewer} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Interviewers;
