"use server";

import { SYSTEM_PROMPT, getInterviewAnalyticsPrompt } from "@/lib/prompts/analytics";
import { InterviewService } from "@/services/interviews.service";
import { ResponseService } from "@/services/responses.service";
import type { Question } from "@/types/interview";
import type { Analytics } from "@/types/response";
import { OpenAI } from "openai";

export const generateInterviewAnalytics = async (payload: {
  callId: string;
  interviewId: string;
  transcript: string;
}) => {
  const { callId, interviewId, transcript } = payload;

  // Get interview data first to have questions available for fallback
  const response = await ResponseService.getResponseByCallId(callId);
  const interview = await InterviewService.getInterviewById(interviewId);
  const questions = interview?.questions || [];

  try {
    if (response.analytics) {
      return { analytics: response.analytics as Analytics, status: 200 };
    }

    const hrTranscriptsStr = response.details?.hr_transcript?.map((t: any) => `Q: ${t.question}\nA: ${t.answer}`).join("\n\n") || "";
    const evalTranscriptsStr = response.details?.evaluation_transcript?.map((t: any) => `Q: ${t.question}\nA: ${t.answer}`).join("\n\n") || "";
    const baseTranscript = transcript || response.details?.transcript || "";
    
    const interviewTranscript = `--- HR Round Answers ---\n${hrTranscriptsStr || "None"}\n\n--- Evaluation Round Answers ---\n${evalTranscriptsStr || "None"}\n\n--- On Call Round Conversation ---\n${baseTranscript}`;
    const mainInterviewQuestions = questions
      .map((q: Question, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });

    const prompt = getInterviewAnalyticsPrompt(interviewTranscript, mainInterviewQuestions);

    const result = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "deepseek-chat",
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const content = result.choices[0]?.message?.content || "";
    console.log("DeepSeek analytics raw response:", content);

    if (!content.trim()) {
      throw new Error("Empty response from DeepSeek API");
    }

    const analyticsResponse = JSON.parse(content);

    if (!analyticsResponse.softSkillSummary) {
      console.warn("Analytics response missing softSkillSummary field", analyticsResponse);
    }

    analyticsResponse.mainInterviewQuestions = questions.map((q: Question) => q.question);

    return { analytics: analyticsResponse, status: 200 };
  } catch (error: any) {
    console.error("Error in DeepSeek request:", error);

    // Check if it's a quota exceeded error
    if (error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("429")) {
      console.warn("DeepSeek API quota exceeded - falling back to basic analytics");

      // Return basic analytics structure when quota is exceeded
      const fallbackAnalytics = {
        overallScore: 0,
        overallFeedback: "Analytics temporarily unavailable due to API quota limits. Please try again later.",
        conceptualUnderstanding: { score: 0, feedback: "Not available" },
        communication: { score: 0, feedback: "Not available" },
        questionSummaries: [],
        softSkillSummary: "Analytics processing temporarily unavailable due to API quota limits.",
        redFlags: ["API quota exceeded"],
        skippedQuestionCount: 0,
        mainInterviewQuestions: questions.map((q: Question) => q.question),
      };

      return { analytics: fallbackAnalytics, status: 200 };
    }

    return { error: "internal server error", status: 500 };
  }
};
