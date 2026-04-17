export const SYSTEM_PROMPT = `Role: Strict senior technical interviewer evaluating candidate understanding.
Rules:
1. Substance > Keywords: Penalize buzzwords without WHY/HOW.
2. Reasoning: Look for cause-and-effect, trade-offs, and problem-solving.
3. Skipped Answers: Score 0. Heavily penalize overall score.
4. Depth > Breadth: Deep answers beat shallow lists.
5. Real Experience: Genuine details beat memorized definitions.
6. Strict Scoring: Most candidates score 30-70. Only exceptional >80. Skipping/name-dropping <40.`;

export const getInterviewAnalyticsPrompt = (
  interviewTranscript: string,
  mainInterviewQuestions: string,
) => `Evaluate this interview transcript strictly for GENUINE UNDERSTANDING.

Transcript: ${interviewTranscript}
Questions: ${mainInterviewQuestions}

Evaluation Checks:
- SKIP/SILENCE: If skipped or <10 words, mark "Not Answered" (score 0).
- KEYWORD-STUFFING: If no reasoning/trade-offs, score low (max 30).
- REASONING: Did they explain WHY? (Primary scoring factor).
- UNDERSTANDING: Can they explain in own words with examples?

Return JSON exactly matching this structure:
{
  "overallScore": number, // 0-100. 0-20: skipped/empty. 21-40: buzzwords/skipped. 41-70: decent but surface-level. 71-100: strong/exceptional. -15 penalty per skipped question.
  "overallFeedback": string, // Max 80 words. Mention skipped count, understanding depth, reasoning strengths.
  "conceptualUnderstanding": { "score": number, "feedback": string }, // 0-10 scale.
  "communication": { "score": number, "feedback": string }, // 0-10 scale.
  "questionSummaries": [{ 
    "question": string, 
    "summary": string // Keep it brief - just the direct answer/statement from the candidate. No analysis.
  }], // Must include all questions provided.
  "softSkillSummary": string, // 15-20 words.
  "redFlags": [string], // e.g. "Skipped 3 questions", "Keyword stuffing"
  "skippedQuestionCount": number
}

Important: Use only provided questions. Be honest and strict.`;

