import { logger } from "@/lib/logger";
import { SYSTEM_PROMPT, generateQuestionsPrompt } from "@/lib/prompts/generate-questions";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export const maxDuration = 60;

export async function POST(req: Request) {
  logger.info("generate-interview-questions request received");
  const body = await req.json();

  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });

  try {
    const result = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: generateQuestionsPrompt(body),
        },
      ],
      model: "deepseek-chat",
      temperature: 0.3,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const content = result.choices[0]?.message?.content || "";
    console.log("DeepSeek interview questions raw response:", content);

    if (!content.trim()) {
      throw new Error("Empty response from DeepSeek API");
    }

    logger.info("Interview questions generated successfully");

    return NextResponse.json(
      {
        response: content,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error generating interview questions", String(error));
    console.error("Generate questions error details:", error);

    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
