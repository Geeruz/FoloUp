export const SYSTEM_PROMPT = `You are a senior technical interviewer evaluating candidates. Focus on genuine understanding, not keywords. Penalize skipped questions heavily. Score 30-70 for most candidates.`;

export const getInterviewAnalyticsPrompt = (
  interviewTranscript: string,
  mainInterviewQuestions: string,
) => `Analyze the following interview transcript as a strict, experienced interviewer who values GENUINE UNDERSTANDING over keyword usage.

###
Transcript: ${interviewTranscript}

Main Interview Questions:
${mainInterviewQuestions}

EVALUATION INSTRUCTIONS:

For EACH answer in the transcript, apply these checks:
- SKIP/SILENCE CHECK: Did the candidate actually answer? If they skipped, stayed silent, said "I don't know", or gave fewer than 10 meaningful words, mark as "Not Answered" and score that question as 0.
- KEYWORD-STUFFING CHECK: Did the candidate just list technologies/terms without explaining their reasoning, trade-offs, or how they applied them? If yes, flag this as superficial and score LOW (max 30/100 for that area).
- REASONING CHECK: Did the candidate explain WHY they made decisions? Did they discuss trade-offs, alternatives considered, or lessons learned? This is the PRIMARY scoring factor.
- UNDERSTANDING CHECK: Could the candidate explain the concept in their own words with specific details, or did they just recite a definition? Real understanding shows through examples, edge cases awareness, and nuanced opinions.
- RELEVANCE CHECK: Did the answer actually address what was asked, or did the candidate pivot to a comfortable topic?

Generate the following analytics in JSON format:

1. Overall Score (0-100) and Overall Feedback (80 words max):
   SCORING GUIDE — BE STRICT:
   - 0-20: Skipped most questions / gave empty or irrelevant answers
   - 21-40: Answered but only with buzzwords, no real understanding demonstrated; OR skipped multiple questions
   - 41-55: Some understanding shown but mostly surface-level; limited reasoning or examples
   - 56-70: Decent understanding with some reasoning, but gaps in depth or missed questions
   - 71-85: Strong understanding with clear reasoning, relevant examples, and good problem-solving approach
   - 86-100: Exceptional — deep understanding, insightful trade-off analysis, real-world experience evident, no questions skipped

   CRITICAL PENALTIES (apply cumulatively):
   - Each skipped/unanswered question: -15 points from what the score would otherwise be
   - Keyword-stuffing without explanation: cap that question's contribution at 30%
   - Generic/textbook answers with no personal experience or reasoning: cap at 50%

   In the feedback, explicitly mention:
   - How many questions were skipped or inadequately answered
   - Whether answers showed real understanding or just keyword usage
   - Specific strengths in reasoning (if any)

2. Conceptual Understanding: Score (0-10) and Feedback (80 words max):
   - 9-10: Explains concepts in own words with specific examples, discusses edge cases, shows nuanced understanding
   - 7-8: Good understanding with some reasoning, but occasionally surface-level
   - 5-6: Basic understanding, can define concepts but can't explain trade-offs or apply them
   - 3-4: Only knows buzzwords, can't explain underlying principles
   - 1-2: Fundamental misunderstandings or contradictions in answers
   - 0: Did not demonstrate any understanding

3. Communication Skills: Score (0-10) and Feedback (60 words max):
   - 9-10: Clear, structured responses with excellent articulation of complex ideas
   - 7-8: Good communication with minor issues in clarity or structure
   - 5-6: Understandable but disorganized or vague at times
   - 3-4: Difficult to follow, frequent unclear statements
   - 1-2: Very poor communication making it hard to assess knowledge
   - 0: Did not communicate / skipped questions

4. Summary for each main interview question: ${mainInterviewQuestions}
   - For each question, provide ONLY what the candidate actually said in response to that question.
   - Keep it brief - just the direct answer/statement from the candidate.
   - If no answer was given, note "No answer provided".
   - Do not include analysis, classification, or evaluation - just the raw response.

5. Soft Skills Summary (15-20 words): Consider confidence, critical thinking, self-awareness (admitting gaps honestly is better than faking knowledge), and problem-solving approach.

Ensure the output is valid JSON with this structure:
{
  "overallScore": number,
  "overallFeedback": string,
  "conceptualUnderstanding": { "score": number, "feedback": string },
  "communication": { "score": number, "feedback": string },
  "questionSummaries": [{ "question": string, "summary": string }],
  "softSkillSummary": string,
  "redFlags": [string],
  "skippedQuestionCount": number
}

The "redFlags" array should list specific concerns like: "Candidate listed 5 technologies but couldn't explain any", "Skipped 3 out of 5 questions", "Gave textbook definitions without practical application", etc.

IMPORTANT: Only use the main questions provided. Do not generate or infer additional questions. Be HONEST and STRICT — a lenient evaluation helps nobody.`;

