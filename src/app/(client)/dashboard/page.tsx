"use client";

import Modal from "@/components/dashboard/Modal";
import CreateInterviewCard from "@/components/dashboard/interview/createInterviewCard";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useInterviews } from "@/contexts/interviews.context";
import { ClientService } from "@/services/clients.service";
import { InterviewService } from "@/services/interviews.service";
import { ResponseService } from "@/services/responses.service";
import { useOrganization } from "@clerk/nextjs";
import { Gem, Plus } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
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
    <main className="mx-auto max-w-7xl px-6 pb-14 pt-28 text-slate-950">
      <section className="grid gap-8 rounded-[2rem] border border-slate-200/80 bg-white/95 p-8 shadow-[0_35px_120px_rgba(15,23,42,0.08)]">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recruiting hub</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Your interview command center</h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Organize interviews, share links, and manage hiring workflows from a clean, elevated dashboard.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-[1.75rem] bg-slate-950 text-white">
              <CardContent>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Active interviews</p>
                <p className="mt-4 text-3xl font-semibold">{interviews.length}</p>
              </CardContent>
            </Card>
            <Card className="rounded-[1.75rem] bg-slate-950 text-white">
              <CardContent>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Interviewers</p>
                <p className="mt-4 text-3xl font-semibold">{interviews.length > 0 ? interviews[0]?.interviewer_id?.toString() : "—"}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.7fr_0.3fr]">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">Interviews</h2>
                  <p className="text-sm text-slate-500">Your current campaigns at a glance.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/10 transition hover:bg-sky-500">
                  <Plus className="h-4 w-4" />
                  Create interview
                </button>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {currentPlan === "free_trial_over" ? (
                  <Card className="col-span-full rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-100 py-10 text-center">
                    <CardContent>
                      <Plus size={60} className="mx-auto text-slate-400" />
                      <CardTitle className="mt-4 text-lg font-semibold text-slate-900">
                        Upgrade required to create more interviews
                      </CardTitle>
                    </CardContent>
                  </Card>
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

            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">Insights</h2>
                  <p className="text-sm text-slate-500">Quick metrics and plan status.</p>
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                  {currentPlan || "Free"}
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Total interviews</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{interviews.length}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Pending actions</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{interviews.filter((item) => !item.is_active).length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm">
              <CardTitle className="text-xl">Active project</CardTitle>
              <CardContent className="mt-4 space-y-4 text-slate-600">
                <p>Keep your hiring funnel tight with clear candidate tracking and smoother interview experiences.</p>
                <div className="grid gap-3">
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Next interview</p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">Review responses and next steps</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Team note</p>
                    <p className="mt-3 text-sm text-slate-600">Use feedback to improve interview quality and candidate score accuracy.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
