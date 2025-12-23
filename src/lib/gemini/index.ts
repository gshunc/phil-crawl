/**
 * Google Gemini Flash LLM Integration
 *
 * All LLM generation for lessons, dialogue, branches, and quizzes.
 * Uses Gemini Flash API with appropriate prompts from PROMPTS.md.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  Concept,
  FamiliarityLevel,
  LessonGeneration,
  BranchGeneration,
  SocraticQuestionGeneration,
  SocraticResponseGeneration,
  ExpandedDescriptionGeneration,
  QuizQuestionGeneration,
  QuizEvaluationGeneration,
  SocraticMessage,
  QuizAnswer,
} from "@/types";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get the Gemini Flash model configured for JSON output
function getModel() {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });
}

// =============================================
// SYSTEM PROMPTS
// =============================================

const LESSON_SYSTEM_PROMPT = `You are an educational assistant creating accessible yet rigorous lessons for curious learners. Your explanations should be:

- Clear and engaging without being condescending
- Balanced, presenting multiple scholarly perspectives where debate exists
- Historically grounded, situating ideas in their context
- Connected to broader philosophical themes

Always acknowledge areas of genuine philosophical disagreement rather than presenting contested interpretations as settled fact.`;

const BRANCHES_SYSTEM_PROMPT = `You are a philosophy curriculum designer creating meaningful connections between philosophical concepts. Your connections should:

- Reveal genuine intellectual relationships, not superficial associations
- Span different eras and traditions where appropriate
- Balance canonical and lesser-known but valuable connections
- Explain the relationship clearly and enticingly`;

const SOCRATIC_SYSTEM_PROMPT = `
You're an assistant engaging in philosophical dialogue. Assume you're talking to an intelligent and earnest student who deeply wants to learn. Your questions should:

- Probe assumptions and reveal hidden complexity
- Guide the learner to discover insights themselves
- Build progressively deeper understanding
- Be genuinely curious, not merely rhetorical
- Challenge without being adversarial

Use the Socratic method: ask questions that expose contradictions, clarify definitions, explore implications, and test the limits of positions`;

const EXPANDED_SYSTEM_PROMPT = `You are a philosophy education assistant providing an in-depth lecture on a concept. Your expanded explanation should:

- Go significantly deeper than an introductory overview
- Include specific arguments, thought experiments, or examples
- Discuss historical development and evolution of the concept
- Address major objections and responses
- Connect to contemporary relevance where applicable

Write for an engaged learner who has read the basic description and wants more.`;

const QUIZ_SYSTEM_PROMPT = `You are designing a brief diagnostic quiz to assess philosophical familiarity. Questions should:

- Test actual understanding, not just recognition of terms
- Distinguish between beginner, intermediate, and advanced familiarity
- Be fair and unambiguous
- Cover core aspects of the topic`;

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Parse JSON response from Gemini, with fallback handling for malformed responses
 */
function parseJsonResponse<T>(text: string): T | null {
  try {
    // First, try direct parse
    return JSON.parse(text) as T;
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim()) as T;
      } catch {
        console.error("Failed to parse JSON from code block");
      }
    }

    // Try to find JSON object in the response
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]) as T;
      } catch {
        console.error("Failed to parse JSON object from response");
      }
    }

    console.error("Could not parse response as JSON:", text.substring(0, 200));
    return null;
  }
}

/**
 * Format dialogue history for prompts
 */
function formatDialogueHistory(history: SocraticMessage[]): string {
  return history
    .map(
      (msg) =>
        `${msg.role === "assistant" ? "Socrates" : "Learner"}: ${msg.content}`
    )
    .join("\n\n");
}

/**
 * Format quiz answers for prompts
 */
function formatQuizAnswers(answers: QuizAnswer[]): string {
  return answers
    .map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer} (${a.level})`)
    .join("\n\n");
}

// =============================================
// GENERATION FUNCTIONS
// =============================================

/**
 * Generate a lesson for a philosophical concept
 */
export async function generateLesson(
  conceptName: string
): Promise<LessonGeneration | null> {
  const model = getModel();

  const prompt = `${LESSON_SYSTEM_PROMPT}

Create a lesson for the philosophical concept: "${conceptName}"

Provide:
1. A clear description (300-500 words) that explains:
   - What this concept means
   - Its historical origins and key figures associated with it
   - Why it matters philosophically
   - Different perspectives or interpretations where relevant

2. A list of 3-5 recommended primary texts for further reading, formatted as:
   - "Title" by Author (Year) - One sentence on why this text is relevant

Respond in JSON format:
{
  "description": "...",
  "recommended_reading": [
    {
      "title": "...",
      "author": "...",
      "year": "...",
      "relevance": "..."
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJsonResponse<LessonGeneration>(text);
  } catch (error) {
    console.error("Error generating lesson:", error);
    return null;
  }
}

/**
 * Generate four branch connections from a concept
 */
export async function generateBranches(
  concept: Concept
): Promise<BranchGeneration | null> {
  const model = getModel();

  const prompt = `${BRANCHES_SYSTEM_PROMPT}

Given the philosophical concept "${concept.name}" with description:
"${concept.description}"

Generate exactly 4 branch connections to other philosophical concepts:

1. CONSTRUCTIVE: A concept that builds upon, extends, or develops from this one
2. CRITIQUE: A concept, thinker, or school of thought that challenges, opposes, or offers an alternative to this one
3. AUTHOR: A philosopher most closely associated with or influential in developing this concept
4. WILDCARD: An unexpected, esoteric, or cross-disciplinary connection that reveals something surprising about this concept

For each branch, provide:
- The target concept name (specific and searchable)
- A compelling 1-2 sentence description of HOW and WHY this concept connects to the source
- The connection should make the user curious to explore further

Respond in JSON format:
{
  "branches": [
    {
      "type": "constructive",
      "target_name": "...",
      "description": "..."
    },
    {
      "type": "critique",
      "target_name": "...",
      "description": "..."
    },
    {
      "type": "author",
      "target_name": "...",
      "description": "..."
    },
    {
      "type": "wildcard",
      "target_name": "...",
      "description": "..."
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJsonResponse<BranchGeneration>(text);
  } catch (error) {
    console.error("Error generating branches:", error);
    return null;
  }
}

/**
 * Generate an initial Socratic question for a concept
 */
export async function generateSocraticQuestion(
  concept: Concept
): Promise<SocraticQuestionGeneration | null> {
  const model = getModel();

  const prompt = `${SOCRATIC_SYSTEM_PROMPT}

Begin a Socratic dialogue exploring the concept: "${concept.name}"

Context: ${concept.description}

Ask an opening question that:
- Invites the learner to articulate their current understanding
- Sets up productive philosophical inquiry
- Is accessible but has depth to explore

Respond in JSON format:
{
  "question": "...",
  "context": "Brief note on what this question aims to explore"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJsonResponse<SocraticQuestionGeneration>(text);
  } catch (error) {
    console.error("Error generating Socratic question:", error);
    return null;
  }
}

/**
 * Generate a Socratic response to a user's answer
 */
export async function generateSocraticResponse(
  concept: Concept,
  history: SocraticMessage[],
  answer: string
): Promise<SocraticResponseGeneration | null> {
  const model = getModel();

  const dialogueHistory = formatDialogueHistory(history);
  const exchangeCount = history.filter((m) => m.role === "user").length;

  const prompt = `${SOCRATIC_SYSTEM_PROMPT}

Continue the Socratic dialogue on: "${concept.name}"

Dialogue so far:
${dialogueHistory}

The learner just responded: "${answer}"

Respond to their answer and ask a follow-up question that:
- Acknowledges what's insightful in their response
- Probes deeper or challenges assumptions
- Moves the inquiry forward

If the dialogue has reached a natural conclusion (after 4-6 exchanges, currently at ${
    exchangeCount + 1
  }), instead provide a reflective summary.

Respond in JSON format:
{
  "response": "Your response to their answer",
  "question": "Your follow-up question (or null if concluding)",
  "is_complete": false,
  "summary": "Only if is_complete is true, a brief reflection on what was explored"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJsonResponse<SocraticResponseGeneration>(text);
  } catch (error) {
    console.error("Error generating Socratic response:", error);
    return null;
  }
}

/**
 * Generate an expanded description of a concept
 */
export async function generateExpandedDescription(
  concept: Concept
): Promise<ExpandedDescriptionGeneration | null> {
  const model = getModel();

  const prompt = `${EXPANDED_SYSTEM_PROMPT}

Provide an expanded, in-depth explanation of: "${concept.name}"

Basic description the user has already seen:
"${concept.description}"

Create an expanded treatment (800-1200 words) that:
1. Dives deeper into the philosophical arguments
2. Provides concrete examples or thought experiments
3. Traces the historical development
4. Addresses major criticisms and defenses
5. Discusses contemporary relevance or applications

Do not simply repeat the original description—assume the reader has read it and wants to go further.

Respond in JSON format:
{
  "expanded_description": "..."
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJsonResponse<ExpandedDescriptionGeneration>(text);
  } catch (error) {
    console.error("Error generating expanded description:", error);
    return null;
  }
}

/**
 * Generate a quiz question for familiarity assessment
 */
export async function generateQuizQuestion(
  category: string,
  subtopic: string,
  priorAnswers?: QuizAnswer[]
): Promise<QuizQuestionGeneration | null> {
  const model = getModel();

  const priorQA = priorAnswers ? formatQuizAnswers(priorAnswers) : "None yet.";

  const prompt = `${QUIZ_SYSTEM_PROMPT}

Create a quiz question to assess familiarity with: "${subtopic}" (within ${category})

Prior questions and answers in this quiz:
${priorQA}

Generate a question that helps distinguish the user's familiarity level. Include:
- A clear question
- 4 answer options (one clearly beginner-level, one intermediate, one advanced, one incorrect)
- Mark which answer corresponds to which level

Respond in JSON format:
{
  "question": "...",
  "options": [
    { "text": "...", "level": "beginner" },
    { "text": "...", "level": "intermediate" },
    { "text": "...", "level": "advanced" },
    { "text": "...", "level": "incorrect" }
  ],
  "explanation": "Brief note on what each answer reveals about familiarity"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJsonResponse<QuizQuestionGeneration>(text);
  } catch (error) {
    console.error("Error generating quiz question:", error);
    return null;
  }
}

/**
 * Evaluate quiz results to determine familiarity level
 */
export async function evaluateQuizResult(
  category: string,
  subtopic: string,
  answers: QuizAnswer[]
): Promise<QuizEvaluationGeneration | null> {
  const model = getModel();

  const qaPairs = formatQuizAnswers(answers);

  const prompt = `You are evaluating quiz responses to determine philosophical familiarity. Be fair but honest in your assessment.

Based on the following quiz responses, determine the user's familiarity with "${subtopic}" (within ${category}):

Questions and answers:
${qaPairs}

Evaluate and assign a familiarity level: "beginner", "intermediate", or "advanced"

Consider:
- Consistency of responses
- The sophistication of understanding demonstrated
- When in doubt, err slightly toward the lower level (better to pleasantly surprise than overwhelm)

Respond in JSON format:
{
  "familiarity": "beginner" | "intermediate" | "advanced",
  "reasoning": "Brief explanation of the assessment"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJsonResponse<{
      familiarity: string;
      reasoning: string;
    }>(text);
    if (parsed) {
      return {
        familiarity: parsed.familiarity as FamiliarityLevel,
        reasoning: parsed.reasoning,
      };
    }
    return null;
  } catch (error) {
    console.error("Error evaluating quiz result:", error);
    return null;
  }
}

/**
 * Generate search keywords for YouTube video search
 */
export async function generateVideoKeywords(
  conceptName: string
): Promise<string | null> {
  const model = getModel();

  const prompt = `Generate 2-3 search keywords for finding educational philosophy videos about "${conceptName}".

Include the concept name and one or two related terms (philosopher names, schools of thought).

Return only a comma-separated list, no explanations. Format as JSON:
{
  "keywords": "..."
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJsonResponse<{ keywords: string }>(text);
    return parsed?.keywords || `${conceptName} philosophy`;
  } catch (error) {
    console.error("Error generating video keywords:", error);
    return `${conceptName} philosophy`;
  }
}

/**
 * Generate search keywords for book search
 */
export async function generateBookKeywords(
  conceptName: string
): Promise<string | null> {
  const model = getModel();

  const prompt = `Generate 3-5 search keywords for finding philosophy books about "${conceptName}".

Include:
- Key authors associated with this concept
- Titles of seminal works if known
- Related philosophical terms

Return only a comma-separated list, no explanations. Format as JSON:
{
  "keywords": "..."
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJsonResponse<{ keywords: string }>(text);
    return parsed?.keywords || `${conceptName} philosophy book`;
  } catch (error) {
    console.error("Error generating book keywords:", error);
    return `${conceptName} philosophy book`;
  }
}
