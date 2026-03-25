"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  DollarSign,
  Calendar,
  ChevronDown,
  Check,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { PAYMENT_METHODS, balances as mockBalances, currentUser } from "@/lib/mock-data";
import { PaymentMethod } from "@/lib/types";

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedUser?: string;
}

export function SettleUpModal({
  isOpen,
  onClose,
  preselectedUser,
}: SettleUpModalProps) {
  const [step, setStep] = useState<"select" | "confirm" | "success">("select");
  const [selectedUser, setSelectedUser] = useState(preselectedUser || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState("");
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const youOwe = mockBalances.filter((b) => b.amount < 0);
  const owedToYou = mockBalances.filter((b) => b.amount > 0);

  const selectedBalance = mockBalances.find((b) => b.userId === selectedUser);
  const isPayingThem = selectedBalance && selectedBalance.amount < 0;
  const suggestedAmount = selectedBalance
    ? Math.abs(selectedBalance.amount)
    : 0;

  const selectedMethod = PAYMENT_METHODS.find((m) => m.method === paymentMethod);

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    const balance = mockBalances.find((b) => b.userId === userId);
    if (balance) {
      setAmount(Math.abs(balance.amount).toFixed(2));
    }
  };

  const handleConfirm = () => {
    setStep("confirm");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep("success");
  };

  const handleClose = () => {
    setStep("select");
    setSelectedUser("");
    setAmount("");
    setNote("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="modal overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {/* Step 1: Select User */}
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                <h2 className="text-xl font-bold text-neutral-900">Settle Up</h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-6">
                {/* You Owe */}
                {youOwe.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                      You Owe
                    </p>
                    <div className="space-y-2">
                      {youOwe.map((balance) => (
                        <button
                          key={balance.userId}
                          onClick={() => handleUserSelect(balance.userId)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                            selectedUser === balance.userId
                              ? "border-primary-500 bg-primary-50"
                              : "border-neutral-100 hover:border-neutral-200"
                          )}
                        >
                          <div className="avatar-md">
                            <span>{getInitials(balance.user.name)}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-neutral-900">
                              {balance.user.name}
                            </p>
                          </div>
                          <span className="text-lg font-semibold text-danger-600">
                            {formatCurrency(Math.abs(balance.amount))}
                          </span>
                          {selectedUser === balance.userId && (
                            <Check className="w-5 h-5 text-primary-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Owed to You */}
                {owedToYou.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                      Owed to You
                    </p>
                    <div className="space-y-2">
                      {owedToYou.map((balance) => (
                        <button
                          key={balance.userId}
                          onClick={() => handleUserSelect(balance.userId)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                            selectedUser === balance.userId
                              ? "border-primary-500 bg-primary-50"
                              : "border-neutral-100 hover:border-neutral-200"
                          )}
                        >
                          <div className="avatar-md">
                            <span>{getInitials(balance.user.name)}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-neutral-900">
                              {balance.user.name}
                            </p>
                          </div>
                          <span className="text-lg font-semibold text-success-600">
                            {formatCurrency(balance.amount)}
                          </span>
                          {selectedUser === balance.userId && (
                            <Check className="w-5 h-5 text-primary-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amount */}
                {selectedUser && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-2 block">
                        Amount
                      </label>
                      <div className="relative">
                        <DollarSign className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="input pl-12 text-lg font-semibold"
                        />
                      </div>
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

                    {/* Payment Method */}
                    <div className="relative">
                      <label className="text-sm font-medium text-neutral-700 mb-2 block">
                        Payment Method
                      </label>
                      <button
                        onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                        className="input flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{selectedMethod?.icon}</span>
                          <span>{selectedMethod?.label}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "w-5 h-5 text-neutral-400 transition-transform",
                            showMethodDropdown && "rotate-180"
                          )}
                        />
                      </button>

                      <AnimatePresence>
                        {showMethodDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-100 shadow-card overflow-hidden"
                          >
                            {PAYMENT_METHODS.map((method) => (
                              <button
                                key={method.method}
                                onClick={() => {
                                  setPaymentMethod(method.method);
                                  setShowMethodDropdown(false);
                                }}
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors",
                                  paymentMethod === method.method &&
                                    "bg-primary-50"
                                )}
                              >
                                <span className="text-xl">{method.icon}</span>
                                <span className="text-sm font-medium">
                                  {method.label}
                                </span>
                                {paymentMethod === method.method && (
                                  <Check className="w-4 h-4 text-primary-500 ml-auto" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Note */}
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-2 block">
                        Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note..."
                        className="input"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50">
                <button onClick={handleClose} className="btn-ghost">
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedUser || !amount}
                  className="btn-primary"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Confirm */}
          {step === "confirm" && selectedBalance && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                <h2 className="text-xl font-bold text-neutral-900">
                  Confirm Payment
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-8">
                {/* Visual */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="text-center">
                    <div className="avatar-xl mx-auto mb-2">
                      <span>{getInitials(currentUser.name)}</span>
                    </div>
                    <p className="text-sm font-medium text-neutral-600">You</p>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500" />
                    <ArrowRight className="w-5 h-5 text-primary-500" />
                  </div>

                  <div className="text-center">
                    <div className="avatar-xl mx-auto mb-2">
                      <span>{getInitials(selectedBalance.user.name)}</span>
                    </div>
                    <p className="text-sm font-medium text-neutral-600">
                      {selectedBalance.user.name.split(" ")[0]}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-center mb-8">
                  <p className="text-sm text-neutral-500 mb-1">
                    {isPayingThem ? "You're paying" : "Recording payment from"}
                  </p>
                  <p className="text-4xl font-bold text-neutral-900">
                    {formatCurrency(parseFloat(amount))}
                  </p>
                </div>

                {/* Details */}
                <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Date</span>
                    <span className="font-medium text-neutral-900">
                      {new Date(date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Payment Method</span>
                    <span className="font-medium text-neutral-900 flex items-center gap-2">
                      <span>{selectedMethod?.icon}</span>
                      {selectedMethod?.label}
                    </span>
                  </div>
                  {note && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Note</span>
                      <span className="font-medium text-neutral-900">{note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50">
                <button onClick={() => setStep("select")} className="btn-ghost">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="btn-success"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm Payment
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 px-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-100 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                >
                  <CheckCircle2 className="w-10 h-10 text-success-500" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  Payment Recorded!
                </h2>
                <p className="text-neutral-500 mb-8">
                  {formatCurrency(parseFloat(amount))} has been recorded as paid
                  to {selectedBalance?.user.name}
                </p>

                <div className="flex items-center justify-center gap-3">
                  <button onClick={handleClose} className="btn-secondary">
                    Done
                  </button>
                  <button
                    onClick={() => {
                      setStep("select");
                      setSelectedUser("");
                      setAmount("");
                      setNote("");
                    }}
                    className="btn-primary"
                  >
                    <Sparkles className="w-4 h-4" />
                    Record Another
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Click outside dropdown to close */}
      {showMethodDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMethodDropdown(false)}
        />
      )}
    </div>
  );
}
