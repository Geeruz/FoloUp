export const SYSTEM_PROMPT = `Role: Communication evaluator focusing on SUBSTANCE.
Rules:
1. Fluency without meaning (keywords/vague answers) scores LOW.
2. Skipping/empty answers is a FAILURE.
3. Good = clear reasoning, concrete examples, honest about gaps.
4. Bad = jargon hiding, non-answers, reciting definitions.`;

export const getCommunicationAnalysisPrompt = (
  transcript: string,
) => `Evaluate interview communication for REAL UNDERSTANDING, not just fluency.

Transcript: ${transcript}

Criteria:
- Explained reasoning (WHY)? Used examples?
- Honest about gaps? Answered the actual question?
- Penalize skipped answers and keyword-listing.

Return exactly this JSON:
{
  "communicationScore": number, // 0-10. Fluent but empty max 4.
  "substanceScore": number, // 0-10. Keywords only max 2.
  "overallFeedback": string, // 2-3 sentences.
  "supportingQuotes": [{
    "quote": string,
    "analysis": string,
    "type": string // "strength", "keyword_stuffing", "non_answer", "improvement_area"
  }],
  "strengths": [string],
  "improvementAreas": [string],
  "skippedOrEmptyAnswers": number
}`;

