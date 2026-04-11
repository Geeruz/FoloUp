import { logger } from "@/lib/logger";
import { SYSTEM_PROMPT, createUserPrompt } from "@/lib/prompts/generate-insights";
import { InterviewService } from "@/services/interviews.service";
import { ResponseService } from "@/services/responses.service";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: Request) {
  logger.info("generate-insights request received");
  const body = await req.json();

  const responses = await ResponseService.getAllResponses(body.interviewId);
  const interview = await InterviewService.getInterviewById(body.interviewId);

  let callSummaries = "";
  if (responses) {
    for (const response of responses) {
      callSummaries += response.details?.call_analysis?.call_summary;
    }
  }

  const client = new OpenAI({
    apiKey: process.env.SARVAM_API_KEY,
    baseURL: "https://api.sarvam.ai/v1",
  });

  try {
    const prompt = createUserPrompt(
      callSummaries,
      interview.name,
      interview.objective,
      interview.description,
    );

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
      model: "sarvam-105b",
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const content = result.choices[0]?.message?.content || "";
    console.log("Sarvam insights raw response:", content);

    if (!content.trim()) {
      throw new Error("Empty response from Sarvam API");
    }

    // Clean markdown code block formatting if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const insightsResponse = JSON.parse(cleanContent);

    await InterviewService.updateInterview(
      { insights: insightsResponse.insights },
      body.interviewId,
    );

    logger.info("Insights generated successfully");

    return NextResponse.json(
      {
        response: content,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error generating insights", String(error));
    console.error("Insights error details:", error);

    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
