/**
 * YouTube Data API v3 Integration
 *
 * Searches for educational philosophy videos.
 * Uses API key authentication (no OAuth required for public search).
 */

import type { Video } from "@/types";

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
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error("YOUTUBE_API_KEY not configured");
    return [];
  }

  const { maxResults = 5, duration = "medium" } = options;

  // Build search URL with parameters
  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    type: "video",
    q: `${query} philosophy`,
    maxResults: String(maxResults * 2), // Fetch extra for filtering
    order: "relevance",
    videoDuration: duration,
    relevanceLanguage: "en",
    safeSearch: "moderate",
    videoEmbeddable: "true",
  });

  try {
    const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);

    if (!response.ok) {
      const error = await response.json();
      console.error("YouTube API error:", error);
      return [];
    }

    const data: YouTubeSearchResponse = await response.json();

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

/**
 * Search for both medium and long-form philosophy videos.
 * Combines results from two searches to get a mix of explainers and lectures.
 *
 * @param query - Search query
 * @param maxResults - Maximum total results to return
 * @returns Array of video results
 */
export async function searchPhilosophyVideos(
  query: string,
  maxResults: number = 5
): Promise<Video[]> {
  // Run parallel searches for medium and long videos
  const [mediumVideos, longVideos] = await Promise.all([
    searchVideos(query, {
      maxResults: Math.ceil(maxResults / 2),
      duration: "medium",
    }),
    searchVideos(query, {
      maxResults: Math.floor(maxResults / 2),
      duration: "long",
    }),
  ]);

  // Interleave results: medium, long, medium, long...
  const combined: Video[] = [];
  const maxLength = Math.max(mediumVideos.length, longVideos.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < mediumVideos.length) combined.push(mediumVideos[i]);
    if (i < longVideos.length) combined.push(longVideos[i]);
  }

  // Deduplicate by video ID
  const seen = new Set<string>();
  const deduplicated = combined.filter((video) => {
    if (seen.has(video.videoId)) return false;
    seen.add(video.videoId);
    return true;
  });

  return deduplicated.slice(0, maxResults);
}
