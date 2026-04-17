export const SYSTEM_PROMPT = "Role: Expert at extracting insights from interview summaries.";

export const createUserPrompt = (
  callSummaries: string,
  interviewName: string,
  interviewObjective: string,
  interviewDescription: string,
) => `Extract 3 key insights from these call summaries focusing on user feedback.

Summaries: ${callSummaries}
Interview: ${interviewName}
Objective: ${interviewObjective}
Description: ${interviewDescription}

Rules:
- Exactly 3 insights.
- Max 25 words per insight.
- No user names.

Return exactly this JSON:
{
  "insights": [string]
}`;
