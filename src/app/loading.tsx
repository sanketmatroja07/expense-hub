export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="card px-6 py-5 flex items-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
        <span className="text-sm font-medium text-neutral-700">
          Loading ExpenseHub
        </span>
      </div>
    </div>
  );
}
