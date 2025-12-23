import Link from "next/link";

/**
 * Auth Layout
 *
 * Shared layout for authentication pages (login, signup).
 * Provides a clean, centered design with branding.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="py-6 px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
        >
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
          <span className="font-semibold text-lg">PhilTreeCrawler</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          A living map of human thought
        </p>
      </footer>
    </div>
  );
}

