"use client";

import Modal from "@/components/dashboard/Modal";
import CreateInterviewCard from "@/components/dashboard/interview/createInterviewCard";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useInterviews } from "@/contexts/interviews.context";
import { useInterviewers } from "@/contexts/interviewers.context";
import { ClientService } from "@/services/clients.service";
import { InterviewService } from "@/services/interviews.service";
import { ResponseService } from "@/services/responses.service";
import { useOrganization } from "@clerk/nextjs";
import { Gem, Plus } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { interviewers } = useInterviewers();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [allowedResponsesCount, setAllowedResponsesCount] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  function InterviewsLoader() {
    return (
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-60 rounded-[1.75rem] bg-slate-100 p-6 shadow-sm animate-pulse" />
        ))}
      </div>
    );
  }

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          const data = await ClientService.getOrganizationById(organization.id);
          if (data?.plan) {
            setCurrentPlan(data.plan);
            if (data.plan === "free_trial_over") {
              setIsModalOpen(true);
            }
          }
          if (data?.allowed_responses_count) {
            setAllowedResponsesCount(data.allowed_responses_count);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganizationData();
  }, [organization]);

  useEffect(() => {
    const fetchResponsesCount = async () => {
      if (!organization || currentPlan !== "free") {
        return;
      }

      setLoading(true);
      try {
        const totalResponses = await ResponseService.getResponseCountByOrganizationId(
          organization.id,
        );
        const hasExceededLimit = totalResponses >= allowedResponsesCount;
        if (hasExceededLimit) {
          setCurrentPlan("free_trial_over");
          await InterviewService.deactivateInterviewsByOrgId(organization.id);
          await ClientService.updateOrganization({ plan: "free_trial_over" }, organization.id);
        }
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponsesCount();
  }, [organization, currentPlan, allowedResponsesCount]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-32 text-black">
      <section className="grid gap-16 p-4 md:p-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div className="space-y-6">
            <p className="text-sm font-bold uppercase tracking-[0.5em] text-black">Dashboard</p>
            <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-black uppercase leading-none">Overview</h1>
            <p className="max-w-2xl text-xl font-medium leading-relaxed text-gray-800">
              Manage interviews, track candidates, and review performance — all in one place.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="border-b-8 border-black pb-6">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Active Interviews</p>
                <p className="mt-2 text-7xl font-black">{interviews.length}</p>
            </div>
            <div className="border-b-8 border-black pb-6">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Interviewers</p>
                <p className="mt-2 text-7xl font-black">{interviewers.length}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-16 xl:grid-cols-[0.7fr_0.3fr]">
          <div className="space-y-12">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tight text-black">Interviews</h2>
                </div>
                <button suppressHydrationWarning className="inline-flex items-center justify-center gap-3 bg-black px-8 py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition-transform hover:-translate-y-1 hover:shadow-2xl">
                  <Plus className="h-6 w-6 stroke-[3]" />
                  New Interview
                </button>
              </div>
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {currentPlan === "free_trial_over" ? (
                  <div className="col-span-full border-4 border-dashed border-black py-16 text-center">
                      <Plus size={80} className="mx-auto text-black mb-6" />
                      <h3 className="text-2xl font-black uppercase text-black">
                        Upgrade your plan to create more interviews
                      </h3>
                  </div>
                ) : (
                  <CreateInterviewCard />
                )}

                {interviewsLoading || loading ? (
                  <InterviewsLoader />
                ) : (
                  interviews.map((item) => (
                    <InterviewCard
                      id={item.id}
                      interviewerId={item.interviewer_id}
                      key={item.id}
                      name={item.name}
                      url={item.url ?? ""}
                      readableSlug={item.readable_slug}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between gap-4 border-b-4 border-black pb-4">
                <h2 className="text-3xl font-black uppercase text-black">Analytics</h2>
                <div className="bg-black px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-white">
                  {currentPlan || "Free"}
                </div>
              </div>
              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <div className="border-l-8 border-black pl-6 py-2">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Total Interviews</p>
                  <p className="mt-2 text-5xl font-black text-black">{interviews.length}</p>
                </div>
                <div className="border-l-8 border-black pl-6 py-2">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Pending Reviews</p>
                  <p className="mt-2 text-5xl font-black text-black">{interviews.filter((item) => !item.is_active).length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 xl:border-l-4 xl:border-black xl:pl-12">
              <div>
                <h3 className="text-3xl font-black uppercase text-black border-b-4 border-black pb-4 mb-8">Quick Actions</h3>
                <div className="space-y-8 text-black">
                  <p className="text-xl font-bold leading-relaxed">Stay focused. Review candidates. Make better hiring decisions, faster.</p>
                  <div className="grid gap-8">
                    <div className="border-l-8 border-gray-300 pl-6 py-2">
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Up Next</p>
                      <p className="mt-2 text-2xl font-black">Review responses</p>
                    </div>
                    <div className="border-l-8 border-gray-300 pl-6 py-2">
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Tip</p>
                      <p className="mt-2 text-lg font-bold text-gray-800">Use candidate feedback to continuously improve your interview process.</p>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="space-y-5 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600">
              <Gem size={32} />
            </div>
            <h3 className="text-2xl font-semibold text-slate-950">Upgrade to Pro</h3>
            <p className="mx-auto max-w-xl text-slate-600">
              You have reached your limit for the free trial. Upgrade today to keep hiring without interruptions.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200 p-5 text-left">
                <h4 className="text-lg font-semibold text-slate-950">Free Plan</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>10 Responses</li>
                  <li>Basic Support</li>
                  <li>Core features</li>
                </ul>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-sky-50 p-5 text-left">
                <h4 className="text-lg font-semibold text-slate-950">Pro Plan</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>Flexible response credits</li>
                  <li>Priority support</li>
                  <li>Unlimited interviews</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Contact <span className="font-semibold text-slate-900">founders@pinestacks.com</span> for a custom plan.
            </p>
          </div>
        </Modal>
      )}
    </main>
  );
}

export default Interviews;
