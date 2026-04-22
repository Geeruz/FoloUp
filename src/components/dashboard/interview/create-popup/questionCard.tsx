import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Question, InterviewRound } from "@/types/interview";
import { Trash2 } from "lucide-react";

interface QuestionCardProps {
  questionNumber: number;
  questionData: Question;
  onQuestionChange: (id: string, question: Question) => void;
  onDelete: (id: string) => void;
}

const ROUND_OPTIONS: { value: InterviewRound; label: string; tooltip: string }[] = [
  { value: "hr", label: "HR", tooltip: "HR Round — behavioral & culture fit" },
  { value: "evaluation", label: "Evaluation", tooltip: "Evaluation Round — technical assessment" },
  { value: "oncall", label: "On Call", tooltip: "On Call Round — live AI conversation" },
];

const questionCard = ({
  questionNumber,
  questionData,
  onQuestionChange,
  onDelete,
}: QuestionCardProps) => {
  return (
    <>
      <Card className="border-none rounded-[2rem] mb-6 pb-4 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-2 mx-5">
          <div className="flex flex-row justify-between mt-3 items-baseline ">
            <CardTitle className="text-lg">Question {questionNumber}</CardTitle>
            <div className="flex flex-row items-start space-x-1">
              <h3 className="text-base font-semibold mr-2">Depth Level: </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`text-xs h-8 px-4 font-semibold rounded-full transition-all duration-200 ease-in-out ${
                        questionData?.follow_up_count === 1 ? "bg-slate-900 text-white shadow-md scale-105" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                      } `}
                      onClick={() =>
                        onQuestionChange(questionData.id, {
                          ...questionData,
                          follow_up_count: 1,
                        })
                      }
                    >
                      Low
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-200">
                    <p className="text-zinc-800">Brief follow-up</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`text-xs h-8 px-4 font-semibold rounded-full transition-all duration-200 ease-in-out ${
                        questionData?.follow_up_count === 2 ? "bg-slate-900 text-white shadow-md scale-105" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                      } `}
                      onClick={() =>
                        onQuestionChange(questionData.id, {
                          ...questionData,
                          follow_up_count: 2,
                        })
                      }
                    >
                      Medium
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-200">
                    <p className="text-zinc-800">Moderate follow-up</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`text-xs h-8 px-4 font-semibold rounded-full transition-all duration-200 ease-in-out ${
                        questionData?.follow_up_count === 3 ? "bg-slate-900 text-white shadow-md scale-105" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                      } `}
                      onClick={() =>
                        onQuestionChange(questionData.id, {
                          ...questionData,
                          follow_up_count: 3,
                        })
                      }
                    >
                      High
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-200">
                    <p className="text-zinc-800">In-depth follow-up</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Round selector */}
          <div className="flex flex-row justify-between mt-2 items-center">
            <h3 className="text-sm font-semibold text-gray-600">Interview Round:</h3>
            <div className="flex flex-row items-center space-x-1">
              {ROUND_OPTIONS.map((round) => (
                <TooltipProvider key={round.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className={`text-xs h-8 px-5 font-semibold rounded-full transition-all duration-200 ease-in-out ${
                          questionData?.round === round.value
                            ? "bg-slate-900 text-white shadow-md scale-105"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                        }`}
                        onClick={() =>
                          onQuestionChange(questionData.id, {
                            ...questionData,
                            round: round.value,
                          })
                        }
                      >
                        {round.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-200">
                      <p className="text-zinc-800">{round.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          <div className="flex flex-row items-center">
            <textarea
              value={questionData?.question}
              className="h-fit mt-4 pt-3 border border-slate-200 rounded-[1rem] w-full px-4 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all resize-y shadow-sm"
              placeholder="e.g. Can you tell me about a challenging project you've worked on?"
              rows={3}
              onChange={(e) =>
                onQuestionChange(questionData.id, {
                  ...questionData,
                  question: e.target.value,
                })
              }
              onBlur={(e) =>
                onQuestionChange(questionData.id, {
                  ...questionData,
                  question: e.target.value.trim(),
                })
              }
            />
            <Trash2
              className="cursor-pointer ml-4 text-slate-300 hover:text-red-500 transition-colors hover:scale-110"
              strokeWidth={2}
              size={22}
              onClick={() => onDelete(questionData.id)}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
export default questionCard;
