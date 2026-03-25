import Link from "next/link";
import { LifeBuoy, Mail, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout";

export const metadata = {
  title: "Help",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 md:p-10">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6">
              <LifeBuoy className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Help and Support
            </h1>
            <p className="text-neutral-500 mt-3 max-w-2xl leading-7">
              ExpenseHub is set up to help users move quickly through tracking,
              splitting, and settling expenses. If something looks off, start
              with the common checks below.
            </p>

            <div className="grid gap-4 md:grid-cols-2 mt-8">
              <div className="rounded-2xl border border-neutral-100 bg-white p-5">
                <ShieldCheck className="w-5 h-5 text-success-600 mb-3" />
                <h2 className="font-semibold text-neutral-900">
                  Quick troubleshooting
                </h2>
                <p className="text-sm text-neutral-500 mt-2 leading-6">
                  Refresh the page after creating a group or expense, make sure
                  you are on the correct group route, and confirm the browser is
                  allowing local storage for this site.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-100 bg-white p-5">
                <Mail className="w-5 h-5 text-primary-600 mb-3" />
                <h2 className="font-semibold text-neutral-900">Need a hand?</h2>
                <p className="text-sm text-neutral-500 mt-2 leading-6">
                  Add your real support email before launch so this page can
                  route customers to a monitored inbox.
                </p>
                <a
                  href="mailto:support@expensehub.app"
                  className="inline-flex mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  support@expensehub.app
                </a>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100">
              <Link href="/" className="btn-primary">
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
