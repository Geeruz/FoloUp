"use client";

import Call from "@/components/call";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import { useInterviews } from "@/contexts/interviews.context";
import type { Interview } from "@/types/interview";
import { ArrowUpRightSquareIcon } from "lucide-react";
import Image from "next/image";
import { use, useEffect, useState } from "react";

type Props = {
  params: Promise<{
    interviewId: string;
  }>;
};

type PopupProps = {
  title: string;
  description: string;
  image: string;
};

function PopupLoader() {
  return (
    <div className="absolute left-1/2 top-1/2 z-10 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 px-4">
      <div className="h-[88vh] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-2xl">
        <div className="flex h-full flex-col items-center justify-center rounded-[2rem] bg-slate-950/90 p-10 text-center text-slate-100">
          <LoaderWithText />
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-slate-400">
        Powered by <span className="font-semibold text-white">Provly</span>
      </div>
    </div>
  );
}

function PopUpMessage({ title, description, image }: PopupProps) {
  return (
    <div className="absolute left-1/2 top-1/2 z-10 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 px-4">
      <div className="h-[88vh] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-2xl">
        <div className="flex h-full flex-col items-center justify-center gap-6 rounded-[2rem] bg-slate-950/90 p-10 text-center text-slate-100">
          <Image src={image} alt="Graphic" width={220} height={220} className="mb-4" />
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <p className="max-w-xl text-slate-300">{description}</p>
        </div>
      </div>
      <div className="mt-5 text-center text-sm text-slate-400">
        Powered by <span className="font-semibold text-white">Provly</span>
      </div>
    </div>
  );
}

function InterviewInterface({ params }: Props) {
  const resolvedParams = use(params);
  const [interview, setInterview] = useState<Interview>();
  const [isActive, setIsActive] = useState(true);
  const { getInterviewById } = useInterviews();
  const [interviewNotFound, setInterviewNotFound] = useState(false);
  useEffect(() => {
    if (interview) {
      setIsActive(interview?.is_active === true);
    }
  }, [interview]);

  useEffect(() => {
    const fetchinterview = async () => {
      try {
        const response = await getInterviewById(resolvedParams.interviewId);
        if (response) {
          setInterview(response);
          document.title = response.name;
        } else {
          setInterviewNotFound(true);
        }
      } catch (error) {
        console.error(error);
        setInterviewNotFound(true);
      }
    };

    fetchinterview();
  }, [getInterviewById, resolvedParams.interviewId]);

  return (
    <div>
      <div className="hidden md:block p-8 mx-auto form-container">
        {!interview ? (
          interviewNotFound ? (
            <PopUpMessage
              title="Invalid URL"
              description="The interview link you're trying to access is invalid. Please check the URL and try again."
              image="/invalid-url.png"
            />
          ) : (
            <PopupLoader />
          )
        ) : !isActive ? (
          <PopUpMessage
            title="Interview Is Unavailable"
            description="We are not currently accepting responses. Please contact the sender for more information."
            image="/closed.png"
          />
        ) : (
          <Call interview={interview} />
        )}
      </div>
      <div className=" md:hidden flex flex-col items-center md:h-[0px] justify-center  my-auto">
        <div className="mt-48 px-3">
          <p className="text-center my-5 text-md font-semibold">{interview?.name}</p>
          <p className="text-center text-gray-600 my-5">
            Please use a PC to respond to the interview. Apologies for any inconvenience caused.{" "}
          </p>
        </div>
        <div className="text-center text-md font-semibold mr-2 my-5">
          Powered by{" "}
          <a className="font-bold underline" href="www.pinestacks.com" target="_blank" rel="noreferrer">
            Provly
          </a>
        </div>
      </div>
    </div>
  );
}

export default InterviewInterface;
