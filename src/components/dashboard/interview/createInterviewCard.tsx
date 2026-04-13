"use client";

import Modal from "@/components/dashboard/Modal";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React, { useState } from "react";

function CreateInterviewCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="flex h-72 w-full cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-700 transition hover:-translate-y-1 hover:shadow-xl"
        onClick={() => setOpen(true)}
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-100 text-sky-600 shadow-md">
          <Plus size={36} />
        </div>
        <CardTitle className="text-lg font-semibold text-slate-950 text-center">Create a new interview</CardTitle>
        <p className="mt-3 text-sm leading-6 text-slate-500 text-center">
          Start a fresh interview workflow with candidate questions and evaluation rounds.
        </p>
      </Card>
      <Modal open={open} closeOnOutsideClick={false} onClose={() => setOpen(false)}>
        <CreateInterviewModal open={open} setOpen={setOpen} />
      </Modal>
    </>
  );
}

export default CreateInterviewCard;
