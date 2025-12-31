/**
 * OpenAI Embeddings Integration
 *
 * Generates 1536-dimensional vector embeddings using text-embedding-3-small.
 * Used for semantic search and finding nearest neighbor concepts.
 */

import OpenAI from "openai";

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is required. Add it to .env.local"
      );
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

/**
 * Generate a 1536-dimensional embedding vector for the given text.
 * Combines concept name and description for richer semantic representation.
 *
 * @param text - The text to embed (typically "ConceptName: Description")
 * @returns A 1536-dimensional vector, or null on error
 */
export async function generateEmbedding(
  text: string
): Promise<number[] | null> {
  try {
    const response = await getOpenAI().embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

/**
 * Generate an embedding for a concept, combining name and description.
 *
 * @param name - The concept name
 * @param description - The concept description
 * @returns A 1536-dimensional vector, or null on error
 */
export async function generateConceptEmbedding(
  name: string,
  description: string
): Promise<number[] | null> {
  const text = `${name}: ${description}`;
  return generateEmbedding(text);
}

/**
 * Batch generate embeddings for multiple texts.
 * More efficient than calling generateEmbedding multiple times.
 *
 * @param texts - Array of texts to embed
 * @returns Array of embeddings (null for any that failed)
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<(number[] | null)[]> {
  if (texts.length === 0) return [];

  try {
    const response = await getOpenAI().embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
      encoding_format: "float",
    });

    // Map response embeddings back to original order
    return response.data
      .sort((a, b) => a.index - b.index)
      .map((item) => item.embedding);
  } catch (error) {
    console.error("Error generating batch embeddings:", error);
    return texts.map(() => null);
  }
}
