/**
 * Exa.ai Search Integration
 *
 * Searches for philosophy books and articles with purchase links.
 * Uses neural (semantic) search for relevant results.
 *
 * Note: As of exa-js 2.0+, use search() with contents option.
 */

import Exa from "exa-js";
import type { Book } from "@/types";

// Lazy initialization of Exa client
let exa: Exa | null = null;

function getExa(): Exa {
  if (!exa) {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
      throw new Error(
        "EXA_API_KEY environment variable is required. Add it to .env.local"
      );
    }
    exa = new Exa(apiKey);
  }
  return exa;
}

// Preferred book retailer domains (in order of preference)
const BOOK_DOMAINS = ["bookshop.org", "goodreads.com", "amazon.com"];

interface ExaSearchResult {
  url: string;
  title: string | null;
  text?: string | null;
  author?: string | null;
  publishedDate?: string | null;
}

/**
 * Extract book metadata from an Exa result.
 * Attempts to parse author and clean up title from the result.
 */
function parseBookResult(result: ExaSearchResult): Book {
  let title = result.title || "Unknown Title";
  let author = result.author || "";

  // Try to extract author from title if not provided
  // Common patterns: "Title by Author" or "Title - Author"
  if (!author) {
    const byMatch = title.match(/^(.+?)\s+by\s+(.+)$/i);
    const dashMatch = title.match(/^(.+?)\s+-\s+(.+)$/);

    if (byMatch) {
      title = byMatch[1].trim();
      author = byMatch[2].trim();
    } else if (dashMatch) {
      // Only use dash pattern if second part looks like a name
      const potentialAuthor = dashMatch[2].trim();
      if (
        potentialAuthor.split(" ").length <= 4 &&
        !potentialAuthor.includes("|")
      ) {
        title = dashMatch[1].trim();
        author = potentialAuthor;
      }
    }
  }

  // Clean up title (remove site suffixes)
  title = title
    .replace(/\s*\|\s*.*$/, "") // Remove "| Site Name"
    .replace(/\s*-\s*Goodreads.*$/i, "") // Remove "- Goodreads"
    .replace(/\s*-\s*Amazon.*$/i, "") // Remove "- Amazon"
    .trim();

  // Extract description from text content
  let description = result.text || "";
  if (description.length > 300) {
    description = description.substring(0, 300).trim() + "...";
  }

  return {
    title,
    author: author || "Unknown Author",
    url: result.url,
    description: description || undefined,
  };
}

/**
 * Search for philosophy books related to a concept.
 *
 * @param query - Search query (concept name + optional keywords)
 * @param maxResults - Maximum results to return
 * @returns Array of book results with purchase links
 */
export async function searchBooks(
  query: string,
  maxResults: number = 6
): Promise<Book[]> {
  try {
    // Only append "philosophy" if not already in query
    const searchQuery = query.toLowerCase().includes("philosophy")
      ? `${query} book`
      : `${query} philosophy book`;

    // Search with neural (semantic) search
    const response = await getExa().search(searchQuery, {
      type: "neural",
      numResults: maxResults * 3, // Fetch extra for filtering
      includeDomains: BOOK_DOMAINS,
      contents: {
        text: { maxCharacters: 500 },
      },
    });

    if (!response.results || response.results.length === 0) {
      return [];
    }

    // Parse and deduplicate results
    const books = response.results.map((result) =>
      parseBookResult(result as ExaSearchResult)
    );

    // Deduplicate by title (prefer bookshop.org > goodreads > amazon)
    const titleMap = new Map<string, Book>();

    for (const book of books) {
      const normalizedTitle = book.title.toLowerCase().replace(/[^\w\s]/g, "");

      if (!titleMap.has(normalizedTitle)) {
        titleMap.set(normalizedTitle, book);
      } else {
        // Replace if current source is higher priority
        const existing = titleMap.get(normalizedTitle)!;
        const existingPriority = BOOK_DOMAINS.findIndex((d) =>
          existing.url.includes(d)
        );
        const currentPriority = BOOK_DOMAINS.findIndex((d) =>
          book.url.includes(d)
        );

        if (
          currentPriority !== -1 &&
          (existingPriority === -1 || currentPriority < existingPriority)
        ) {
          titleMap.set(normalizedTitle, book);
        }
      }
    }

    return Array.from(titleMap.values()).slice(0, maxResults);
  } catch (error) {
    console.error("Error searching Exa for books:", error);
    return [];
  }
}

/**
 * Search for philosophy articles and academic resources.
 *
 * @param query - Search query
 * @param maxResults - Maximum results to return
 * @returns Array of article/resource results
 */
export async function searchArticles(
  query: string,
  maxResults: number = 5
): Promise<{ title: string; url: string; description: string }[]> {
  try {
    // Only append "philosophy" if not already in query
    const searchQuery = query.toLowerCase().includes("philosophy")
      ? query
      : `${query} philosophy`;

    const response = await getExa().search(searchQuery, {
      type: "neural",
      numResults: maxResults,
      includeDomains: [
        "plato.stanford.edu", // Stanford Encyclopedia of Philosophy
        "iep.utm.edu", // Internet Encyclopedia of Philosophy
        "philpapers.org",
        "jstor.org",
      ],
      contents: {
        text: { maxCharacters: 300 },
      },
    });

    if (!response.results) {
      return [];
    }

    return response.results.map((result) => ({
      title: result.title || "Untitled",
      url: result.url,
      description: result.text || "",
    }));
  } catch (error) {
    console.error("Error searching Exa for articles:", error);
    return [];
  }
}
