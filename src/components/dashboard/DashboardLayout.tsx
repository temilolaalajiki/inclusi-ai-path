import * as React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { EnhancedAccessibilityToolbar } from "@/components/EnhancedAccessibilityToolbar";
import NotificationCenter from "@/components/NotificationCenter";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, sidebar, title, subtitle }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  // Default to expanded on desktop, collapsed on mobile
  const [open, setOpen] = React.useState(!isMobile);

  React.useEffect(() => {
    // Update sidebar state when screen size changes
    setOpen(!isMobile);
  }, [isMobile]);

  React.useEffect(() => {
    if (!isMobile) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, "false");
    }
  }, [isMobile]);

  const handleOpenChange = React.useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!isMobile) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, (!nextOpen).toString());
    }
  }, [isMobile]);

  return (
    <SidebarProvider open={open} onOpenChange={handleOpenChange}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-muted/20 to-background">
        {sidebar}
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-10 flex h-14 md:h-16 items-center gap-2 md:gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 md:px-6 safe-area-inset">
            <SidebarTrigger className="h-9 w-9 shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground hidden sm:block truncate">{subtitle}</p>
              )}
            </div>
            <NotificationCenter />
          </header>
          <main className="flex-1 overflow-auto p-3 md:p-6 pb-20 md:pb-6">
            {children}
          </main>
        </SidebarInset>
      </div>
      <EnhancedAccessibilityToolbar />
    </SidebarProvider>
  );
}
