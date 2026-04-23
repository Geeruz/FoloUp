import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { Retell } from "retell-sdk";

const apiKey = process.env.RETELL_API_KEY || "";

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (
    !Retell.verify(
      JSON.stringify(req.body),
      apiKey,
      req.headers.get("x-retell-signature") as string,
    )
  ) {
    console.error("Invalid signature");

    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { event, call } = req.body as unknown as { event: string; call: any };

  switch (event) {
    case "call_started":
      console.log("Call started event received", call.call_id);
      break;
    case "call_ended":
      console.log("Call ended event received", call.call_id);
      break;
    case "call_analyzed": {
      const host = req.headers.get("host") || process.env.NEXT_PUBLIC_LIVE_URL || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      const apiUrl = `${protocol}://${host}/api/get-call`;
      try {
        await axios.post(apiUrl, {
          id: call.call_id,
        });
        console.log("Call analyzed event received", call.call_id);
      } catch (error) {
        console.error("Failed to invoke get-call from webhook", error);
      }
      break;
    }
    default:
      console.log("Received an unknown event:", event);
  }

  // Acknowledge the receipt of the event
  return NextResponse.json({ status: 204 });
}
