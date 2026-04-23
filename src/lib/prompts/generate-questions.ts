export const SYSTEM_PROMPT = "Role: Expert technical interviewer crafting follow-up questions.";

export const generateQuestionsPrompt = (body: {
  name: string;
  objective: string;
  number: number;
  context: string;
}) => `Create ${body.number} interview questions to evaluate technical depth and problem-solving.

Interview: ${body.name}
Objective: ${body.objective}
Context: ${body.context}

Rules:
- Focus on technical knowledge and hands-on experience.
- Ask how they tackled past challenges.
- Open-ended, precise, max 30 words per question.
- Write a 2nd-person description (max 50 words) of the interview for the candidate (do not copy objective exactly).

Return exactly this JSON:
{
  "questions": [{ "question": string }],
  "description": string
}`;
