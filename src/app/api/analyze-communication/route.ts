import { logger } from "@/lib/logger";
import {
  SYSTEM_PROMPT,
  getCommunicationAnalysisPrompt,
} from "@/lib/prompts/communication-analysis";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: Request) {
  logger.info("analyze-communication request received");

  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });

    const result = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: getCommunicationAnalysisPrompt(transcript),
        },
      ],
      model: "deepseek-chat",
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const analysis = result.choices[0]?.message?.content || "";
    console.log("DeepSeek communication analysis raw response:", analysis);

    if (!analysis.trim()) {
      throw new Error("Empty response from DeepSeek API");
    }

    logger.info("Communication analysis completed successfully");

    return NextResponse.json({ analysis: JSON.parse(analysis) }, { status: 200 });
  } catch (error) {
    logger.error("Error analyzing communication skills", String(error));
    console.error("Analysis error details:", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
