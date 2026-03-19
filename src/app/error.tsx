"use client";

import { Logo } from "@/components/shared/logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
      <Logo size="lg" className="mb-6" />
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-950">
        Something went wrong
      </h1>
      <p className="mt-3 text-stone-600 text-center max-w-md text-sm sm:text-base">
        An unexpected error occurred. This has been noted.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
        <button
          onClick={reset}
          className="px-6 py-3 bg-blueprint text-white rounded-lg font-medium hover:bg-blueprint-light transition-colors"
        >
          Try Again
        </button>
        <a
          href="/"
          className="px-6 py-3 bg-stone-200 text-stone-800 rounded-lg font-medium hover:bg-stone-400/30 transition-colors"
        >
          Return Home
        </a>
      </div>
    </main>
  );
}
