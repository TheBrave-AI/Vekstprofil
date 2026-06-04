"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AdminSidebar from "./AdminSidebar";
import { AdminShellContext } from "./AdminShellContext";
import SidebarToggle from "./SidebarToggle";
import type { SurveyItem } from "./AdminSidebar";

interface Props {
  active: SurveyItem[];
  submitted: SurveyItem[];
  draftCount: number;
  children: React.ReactNode;
}

export default function AdminShell({ active, submitted, draftCount, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AdminShellContext.Provider value={{ collapsed, onOpen: () => setCollapsed(false) }}>
      <div className="flex flex-1 gap-5 p-5 items-start">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 210, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="shrink-0 overflow-hidden"
            >
              <AdminSidebar
                active={active}
                submitted={submitted}
                draftCount={draftCount}
                onCollapse={() => setCollapsed(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <main className="flex-1 min-w-0 relative">
          {collapsed && (
            <div className="absolute top-0 left-0">
              <SidebarToggle />
            </div>
          )}
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </AdminShellContext.Provider>
  );
}
