"use client";

import { PlayCircleIcon, SpeechIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-[80px] z-20 h-[calc(100vh-80px)] w-[240px] border-r border-slate-200/70 bg-white/95 px-4 py-6 backdrop-blur-xl">
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] bg-slate-50 px-4 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Navigation</p>
            <p className="mt-3 text-sm font-semibold text-slate-900">Interview Studio</p>
          </div>

          <button
            suppressHydrationWarning
            type="button"
            className={`flex w-full items-center gap-3 rounded-[1.5rem] px-4 py-3 text-left text-sm font-semibold transition ${
              pathname.endsWith("/dashboard") || pathname.includes("/interviews")
                ? "bg-sky-500 text-white shadow-lg"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard")}
          >
            <PlayCircleIcon className="h-5 w-5" />
            <span>Interviews</span>
          </button>

          <button
            suppressHydrationWarning
            type="button"
            className={`flex w-full items-center gap-3 rounded-[1.5rem] px-4 py-3 text-left text-sm font-semibold transition ${
              pathname.endsWith("/interviewers")
                ? "bg-sky-500 text-white shadow-lg"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard/interviewers")}
          >
            <SpeechIcon className="h-5 w-5" />
            <span>Interviewers</span>
          </button>
        </div>

        <div className="rounded-[1.75rem] bg-slate-50 p-4 text-sm text-slate-600 shadow-sm">
          <p className="font-semibold text-slate-900">Pro Tip</p>
          <p className="mt-2 text-xs leading-6">Review interviews, manage your talent pipeline, and streamline your hiring workflow.</p>
        </div>
      </div>
    </aside>
  );
}

export default SideMenu;
