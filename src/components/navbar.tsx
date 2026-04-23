import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

function Navbar() {
  return (
    <div className="fixed inset-x-0 top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl py-5 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-violet-500 text-white shadow-lg shadow-sky-500/20">
            <span className="text-lg font-bold">P</span>
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-950">Provly</p>
            <p className="text-sm text-slate-500">Interview Intelligence Platform</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 md:block">
            AI-powered talent intelligence
          </div>
          <div className="rounded-full bg-slate-100 p-1 shadow-sm">
            <OrganizationSwitcher
              afterCreateOrganizationUrl="/dashboard"
              hidePersonal={true}
              afterSelectOrganizationUrl="/dashboard"
              afterLeaveOrganizationUrl="/dashboard"
              appearance={{
                variables: {
                  fontSize: "0.9rem",
                },
              }}
            />
          </div>
          <div className="rounded-full bg-slate-100 p-1 shadow-sm">
            <UserButton afterSignOutUrl="/sign-in" signInUrl="/sign-in" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
