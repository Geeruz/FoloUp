"use server";

import { SYSTEM_PROMPT, getInterviewAnalyticsPrompt } from "@/lib/prompts/analytics";
import { InterviewService } from "@/services/interviews.service";
import { ResponseService } from "@/services/responses.service";
import type { Question } from "@/types/interview";
import type { Analytics } from "@/types/response";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateInterviewAnalytics = async (payload: {
  callId: string;
  interviewId: string;
  transcript: string;
}) => {
  const { callId, interviewId, transcript } = payload;

  try {
    const response = await ResponseService.getResponseByCallId(callId);
    const interview = await InterviewService.getInterviewById(interviewId);

    if (response.analytics) {
      return { analytics: response.analytics as Analytics, status: 200 };
    }

    const hrTranscriptsStr = response.details?.hr_transcript?.map((t: any) => `Q: ${t.question}\nA: ${t.answer}`).join("\n\n") || "";
    const evalTranscriptsStr = response.details?.evaluation_transcript?.map((t: any) => `Q: ${t.question}\nA: ${t.answer}`).join("\n\n") || "";
    const baseTranscript = transcript || response.details?.transcript || "";
    
    const interviewTranscript = `--- HR Round Answers ---\n${hrTranscriptsStr || "None"}\n\n--- Evaluation Round Answers ---\n${evalTranscriptsStr || "None"}\n\n--- On Call Round Conversation ---\n${baseTranscript}`;
    const questions = interview?.questions || [];
    const mainInterviewQuestions = questions
      .map((q: Question, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

    const model = genai.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const prompt = getInterviewAnalyticsPrompt(interviewTranscript, mainInterviewQuestions);

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const content = result.response.text();
    console.log("Gemini analytics raw response:", content);
    const match = content.match(/\{[\s\S]*\}/);
    const cleanContent = match ? match[0] : content;
    const analyticsResponse = JSON.parse(cleanContent);

    if (!analyticsResponse.softSkillSummary) {
      console.warn("Analytics response missing softSkillSummary field", analyticsResponse);
    }

    analyticsResponse.mainInterviewQuestions = questions.map((q: Question) => q.question);

    return { analytics: analyticsResponse, status: 200 };
  } catch (error) {
    console.error("Error in Gemini request:", error);

    return { error: "internal server error", status: 500 };
  }
};
