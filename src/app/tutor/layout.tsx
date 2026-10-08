"use client";

import React, { useState } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { TutorSidebar } from "@/components/tutor/TutorSidebar";
import { TutorHeader } from "@/components/tutor/TutorHeader";
import { TutorThemeModal } from "@/components/cms/TutorThemeModal";

function TutorLayoutContent({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors text-slate-900 dark:text-slate-100">
      {/* Sidenav Sidebar */}
      <TutorSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TutorHeader
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1920px] mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Modal Pengaturan Tema & Warna Akses Tentor */}
      <TutorThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
}

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <TutorLayoutContent>{children}</TutorLayoutContent>
    </ThemeProvider>
  );
}
