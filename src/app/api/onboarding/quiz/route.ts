import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { generateQuizQuestion, evaluateQuizResult } from "@/lib/gemini";
import type { QuizQuestionRequest, QuizAnswer } from "@/types";

/**
 * POST /api/onboarding/quiz
 *
 * Handles the quiz flow for determining user familiarity with a subtopic.
 *
 * Request body:
 * - category: string - The category being tested
 * - subtopic: string - The subtopic being tested
 * - priorAnswers?: QuizAnswer[] - Previous answers in this quiz session
 *
 * Returns either:
 * - A new question (if quiz continues)
 * - A final result with familiarity level (if quiz is complete)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: QuizQuestionRequest = await request.json();

    // Validate request
    if (!body.category || typeof body.category !== "string") {
      return NextResponse.json(
        { error: "category is required" },
        { status: 400 }
      );
    }

    if (!body.subtopic || typeof body.subtopic !== "string") {
      return NextResponse.json(
        { error: "subtopic is required" },
        { status: 400 }
      );
    }

    const priorAnswers = body.priorAnswers || [];

    // After 3 questions, evaluate and return result
    if (priorAnswers.length >= 3) {
      const result = evaluateQuizResult(priorAnswers);

      return NextResponse.json({
        complete: true,
        result: {
          familiarity: result.familiarity,
          reasoning: result.reasoning,
        },
      });
    }

    // Generate next question
    const question = await generateQuizQuestion(
      body.category,
      body.subtopic,
      priorAnswers
    );

    if (!question) {
      return NextResponse.json(
        { error: "Failed to generate quiz question" },
        { status: 500 }
      );
    }

    // Validate question structure
    const validLevels = ["beginner", "intermediate", "advanced", "incorrect"];
    if (
      !question.question ||
      typeof question.question !== "string" ||
      !Array.isArray(question.options) ||
      question.options.length < 2 ||
      !question.options.every(
        (opt) =>
          typeof opt.text === "string" &&
          validLevels.includes(opt.level)
      )
    ) {
      console.error("Invalid question structure from Gemini:", question);
      return NextResponse.json(
        { error: "Failed to generate valid quiz question" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      complete: false,
      question: {
        question: question.question,
        options: question.options,
        explanation: question.explanation || "",
      },
    });
  } catch (error) {
    console.error("Error in quiz:", error);
    return NextResponse.json(
      { error: "Failed to process quiz" },
      { status: 500 }
    );
  }
}
