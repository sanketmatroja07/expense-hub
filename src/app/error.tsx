"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full card p-10 text-center">
        <p className="text-sm font-medium text-danger-600 mb-2">
          Something went wrong
        </p>
        <h1 className="text-3xl font-bold text-neutral-900">
          ExpenseHub hit an unexpected error.
        </h1>
        <p className="text-neutral-500 mt-3 leading-7">
          Try reloading the screen. If this keeps happening, the app needs a
          deeper production backend and monitoring pass before public rollout.
        </p>
        <div className="mt-8 flex justify-center">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
