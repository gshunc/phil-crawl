"use client";

import Link from "next/link";

interface PathItem {
  label: string;
  slug: string;
}

interface PathBreadcrumbsProps {
  /** Array of path items representing the exploration path */
  path: PathItem[];
  /** Maximum number of items to show before truncating */
  maxItems?: number;
  /** Custom class name */
  className?: string;
}

/**
 * PathBreadcrumbs - Display current exploration path with clickable links.
 */
export function PathBreadcrumbs({
  path,
  maxItems = 4,
  className = "",
}: PathBreadcrumbsProps) {
  if (path.length === 0) {
    return null;
  }

  // Truncate path if too long
  const shouldTruncate = path.length > maxItems;
  const displayPath = shouldTruncate
    ? [...path.slice(0, 1), ...path.slice(-(maxItems - 1))]
    : path;

  return (
    <nav
      aria-label="Exploration path"
      className={`flex items-center gap-1 text-sm overflow-x-auto ${className}`}
    >
      {/* Home/Start link */}
      <Link
        href="/start"
        className="flex-shrink-0 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </Link>

      {displayPath.map((item, index) => {
        const isLast = index === displayPath.length - 1;
        const showEllipsis = shouldTruncate && index === 0;

        return (
          <div key={item.slug} className="flex items-center gap-1">
            {/* Separator */}
            <svg
              className="w-4 h-4 flex-shrink-0 text-zinc-300 dark:text-zinc-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>

            {/* Ellipsis for truncated items */}
            {showEllipsis && (
              <>
                <span className="text-zinc-400 dark:text-zinc-500">...</span>
                <svg
                  className="w-4 h-4 flex-shrink-0 text-zinc-300 dark:text-zinc-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}

            {/* Path item */}
            {isLast ? (
              <span className="flex-shrink-0 font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]">
                {item.label}
              </span>
            ) : (
              <Link
                href={`/explore/${item.slug}`}
                className="flex-shrink-0 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors truncate max-w-[120px]"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

