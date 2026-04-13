import MiniLoader from "@/components/loaders/mini-loader/miniLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { InterviewerService } from "@/services/interviewers.service";
import { ResponseService } from "@/services/responses.service";
import axios from "axios";
import { ArrowUpRight, Copy } from "lucide-react";
import { CopyCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  name: string | null;
  interviewerId: bigint;
  id: string;
  url: string;
  readableSlug: string;
}

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

function InterviewCard({ name, interviewerId, id, url, readableSlug }: Props) {
  const [copied, setCopied] = useState(false);
  const [responseCount, setResponseCount] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [img, setImg] = useState("");

  useEffect(() => {
    const fetchInterviewer = async () => {
      const interviewer = await InterviewerService.getInterviewer(interviewerId);
      setImg(interviewer.image);
    };
    fetchInterviewer();
  }, [interviewerId]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const responses = await ResponseService.getAllResponses(id);
        setResponseCount(responses.length);
        if (responses.length > 0) {
          setIsFetching(true);
          for (const response of responses) {
            if (!response.is_analysed) {
              try {
                const result = await axios.post("/api/get-call", {
                  id: response.call_id,
                });

                if (result.status !== 200) {
                  throw new Error(`HTTP error! status: ${result.status}`);
                }
              } catch (error) {
                console.error(
                  `Failed to call api/get-call for response id ${response.call_id}:`,
                  error,
                );
              }
            }
          }
          setIsFetching(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchResponses();
  }, [id]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(readableSlug ? `${base_url}/call/${readableSlug}` : (url as string))
      .then(
        () => {
          setCopied(true);
          toast.success("Interview link copied.", {
            position: "bottom-right",
            duration: 3000,
          });
          setTimeout(() => setCopied(false), 2000);
        },
        (err) => {
          console.log("failed to copy", err.message);
        },
      );
  };

  const handleJumpToInterview = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const interviewUrl = readableSlug ? `/call/${readableSlug}` : `/call/${url}`;
    window.open(interviewUrl, "_blank");
  };

  return (
    <a
      href={`/interviews/${id}`}
      style={{
        pointerEvents: isFetching ? "none" : "auto",
        cursor: isFetching ? "default" : "pointer",
      }}
      className="relative"
    >
      <Card className="group h-72 w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-slate-950 transition hover:-translate-y-1 hover:shadow-xl">
        <CardContent className={isFetching ? "opacity-60" : ""}>
          <div className="flex h-32 items-end rounded-[1.5rem] bg-gradient-to-br from-sky-500 to-indigo-600 p-5 text-white">
            <div>
              <p className="text-lg font-semibold">{name}</p>
              <p className="mt-2 text-sm text-slate-200">Interview campaign</p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-3xl bg-slate-100">
                {img ? (
                  <Image
                    src={img}
                    alt="Interviewer"
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">?</div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Responses</p>
                <p className="text-2xl font-semibold text-slate-950">{responseCount ?? 0}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="h-11 rounded-full px-4 text-sm"
                variant="outline"
                onClick={handleJumpToInterview}
              >
                <ArrowUpRight size={16} />
              </Button>
              <Button
                className={`h-11 rounded-full px-4 text-sm ${copied ? "bg-slate-800 text-white" : ""}`}
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  copyToClipboard();
                }}
              >
                {copied ? <CopyCheck size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

export default InterviewCard;
