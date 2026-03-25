"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  MoreVertical,
  Users,
  Wallet,
  Eye,
  Edit2,
  Archive,
  Search,
} from "lucide-react";
import { Navbar, MobileNav } from "@/components/layout";
import { CreateGroupModal, AddExpenseModal, SettleUpModal } from "@/components/modals";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { useExpenseHub } from "@/lib/expense-hub-store";

export default function GroupsPage() {
  const { groups, currentUser } = useExpenseHub();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="pt-20 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Groups</h1>
              <p className="text-neutral-500 mt-1">
                Manage your expense sharing groups
              </p>
            </div>

            <button
              onClick={() => setShowCreateGroup(true)}
              className="btn-primary hidden sm:flex"
            >
              <Plus className="w-5 h-5" />
              Create Group
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="input pl-12"
            />
          </div>

          {/* Groups Grid */}
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGroups.map((group, index) => {
                const userBalance = group.members.find(
                  (m) => m.id === currentUser.id
                )?.balance;
                const isPositive = userBalance && userBalance > 0;

                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card p-5 hover:shadow-card-hover group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-2xl">
                          {group.emoji || "👥"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">
                            {group.name}
                          </h3>
                          <p className="text-sm text-neutral-500 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {group.members.length} members
                          </p>
                        </div>
                      </div>

                      {/* Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === group.id ? null : group.id)
                          }
                          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4 text-neutral-500" />
                        </button>

                        {openMenuId === group.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl border border-neutral-100 shadow-card z-10 overflow-hidden">
                            <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                              <Edit2 className="w-4 h-4" />
                              Edit Group
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors">
                              <Archive className="w-4 h-4" />
                              Archive
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Member Avatars */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                        {group.members.slice(0, 4).map((member, i) => (
                          <div
                            key={member.id}
                            className="avatar-sm ring-2 ring-white"
                            style={{ zIndex: 10 - i }}
                          >
                            <span className="text-[10px]">
                              {getInitials(member.name)}
                            </span>
                          </div>
                        ))}
                        {group.members.length > 4 && (
                          <div className="avatar-sm ring-2 ring-white bg-neutral-200 text-neutral-600">
                            <span className="text-[10px]">
                              +{group.members.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div>
                        <p className="text-xs text-neutral-500">Total Spent</p>
                        <p className="text-sm font-semibold text-neutral-900">
                          {formatCurrency(group.totalSpent)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">Your Balance</p>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            isPositive
                              ? "text-success-600"
                              : userBalance && userBalance < 0
                              ? "text-danger-600"
                              : "text-neutral-400"
                          )}
                        >
                          {userBalance && userBalance !== 0
                            ? isPositive
                              ? `+${formatCurrency(userBalance)}`
                              : formatCurrency(userBalance)
                            : "Settled"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Users className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {searchQuery ? "No groups found" : "No groups yet"}
              </h3>
              <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                {searchQuery
                  ? "Try a different search term"
                  : "Create a group to start splitting expenses with friends"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="btn-primary"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Group
                </button>
              )}
            </div>
          )}

          {/* Floating Create Button (Mobile) */}
          <button
            onClick={() => setShowCreateGroup(true)}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-xl shadow-primary-500/40 sm:hidden"
          >
            <Plus className="w-7 h-7 text-white" />
          </button>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav onAddExpense={() => setShowAddExpense(true)} />

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
      />
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
      />
      <SettleUpModal
        isOpen={showSettleUp}
        onClose={() => setShowSettleUp(false)}
      />

      {/* Click outside to close menu */}
      {openMenuId && (
        <div className="fixed inset-0 z-5" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}
