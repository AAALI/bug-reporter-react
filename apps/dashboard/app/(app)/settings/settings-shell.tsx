"use client";

import { useState } from "react";
import {
  IconUser,
  IconBuilding,
  IconFolder,
  IconPlug,
  IconAlertTriangle,
} from "@tabler/icons-react";

const tabs = [
  { id: "profile", label: "Profile", icon: IconUser },
  { id: "organization", label: "Organization", icon: IconBuilding },
  { id: "projects", label: "Projects", icon: IconFolder },
  { id: "integrations", label: "Integrations", icon: IconPlug },
  { id: "danger", label: "Danger Zone", icon: IconAlertTriangle },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function SettingsShell({ children }: { children: React.ReactNode[] }) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <div className="mt-6 flex gap-6">
      {/* Sidebar */}
      <nav className="w-52 shrink-0">
        <ul className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
                  } ${tab.id === "danger" ? "mt-4 text-red-500 hover:text-red-600" : ""}`}
                >
                  <Icon
                    className={`size-4 ${
                      isActive
                        ? tab.id === "danger"
                          ? "text-red-500"
                          : "text-slate-700"
                        : ""
                    }`}
                  />
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {Array.isArray(children) && children[tabs.findIndex((t) => t.id === activeTab)]}
      </div>
    </div>
  );
}
