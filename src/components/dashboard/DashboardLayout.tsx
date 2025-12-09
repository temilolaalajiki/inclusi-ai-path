import * as React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { EnhancedAccessibilityToolbar } from "@/components/EnhancedAccessibilityToolbar";
import NotificationCenter from "@/components/NotificationCenter";

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, sidebar, title, subtitle }: DashboardLayoutProps) {
  const [defaultOpen] = React.useState(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored !== "true"; // Default to open, collapsed if stored as "true"
  });

  const handleOpenChange = (open: boolean) => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, (!open).toString());
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen} onOpenChange={handleOpenChange}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-muted/20 to-background">
        {sidebar}
        <SidebarInset className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground hidden sm:block">{subtitle}</p>
              )}
            </div>
            <NotificationCenter />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
      <EnhancedAccessibilityToolbar />
    </SidebarProvider>
  );
}
