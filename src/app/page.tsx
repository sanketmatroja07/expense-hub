"use client";

import { useState } from "react";
import { Navbar, Sidebar, MobileNav } from "@/components/layout";
import { SummaryCards, ActivityFeed, RightSidebar } from "@/components/dashboard";
import { AddExpenseModal, CreateGroupModal, SettleUpModal } from "@/components/modals";

export default function DashboardPage() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="pt-20 pb-24 lg:pb-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Left Sidebar */}
            <Sidebar
              onAddExpense={() => setShowAddExpense(true)}
              onCreateGroup={() => setShowCreateGroup(true)}
            />

            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    Dashboard
                  </h1>
                  <p className="text-neutral-500 mt-1">
                    Track your expenses and balances
                  </p>
                </div>

                {/* Mobile Add Button */}
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="btn-primary lg:hidden"
                >
                  Add Expense
                </button>
              </div>

              {/* Summary Cards */}
              <SummaryCards />

              {/* Activity Feed */}
              <ActivityFeed />
            </div>

            {/* Right Sidebar */}
            <RightSidebar onSettleUp={() => setShowSettleUp(true)} />
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav onAddExpense={() => setShowAddExpense(true)} />

      {/* Modals */}
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
      />
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
      />
      <SettleUpModal
        isOpen={showSettleUp}
        onClose={() => setShowSettleUp(false)}
      />
    </div>
  );
}
