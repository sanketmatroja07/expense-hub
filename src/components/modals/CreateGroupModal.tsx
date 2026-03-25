"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  UserPlus,
  Trash2,
  Check,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import { cn, getInitials, generateId } from "@/lib/utils";
import { GROUP_TYPES, users } from "@/lib/mock-data";
import { GroupType } from "@/lib/types";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "Australian Dollar" },
];

const emojis = ["🏠", "🏖️", "🍕", "🎬", "✈️", "👥", "💼", "🎮", "🎉", "🚗", "🎸", "⚽"];

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InvitedMember {
  id: string;
  name: string;
  email: string;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState("👥");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([]);
  const [groupType, setGroupType] = useState<GroupType>("friends");
  const [currency, setCurrency] = useState("USD");
  const [simplifyDebts, setSimplifyDebts] = useState(true);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof users>([]);

  const handleEmailChange = (value: string) => {
    setMemberEmail(value);
    if (value.length > 0) {
      const filtered = users.filter(
        (u) =>
          (u.email.toLowerCase().includes(value.toLowerCase()) ||
            u.name.toLowerCase().includes(value.toLowerCase())) &&
          !invitedMembers.find((m) => m.id === u.id)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addMember = (user?: typeof users[0]) => {
    if (user) {
      setInvitedMembers((prev) => [
        ...prev,
        { id: user.id, name: user.name, email: user.email },
      ]);
      setMemberEmail("");
      setSuggestions([]);
    } else if (memberEmail && memberEmail.includes("@")) {
      setInvitedMembers((prev) => [
        ...prev,
        { id: generateId(), name: memberEmail.split("@")[0], email: memberEmail },
      ]);
      setMemberEmail("");
    }
  };

  const removeMember = (id: string) => {
    setInvitedMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    onClose();
  };

  const selectedCurrency = currencies.find((c) => c.code === currency);

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
          <h2 className="text-xl font-bold text-neutral-900">Create New Group</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Group Image/Emoji */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {image ? (
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden">
                  <img
                    src={image}
                    alt="Group"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-4xl cursor-pointer hover:from-primary-200 hover:to-accent-200 transition-all"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  {selectedEmoji}
                </div>
              )}

              {/* Emoji Picker */}
              <AnimatePresence>
                {showEmojiPicker && !image && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-card border border-neutral-100 z-50"
                  >
                    <div className="grid grid-cols-6 gap-2">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setSelectedEmoji(emoji);
                            setShowEmojiPicker(false);
                          }}
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-xl hover:bg-neutral-100 transition-colors",
                            selectedEmoji === emoji && "bg-primary-100"
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1">
              <p className="text-sm text-neutral-500 mb-2">
                Click emoji to change or upload an image
              </p>
              <label className="btn-secondary text-sm py-2 cursor-pointer inline-flex">
                <Upload className="w-4 h-4" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              className="input"
            />
          </div>

          {/* Group Type */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-3 block">
              Group Type
            </label>
            <div className="flex flex-wrap gap-2">
              {GROUP_TYPES.map((gt) => (
                <button
                  key={gt.type}
                  onClick={() => setGroupType(gt.type)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl border-2 flex items-center gap-2 transition-all",
                    groupType === gt.type
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-neutral-100 hover:border-neutral-200 text-neutral-600"
                  )}
                >
                  <span>{gt.emoji}</span>
                  <span className="text-sm font-medium">{gt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Members */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Add Members
            </label>
            <div className="relative">
              <UserPlus className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memberEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMember();
                  }
                }}
                placeholder="Enter email or name"
                className="input pl-12"
              />

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-100 shadow-card overflow-hidden z-50"
                  >
                    {suggestions.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => addMember(user)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="avatar-sm">
                          <span>{getInitials(user.name)}</span>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-neutral-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-neutral-500">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Invited Members List */}
            {invitedMembers.length > 0 && (
              <div className="mt-4 space-y-2">
                {invitedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50"
                  >
                    <div className="avatar-sm">
                      <span>{getInitials(member.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {member.email}
                      </p>
                    </div>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-2 rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      <X className="w-4 h-4 text-neutral-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Currency */}
          <div className="relative">
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Currency
            </label>
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="input flex items-center justify-between"
            >
              <span>
                {selectedCurrency?.symbol} {selectedCurrency?.code} -{" "}
                {selectedCurrency?.name}
              </span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-neutral-400 transition-transform",
                  showCurrencyDropdown && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {showCurrencyDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-100 shadow-card overflow-hidden max-h-48 overflow-y-auto"
                >
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCurrency(c.code);
                        setShowCurrencyDropdown(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors",
                        currency === c.code && "bg-primary-50"
                      )}
                    >
                      <span className="text-sm">
                        {c.symbol} {c.code} - {c.name}
                      </span>
                      {currency === c.code && (
                        <Check className="w-4 h-4 text-primary-500" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Simplify Debts Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50">
            <div>
              <p className="text-sm font-medium text-neutral-900">
                Simplify Debts
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Automatically calculate optimal payment solution
              </p>
            </div>
            <button
              onClick={() => setSimplifyDebts(!simplifyDebts)}
              className={cn(
                "relative w-12 h-7 rounded-full transition-colors",
                simplifyDebts ? "bg-primary-500" : "bg-neutral-300"
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all",
                  simplifyDebts ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name || isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Group"
            )}
          </button>
        </div>
      </motion.div>

      {/* Click outside dropdowns to close */}
      {(showCurrencyDropdown || showEmojiPicker || suggestions.length > 0) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCurrencyDropdown(false);
            setShowEmojiPicker(false);
            setSuggestions([]);
          }}
        />
      )}
    </div>
  );
}
