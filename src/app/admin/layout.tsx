"use client";

import React, { useState } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ThemeCustomizerModal } from "@/components/cms/ThemeCustomizerModal";
import { ManualAttendanceModal } from "@/components/modals/ManualAttendanceModal";
import { AddUserModal } from "@/components/modals/AddUserModal";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isManualAttendanceOpen, setIsManualAttendanceOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors text-slate-900 dark:text-slate-100">
      {/* Sidenav Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          setMobileOpen={setMobileOpen}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenManualAttendanceModal={() => setIsManualAttendanceOpen(true)}
          onOpenAddUserModal={() => setIsAddUserOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1920px] mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Modals */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
      <ManualAttendanceModal
        isOpen={isManualAttendanceOpen}
        onClose={() => setIsManualAttendanceOpen(false)}
      />
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
      />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ThemeProvider>
  );
}
