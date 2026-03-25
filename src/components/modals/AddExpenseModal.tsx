"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  DollarSign,
  Calendar,
  ChevronDown,
  Check,
  Upload,
  Trash2,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { CATEGORIES } from "@/lib/mock-data";
import { SplitType } from "@/lib/types";
import { useExpenseHub } from "@/lib/expense-hub-store";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string;
}

const splitTypes: { type: SplitType; label: string; description: string }[] = [
  {
    type: "equal",
    label: "Split Equally",
    description: "Everyone pays the same amount",
  },
  {
    type: "amount",
    label: "Split by Amount",
    description: "Specify exact amounts for each person",
  },
  {
    type: "percentage",
    label: "Split by Percentage",
    description: "Specify percentage for each person",
  },
  {
    type: "full",
    label: "Full Amount",
    description: "One person pays the entire amount",
  },
];

export function AddExpenseModal({
  isOpen,
  onClose,
  groupId,
}: AddExpenseModalProps) {
  const { addExpense, currentUser, groups } = useExpenseHub();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paidBy, setPaidBy] = useState(currentUser.id);
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([currentUser.id]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || "");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPaidByDropdown, setShowPaidByDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const selectedGroup = groups.find((group) => group.id === selectedGroupId);
  const availableMembers = selectedGroup ? selectedGroup.members : [currentUser];
  const selectedCategory = CATEGORIES.find((c) => c.name === category);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const initialGroupId = groupId || "";
    const initialGroup = groups.find((group) => group.id === initialGroupId);
    setAmount("");
    setDescription("");
    setCategory("food");
    setDate(new Date().toISOString().split("T")[0]);
    setPaidBy(currentUser.id);
    setSplitType(initialGroup ? "equal" : "full");
    setSelectedMembers(
      initialGroup ? initialGroup.members.map((member) => member.id) : [currentUser.id]
    );
    setCustomAmounts({});
    setReceipt(null);
    setNotes("");
    setSelectedGroupId(initialGroupId);
    setShowCategoryDropdown(false);
    setShowPaidByDropdown(false);
    setShowGroupDropdown(false);
    setFormError("");
    setIsLoading(false);
  }, [currentUser.id, groupId, groups, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (selectedGroup) {
      setSelectedMembers(selectedGroup.members.map((member) => member.id));
      if (!selectedGroup.members.some((member) => member.id === paidBy)) {
        setPaidBy(currentUser.id);
      }
      if (splitType === "full") {
        setSplitType("equal");
      }
    } else {
      setSelectedMembers([currentUser.id]);
      setPaidBy(currentUser.id);
      setSplitType("full");
    }
  }, [currentUser.id, isOpen, paidBy, selectedGroup, splitType]);

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllMembers = () => {
    setSelectedMembers(availableMembers.map((u) => u.id));
  };

  const handleSubmit = async () => {
    try {
      setFormError("");
      setIsLoading(true);
      await addExpense({
        amount: Number.parseFloat(amount),
        description,
        category,
        date,
        paidBy,
        splitType,
        selectedMembers,
        customAmounts,
        receipt,
        notes,
        groupId: selectedGroupId || undefined,
      });
      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save this expense."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="modal-lg overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900">Add New Expense</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Amount Input */}
          <div className="text-center py-4">
            <label className="text-sm text-neutral-500 mb-2 block">
              Amount
            </label>
            <div className="relative inline-flex items-center">
              <DollarSign className="w-8 h-8 text-neutral-400 absolute left-2" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-5xl font-bold text-center w-64 py-2 pl-10 bg-transparent border-none focus:outline-none focus:ring-0 text-neutral-900 placeholder:text-neutral-300"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?"
              className="input"
            />
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Group
            </label>
            <button
              onClick={() => setShowGroupDropdown(!showGroupDropdown)}
              className="input flex items-center justify-between"
            >
              <span className="truncate">
                {selectedGroup
                  ? `${selectedGroup.emoji || "👥"} ${selectedGroup.name}`
                  : "Personal expense"}
              </span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-neutral-400 transition-transform",
                  showGroupDropdown && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {showGroupDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-100 shadow-card overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setSelectedGroupId("");
                      setShowGroupDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors",
                      !selectedGroupId && "bg-primary-50"
                    )}
                  >
                    <span className="text-sm font-medium">Personal expense</span>
                  </button>
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setShowGroupDropdown(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors",
                        selectedGroupId === group.id && "bg-primary-50"
                      )}
                    >
                      <span className="text-sm font-medium">
                        {group.emoji || "👥"} {group.name}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category and Date Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="relative">
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Category
              </label>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="input flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{
                      backgroundColor: `${selectedCategory?.color}20`,
                    }}
                  >
                    {selectedCategory?.icon}
                  </span>
                  <span>{selectedCategory?.label}</span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-neutral-400 transition-transform",
                    showCategoryDropdown && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {showCategoryDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-100 shadow-card overflow-hidden"
                  >
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => {
                          setCategory(cat.name);
                          setShowCategoryDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors",
                          category === cat.name && "bg-primary-50"
                        )}
                      >
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          {cat.icon}
                        </span>
                        <span className="text-sm font-medium">{cat.label}</span>
                        {category === cat.name && (
                          <Check className="w-4 h-4 text-primary-500 ml-auto" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Date
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input pl-12"
                />
              </div>
            </div>
          </div>

          {/* Paid By */}
          <div className="relative">
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Paid By
            </label>
            <button
              onClick={() => setShowPaidByDropdown(!showPaidByDropdown)}
              className="input flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="avatar-sm">
                  <span>
                    {getInitials(
                      availableMembers.find((u) => u.id === paidBy)?.name || ""
                    )}
                  </span>
                </div>
                <span>
                  {availableMembers.find((u) => u.id === paidBy)?.name}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-neutral-400 transition-transform",
                  showPaidByDropdown && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {showPaidByDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-100 shadow-card overflow-hidden"
                >
                  {availableMembers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setPaidBy(user.id);
                        setShowPaidByDropdown(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors",
                        paidBy === user.id && "bg-primary-50"
                      )}
                    >
                      <div className="avatar-sm">
                        <span>{getInitials(user.name)}</span>
                      </div>
                      <span className="text-sm font-medium">{user.name}</span>
                      {paidBy === user.id && (
                        <Check className="w-4 h-4 text-primary-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Split Type */}
          {selectedGroup ? (
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-3 block">
              Split Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {splitTypes.map((st) => (
                <button
                  key={st.type}
                  onClick={() => setSplitType(st.type)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all",
                    splitType === st.type
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-100 hover:border-neutral-200"
                  )}
                >
                  <p className="text-sm font-medium text-neutral-900">
                    {st.label}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {st.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
          ) : null}

          {/* Member Selection */}
          {selectedGroup && splitType !== "full" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-neutral-700">
                  Split With
                </label>
                <button
                  onClick={selectAllMembers}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  Select All
                </button>
              </div>
              <div className="space-y-2">
                {availableMembers.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                      selectedMembers.includes(user.id)
                        ? "border-primary-500 bg-primary-50"
                        : "border-neutral-100 hover:border-neutral-200"
                    )}
                    onClick={() => toggleMember(user.id)}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                        selectedMembers.includes(user.id)
                          ? "bg-primary-500 border-primary-500"
                          : "border-neutral-300"
                      )}
                    >
                      {selectedMembers.includes(user.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="avatar-sm">
                      <span>{getInitials(user.name)}</span>
                    </div>
                    <span className="text-sm font-medium text-neutral-900 flex-1">
                      {user.name}
                    </span>
                    {splitType === "amount" &&
                      selectedMembers.includes(user.id) && (
                        <input
                          type="number"
                          value={customAmounts[user.id] || ""}
                          onChange={(e) =>
                            setCustomAmounts((prev) => ({
                              ...prev,
                              [user.id]: e.target.value,
                            }))
                          }
                          onClick={(e) => e.stopPropagation()}
                          placeholder="0.00"
                          className="w-24 px-3 py-1.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                        />
                      )}
                    {splitType === "percentage" &&
                      selectedMembers.includes(user.id) && (
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={customAmounts[user.id] || ""}
                            onChange={(e) =>
                              setCustomAmounts((prev) => ({
                                ...prev,
                                [user.id]: e.target.value,
                              }))
                            }
                            onClick={(e) => e.stopPropagation()}
                            placeholder="0"
                            className="w-16 px-3 py-1.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                          />
                          <span className="text-sm text-neutral-500 ml-1">%</span>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Receipt Upload */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Receipt (Optional)
            </label>
            {receipt ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-neutral-200">
                <img
                  src={receipt}
                  alt="Receipt"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setReceipt(null)}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 hover:bg-white shadow-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-danger-500" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-all">
                <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                <span className="text-sm text-neutral-500">
                  Click to upload receipt
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              className="input resize-none"
            />
          </div>

          {formError ? (
            <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              {formError}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button className="btn-secondary">Save as Draft</button>
            <button
              onClick={handleSubmit}
              disabled={!amount || !description || isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Add Expense"
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Click outside dropdowns to close */}
      {(showCategoryDropdown || showPaidByDropdown || showGroupDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCategoryDropdown(false);
            setShowPaidByDropdown(false);
            setShowGroupDropdown(false);
          }}
        />
      )}
    </div>
  );
}
