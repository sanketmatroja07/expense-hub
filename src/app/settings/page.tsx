"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  User,
  CreditCard,
  Bell,
  Lock,
  Palette,
  ChevronRight,
  Camera,
  Plus,
  Trash2,
  Check,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Navbar, MobileNav } from "@/components/layout";
import { AddExpenseModal } from "@/components/modals";
import { cn, getInitials } from "@/lib/utils";
import { useExpenseHub } from "@/lib/expense-hub-store";

type SettingsTab =
  | "profile"
  | "payments"
  | "notifications"
  | "privacy"
  | "appearance";

const paymentMethods = [
  { id: "1", type: "bank", name: "Chase Bank", last4: "4242", primary: true },
  { id: "2", type: "paypal", name: "PayPal", email: "alex@example.com" },
];

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const { currentUser, preferences, updateCurrentUser, updatePreferences } =
    useExpenseHub();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [theme, setTheme] = useState<"light" | "dark" | "auto">(
    preferences.theme
  );

  // Profile state
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [avatar, setAvatar] = useState<string | null>(null);

  // Notification settings
  const [notifications, setNotifications] = useState({
    ...preferences.notifications,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    ...preferences.privacy,
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (
      requestedTab === "profile" ||
      requestedTab === "payments" ||
      requestedTab === "notifications" ||
      requestedTab === "privacy" ||
      requestedTab === "appearance"
    ) {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    setTheme(preferences.theme);
    setNotifications(preferences.notifications);
    setPrivacy(preferences.privacy);
  }, [preferences]);

  const updateNotificationPreference = (
    key: keyof typeof notifications,
    value: boolean
  ) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: value };
      updatePreferences({ notifications: next });
      return next;
    });
  };

  const updatePrivacyPreference = (
    updates: Partial<typeof privacy>
  ) => {
    setPrivacy((prev) => {
      const next = { ...prev, ...updates };
      updatePreferences({ privacy: next });
      return next;
    });
  };

  const selectTheme = (nextTheme: "light" | "dark" | "auto") => {
    setTheme(nextTheme);
    updatePreferences({ theme: nextTheme });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="pt-20 pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
            <p className="text-neutral-500 mt-1">Manage your account preferences</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <nav className="lg:w-64 flex-shrink-0">
              <div className="card p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      activeTab === tab.id
                        ? "bg-primary-50 text-primary-700"
                        : "text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 ml-auto transition-transform",
                        activeTab === tab.id && "rotate-90"
                      )}
                    />
                  </button>
                ))}
              </div>
            </nav>

            {/* Content */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="card p-6"
                  >
                    <h2 className="text-lg font-semibold text-neutral-900 mb-6">
                      Profile Information
                    </h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative">
                        <div className="avatar-xl">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{getInitials(name)}</span>
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors shadow-lg">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{name}</p>
                        <p className="text-sm text-neutral-500">{email}</p>
                      </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-5">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-2 block">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-2 block">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          disabled
                          readOnly
                          className="input bg-neutral-100 text-neutral-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-neutral-500 mt-2">
                          Your sign-in email is managed through your authenticated account.
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-2 block">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="input"
                        />
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-neutral-100 flex justify-end">
                      <button
                        onClick={() =>
                          updateCurrentUser({
                            name: name.trim(),
                            email: email.trim(),
                            phone: phone.trim(),
                            avatar: avatar || undefined,
                          })
                        }
                        className="btn-primary"
                      >
                        Save Changes
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Payment Methods Tab */}
                {activeTab === "payments" && (
                  <motion.div
                    key="payments"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="card p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-neutral-900">
                        Payment Methods
                      </h2>
                      <button className="btn-secondary text-sm py-2">
                        <Plus className="w-4 h-4" />
                        Add Method
                      </button>
                    </div>

                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 hover:border-neutral-200 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
                            {method.type === "bank" ? (
                              <span className="text-2xl">🏦</span>
                            ) : (
                              <span className="text-2xl">💳</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-neutral-900">
                                {method.name}
                              </p>
                              {method.primary && (
                                <span className="badge-primary">Primary</span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-500">
                              {method.last4
                                ? `•••• ${method.last4}`
                                : method.email}
                            </p>
                          </div>
                          <button className="p-2 rounded-lg hover:bg-danger-50 text-neutral-400 hover:text-danger-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
                      <p className="text-sm text-neutral-600">
                        💡 Payment methods are used to record settlements. We
                        don't process payments directly.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="card p-6"
                  >
                    <h2 className="text-lg font-semibold text-neutral-900 mb-6">
                      Notification Preferences
                    </h2>

                    {/* Email Notifications */}
                    <div className="mb-8">
                      <h3 className="text-sm font-medium text-neutral-900 mb-4">
                        Email Notifications
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            key: "emailExpenses",
                            label: "New expenses",
                            description: "Get notified when someone adds an expense",
                          },
                          {
                            key: "emailPayments",
                            label: "Payments",
                            description: "Get notified when you receive a payment",
                          },
                          {
                            key: "emailWeeklySummary",
                            label: "Weekly summary",
                            description: "Receive a weekly spending summary",
                          },
                        ].map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium text-neutral-900">
                                {item.label}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {item.description}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                updateNotificationPreference(
                                  item.key as keyof typeof notifications,
                                  !notifications[
                                    item.key as keyof typeof notifications
                                  ]
                                )
                              }
                              className={cn(
                                "relative w-12 h-7 rounded-full transition-colors",
                                notifications[item.key as keyof typeof notifications]
                                  ? "bg-primary-500"
                                  : "bg-neutral-300"
                              )}
                            >
                              <div
                                className={cn(
                                  "absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all",
                                  notifications[
                                    item.key as keyof typeof notifications
                                  ]
                                    ? "left-6"
                                    : "left-1"
                                )}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900 mb-4">
                        Push Notifications
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            key: "pushExpenses",
                            label: "New expenses",
                            description: "Push notification for new expenses",
                          },
                          {
                            key: "pushPayments",
                            label: "Payments",
                            description: "Push notification for payments",
                          },
                          {
                            key: "pushReminders",
                            label: "Reminders",
                            description: "Settlement reminders",
                          },
                        ].map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium text-neutral-900">
                                {item.label}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {item.description}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                updateNotificationPreference(
                                  item.key as keyof typeof notifications,
                                  !notifications[
                                    item.key as keyof typeof notifications
                                  ]
                                )
                              }
                              className={cn(
                                "relative w-12 h-7 rounded-full transition-colors",
                                notifications[item.key as keyof typeof notifications]
                                  ? "bg-primary-500"
                                  : "bg-neutral-300"
                              )}
                            >
                              <div
                                className={cn(
                                  "absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all",
                                  notifications[
                                    item.key as keyof typeof notifications
                                  ]
                                    ? "left-6"
                                    : "left-1"
                                )}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Privacy Tab */}
                {activeTab === "privacy" && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="card p-6"
                  >
                    <h2 className="text-lg font-semibold text-neutral-900 mb-6">
                      Privacy Settings
                    </h2>

                    <div className="space-y-6">
                      {/* Who can add you to groups */}
                      <div>
                        <p className="font-medium text-neutral-900 mb-3">
                          Who can add you to groups?
                        </p>
                        <div className="space-y-2">
                          {[
                            { value: "everyone", label: "Everyone" },
                            { value: "contacts", label: "Contacts only" },
                            { value: "none", label: "No one (invitation required)" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                updatePrivacyPreference({
                                  allowAddToGroups:
                                    option.value as typeof privacy.allowAddToGroups,
                                })
                              }
                              className={cn(
                                "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                                privacy.allowAddToGroups === option.value
                                  ? "border-primary-500 bg-primary-50"
                                  : "border-neutral-100 hover:border-neutral-200"
                              )}
                            >
                              <span className="text-sm font-medium">
                                {option.label}
                              </span>
                              {privacy.allowAddToGroups === option.value && (
                                <Check className="w-5 h-5 text-primary-500" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Other privacy settings */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-neutral-900">
                              Show expense details to group members
                            </p>
                            <p className="text-sm text-neutral-500">
                              Allow others to see your expense descriptions
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              updatePrivacyPreference({
                                showExpenseDetails: !privacy.showExpenseDetails,
                              })
                            }
                            className={cn(
                              "relative w-12 h-7 rounded-full transition-colors",
                              privacy.showExpenseDetails
                                ? "bg-primary-500"
                                : "bg-neutral-300"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all",
                                privacy.showExpenseDetails ? "left-6" : "left-1"
                              )}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-neutral-900">
                              Show activity status
                            </p>
                            <p className="text-sm text-neutral-500">
                              Let others see when you were last active
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              updatePrivacyPreference({
                                showActivity: !privacy.showActivity,
                              })
                            }
                            className={cn(
                              "relative w-12 h-7 rounded-full transition-colors",
                              privacy.showActivity
                                ? "bg-primary-500"
                                : "bg-neutral-300"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all",
                                privacy.showActivity ? "left-6" : "left-1"
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Appearance Tab */}
                {activeTab === "appearance" && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="card p-6"
                  >
                    <h2 className="text-lg font-semibold text-neutral-900 mb-6">
                      Appearance
                    </h2>

                    {/* Theme */}
                    <div className="mb-8">
                      <p className="font-medium text-neutral-900 mb-4">Theme</p>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => selectTheme("light")}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all text-center",
                            theme === "light"
                              ? "border-primary-500 bg-primary-50"
                              : "border-neutral-100 hover:border-neutral-200"
                          )}
                        >
                          <Sun className="w-6 h-6 mx-auto mb-2 text-warning-500" />
                          <p className="text-sm font-medium">Light</p>
                        </button>
                        <button
                          onClick={() => selectTheme("dark")}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all text-center",
                            theme === "dark"
                              ? "border-primary-500 bg-primary-50"
                              : "border-neutral-100 hover:border-neutral-200"
                          )}
                        >
                          <Moon className="w-6 h-6 mx-auto mb-2 text-accent-500" />
                          <p className="text-sm font-medium">Dark</p>
                        </button>
                        <button
                          onClick={() => selectTheme("auto")}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all text-center",
                            theme === "auto"
                              ? "border-primary-500 bg-primary-50"
                              : "border-neutral-100 hover:border-neutral-200"
                          )}
                        >
                          <Monitor className="w-6 h-6 mx-auto mb-2 text-neutral-500" />
                          <p className="text-sm font-medium">Auto</p>
                        </button>
                      </div>
                    </div>

                    {/* Other settings */}
                    <div className="space-y-5">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-2 block">
                          Currency Format
                        </label>
                        <select className="select">
                          <option>$ USD - US Dollar</option>
                          <option>€ EUR - Euro</option>
                          <option>£ GBP - British Pound</option>
                          <option>₹ INR - Indian Rupee</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-2 block">
                          Date Format
                        </label>
                        <select className="select">
                          <option>MM/DD/YYYY</option>
                          <option>DD/MM/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-2 block">
                          Language
                        </label>
                        <select className="select">
                          <option>English (US)</option>
                          <option>English (UK)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
    </div>
  );
}
