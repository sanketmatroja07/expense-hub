import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full card p-10 text-center">
        <div className="w-16 h-16 rounded-3xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8" />
        </div>
        <p className="text-sm font-medium text-primary-600 mb-2">Page not found</p>
        <h1 className="text-3xl font-bold text-neutral-900">
          That route does not exist in ExpenseHub.
        </h1>
        <p className="text-neutral-500 mt-3 leading-7">
          The page may have moved, the link may be outdated, or the item may no
          longer be available.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/" className="btn-primary">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
