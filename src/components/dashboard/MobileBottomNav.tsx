import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface MobileBottomNavProps {
  items: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileBottomNav({ items, activeTab, onTabChange }: MobileBottomNavProps) {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  // Show max 5 items on mobile bottom nav
  const visibleItems = items.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {visibleItems.map((item) => (
          <button
            key={item.value}
            onClick={() => onTabChange(item.value)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full px-1 py-2 touch-manipulation transition-colors",
              "active:bg-muted/50 rounded-lg",
              activeTab === item.value
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className={cn(
              "[&>svg]:h-5 [&>svg]:w-5 transition-transform",
              activeTab === item.value && "scale-110"
            )}>
              {item.icon}
            </span>
            <span className={cn(
              "text-[10px] mt-1 font-medium truncate max-w-full",
              activeTab === item.value && "font-semibold"
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}