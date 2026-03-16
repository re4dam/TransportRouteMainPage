"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, you would log this error to a service like Sentry
    console.error("Production Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-rose-50 p-8 rounded-2xl border border-rose-100 max-w-lg w-full">
        <h2 className="text-2xl font-black text-rose-600 mb-4">Something went wrong!</h2>
        <p className="text-slate-600 mb-8">
          We are having trouble connecting to the transit network. The server might be temporarily offline.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition"
          >
            Try Again
          </button>
          <Link 
            href="/"
            className="px-6 py-2 bg-white text-rose-600 font-bold rounded-lg border border-rose-200 hover:bg-rose-50 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}