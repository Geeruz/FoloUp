import { logger } from "@/lib/logger";
import { generateInterviewAnalytics } from "@/services/analytics.service";
import { ResponseService } from "@/services/responses.service";
import type { Response } from "@/types/response";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: Request) {
  logger.info("get-call request received");
  const body = await req.json();

  const callDetails: Response = await ResponseService.getResponseByCallId(body.id);
  let callResponse = callDetails.details;
  if (callDetails.is_analysed) {
    return NextResponse.json(
      {
        callResponse,
        analytics: callDetails.analytics,
      },
      { status: 200 },
    );
  }
  const callOutput = await retell.call.retrieve(body.id);
  const interviewId = callDetails?.interview_id;
  callResponse = { ...(callResponse || {}), ...callOutput };
  const duration = Math.round(
    callResponse.end_timestamp / 1000 - callResponse.start_timestamp / 1000,
  );

  const payload = {
    callId: body.id,
    interviewId: interviewId,
    transcript: callResponse.transcript,
  };
  const result = await generateInterviewAnalytics(payload);
  const analytics = result.analytics;
  const is_analysed = !!analytics;

  if (!is_analysed) {
    logger.error("Analytics generation failed", {
      callId: body.id,
      status: result.status,
      error: result.error,
    });
  } else if (analytics?.redFlags?.includes("API quota exceeded")) {
    logger.warn("Analytics generated with quota exceeded fallback", { callId: body.id });
  }

  await ResponseService.saveResponse(
    {
      details: callResponse,
      is_analysed: is_analysed,
      duration: duration,
      analytics: analytics || null,
    },
    body.id,
  );

  if (is_analysed) {
    if (analytics?.redFlags?.includes("API quota exceeded")) {
      logger.info("Call analysis completed with quota exceeded fallback");
    } else {
      logger.info("Call analysed successfully");
    }
  } else {
    logger.warn("Call analysis incomplete; analytics not saved", { callId: body.id });
  }

  return NextResponse.json(
    {
      callResponse,
      analytics,
    },
    { status: 200 },
  );
}
