"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";
import { Navbar, MobileNav } from "@/components/layout";
import { AddExpenseModal, SettleUpModal } from "@/components/modals";
import { CATEGORIES } from "@/lib/mock-data";
import { useExpenseHub } from "@/lib/expense-hub-store";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";

interface GroupDetailPageProps {
  params: {
    groupId: string;
  };
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { currentUser, expenses, groups } = useExpenseHub();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);

  const group = groups.find((item) => item.id === params.groupId);

  if (!group) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <main className="pt-20 pb-24 lg:pb-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card p-8 text-center">
              <p className="text-sm font-medium text-primary-600 mb-2">Group not found</p>
              <h1 className="text-2xl font-bold text-neutral-900 mb-3">
                We couldn&apos;t find that expense group.
              </h1>
              <p className="text-neutral-500 mb-6">
                The link is valid now, but this specific group id is missing from the demo data.
              </p>
              <Link href="/groups" className="btn-primary inline-flex">
                <ArrowLeft className="w-4 h-4" />
                Back to Groups
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const groupExpenses = expenses
    .filter((expense) => expense.groupId === group.id)
    .sort(
      (left, right) =>
        new Date(right.date).getTime() - new Date(left.date).getTime()
    );

  const userBalance =
    group.members.find((member) => member.id === currentUser.id)?.balance ?? 0;
  const openExpenses = groupExpenses.filter(
    (expense) => expense.status !== "settled"
  ).length;
  const settledExpenses = groupExpenses.length - openExpenses;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="pt-20 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link
                href="/groups"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Groups
              </Link>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-3xl shadow-sm">
                  {group.emoji || "👥"}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900">
                    {group.name}
                  </h1>
                  <p className="text-neutral-500 mt-1">
                    {group.members.length} members • {group.type} group • Updated {formatDate(group.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettleUp(true)}
                className="btn-secondary"
              >
                <CheckCircle2 className="w-4 h-4" />
                Settle Up
              </button>
              <button
                onClick={() => setShowAddExpense(true)}
                className="btn-primary"
              >
                <Receipt className="w-4 h-4" />
                Add Expense
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="card p-5">
              <p className="text-sm text-neutral-500 mb-2">Total Spent</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(group.totalSpent, group.currency)}
              </p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-neutral-500 mb-2">Your Balance</p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  userBalance > 0
                    ? "text-success-600"
                    : userBalance < 0
                    ? "text-danger-600"
                    : "text-neutral-900"
                )}
              >
                {userBalance > 0 ? "+" : ""}
                {formatCurrency(userBalance, group.currency)}
              </p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-neutral-500 mb-2">Open Expenses</p>
              <p className="text-2xl font-bold text-neutral-900">{openExpenses}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-neutral-500 mb-2">Simplify Debts</p>
              <p className="text-2xl font-bold text-neutral-900">
                {group.simplifyDebts ? "On" : "Off"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.05fr,0.95fr] gap-6">
            <section className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Group Expenses
                  </h2>
                  <p className="text-sm text-neutral-500 mt-1">
                    {groupExpenses.length} total expenses, {settledExpenses} settled
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {groupExpenses.map((expense) => {
                  const category =
                    CATEGORIES.find((item) => item.name === expense.category) ??
                    CATEGORIES[CATEGORIES.length - 1];

                  return (
                    <div
                      key={expense.id}
                      className="rounded-2xl border border-neutral-100 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-xl">
                            {category.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-900">
                              {expense.description}
                            </h3>
                            <p className="text-sm text-neutral-500 mt-1">
                              Paid by {expense.paidBy.name} • {formatDate(expense.date)}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                              <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600">
                                {category.label}
                              </span>
                              <span
                                className={cn(
                                  "px-2.5 py-1 rounded-full",
                                  expense.status === "settled" &&
                                    "bg-success-100 text-success-700",
                                  expense.status === "partial" &&
                                    "bg-warning-100 text-warning-700",
                                  expense.status === "pending" &&
                                    "bg-neutral-100 text-neutral-600"
                                )}
                              >
                                {expense.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-neutral-900">
                            {formatCurrency(expense.amount, expense.currency)}
                          </p>
                          <p className="text-sm text-neutral-500 mt-1">
                            Split {expense.splits.length} ways
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="space-y-6">
              <section className="card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Users className="w-5 h-5 text-neutral-500" />
                  <h2 className="text-lg font-semibold text-neutral-900">Members</h2>
                </div>

                <div className="space-y-4">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="avatar-md">
                          <span>{getInitials(member.name)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-900 truncate">
                            {member.name}
                          </p>
                          <p className="text-sm text-neutral-500 truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-semibold whitespace-nowrap",
                          member.balance > 0
                            ? "text-success-600"
                            : member.balance < 0
                            ? "text-danger-600"
                            : "text-neutral-500"
                        )}
                      >
                        {member.balance > 0 ? "+" : ""}
                        {formatCurrency(member.balance, group.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Wallet className="w-5 h-5 text-neutral-500" />
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Group Snapshot
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-neutral-600">
                  <div className="flex items-center justify-between">
                    <span>Currency</span>
                    <span className="font-semibold text-neutral-900">{group.currency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Created</span>
                    <span className="font-semibold text-neutral-900">{formatDate(group.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Activity</span>
                    <span className="font-semibold text-neutral-900">{formatDate(group.updatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Member Count</span>
                    <span className="font-semibold text-neutral-900">{group.members.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Open Items</span>
                    <span className="font-semibold text-neutral-900">{openExpenses}</span>
                  </div>
                </div>
              </section>

              <section className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-neutral-500" />
                  <h2 className="text-lg font-semibold text-neutral-900">Next Step</h2>
                </div>
                <p className="text-sm text-neutral-500 leading-6">
                  Review group balances, recent expenses, and quick settlement context from the same saved data the rest of the app uses.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <MobileNav onAddExpense={() => setShowAddExpense(true)} />

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
      />
      <SettleUpModal
        isOpen={showSettleUp}
        onClose={() => setShowSettleUp(false)}
      />
    </div>
  );
}
