/**
 * YouTube Data API v3 Integration
 *
 * Searches for educational philosophy videos.
 * Uses API key authentication (no OAuth required for public search).
 */

import type { Video } from "@/types";

// Lazy API key getter
function getApiKey(): string {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "YOUTUBE_API_KEY environment variable is required. Add it to .env.local"
    );
  }
  return apiKey;
}

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

/**
 * Search for philosophy videos on YouTube.
 *
 * @param query - Search query (concept name + optional keywords)
 * @param options - Optional search parameters
 * @returns Array of video results
 */
export async function searchVideos(
  query: string,
  options: {
    maxResults?: number;
    duration?: "short" | "medium" | "long";
  } = {}
): Promise<Video[]> {
  const { maxResults = 5, duration } = options;

  // Only append "philosophy" if not already in query
  const searchQuery = query.toLowerCase().includes("philosophy")
    ? query
    : `${query} philosophy`;

  // Build search URL with parameters
  const params = new URLSearchParams({
    key: getApiKey(),
    part: "snippet",
    type: "video",
    q: searchQuery,
    maxResults: String(maxResults * 2), // Fetch extra for filtering
    order: "relevance",
    relevanceLanguage: "en",
    safeSearch: "moderate",
    videoEmbeddable: "true",
  });

  // Only filter by duration if specified
  if (duration) {
    params.set("videoDuration", duration);
  }

  try {
    const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);

    if (!response.ok) {
      const error = await response.json();
      console.error("YouTube API error:", error);
      return [];
    }

    const data: YouTubeSearchResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Transform and filter results
    const videos: Video[] = data.items
      .filter((item) => item.id.videoId) // Ensure we have a video ID
      .map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default?.url ||
          "",
        watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      }));

    // Prioritize educational channels
    const priorityKeywords = [
      "academy",
      "lecture",
      "philosophy",
      "university",
      "course",
    ];

    const scored = videos.map((video) => {
      const channelLower = video.channelTitle.toLowerCase();
      const score = priorityKeywords.reduce(
        (acc, keyword) => acc + (channelLower.includes(keyword) ? 1 : 0),
        0
      );
      return { video, score };
    });

    // Sort by score (descending) and take top results
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, maxResults).map((s) => s.video);
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return [];
  }
}
