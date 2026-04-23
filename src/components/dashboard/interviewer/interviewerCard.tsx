import Modal from "@/components/dashboard/Modal";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { Interviewer } from "@/types/interviewer";
import Image from "next/image";
import { useState } from "react";

interface Props {
  interviewer: Interviewer;
}

const interviewerCard = ({ interviewer }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="group relative w-full cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-slate-950 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-0">
          <div className="h-40 overflow-hidden rounded-t-[1.75rem] bg-slate-950">
            <Image
              src={interviewer.image}
              alt="Interviewer avatar"
              width={300}
              height={200}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-4 text-center">
            <CardTitle className="text-base font-semibold text-slate-900">{interviewer.name}</CardTitle>
            <p className="mt-2 text-sm text-slate-500">Interviewer profile</p>
          </div>
        </CardContent>
      </Card>
      <Modal open={open} closeOnOutsideClick={true} onClose={() => setOpen(false)}>
        <InterviewerDetailsModal interviewer={interviewer} />
      </Modal>
    </>
  );
};

export default interviewerCard;
