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

Return ONLY valid JSON matching this exact structure (NO comments inside the JSON):
{
  "overallScore": 85,
  "overallFeedback": "Overall feedback text here...",
  "conceptualUnderstanding": { "score": 8, "feedback": "Feedback here..." },
  "communication": { "score": 9, "feedback": "Feedback here..." },
  "questionSummaries": [
    { "question": "Question 1", "summary": "Brief summary of answer..." }
  ],
  "softSkillSummary": "Brief soft skill summary...",
  "redFlags": ["Any red flags here"],
  "skippedQuestionCount": 0
}

Field instructions:
- overallScore: 0-100. (0-20: skipped. 21-40: buzzwords. 41-70: surface-level. 71-100: strong. -15 penalty per skip).
- overallFeedback: Max 80 words.
- conceptualUnderstanding / communication scores: 0-10 scale.
- questionSummaries summary: Direct answer only.
- softSkillSummary: 15-20 words.

Important: Use only provided questions. Be honest and strict.`;

