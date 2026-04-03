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
      <Card className=" shadow-md mb-5 pb-3 ">
        <CardContent className="p-2 mx-5">
          <div className="flex flex-row justify-between mt-3 items-baseline ">
            <CardTitle className="text-lg">Question {questionNumber}</CardTitle>
            <div className="flex flex-row items-start space-x-1">
              <h3 className="text-base font-semibold mr-2">Depth Level: </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`text-xs h-7  hover:bg-indigo-800  ${
                        questionData?.follow_up_count === 1 ? "bg-indigo-600" : "opacity-50"
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
                      className={`text-xs h-7  hover:bg-indigo-800 ${
                        questionData?.follow_up_count === 2 ? "bg-indigo-600" : "opacity-50"
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
                      className={`text-xs h-7 hover:bg-indigo-800  ${
                        questionData?.follow_up_count === 3 ? "bg-indigo-600" : "opacity-50"
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
                        className={`text-xs h-6 px-3 hover:bg-indigo-800 ${
                          questionData?.round === round.value
                            ? "bg-indigo-600"
                            : "opacity-50"
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
              className="h-fit mt-3 pt-1 border-2 rounded-md w-full px-2 border-gray-400"
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
              className="cursor-pointer ml-3"
              color="red"
              size={24}
              onClick={() => onDelete(questionData.id)}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
export default questionCard;
