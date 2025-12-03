import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MobileTabs = TabsPrimitive.Root;

interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface MobileTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  tabs: TabItem[];
  value?: string;
  onValueChange?: (value: string) => void;
}

const MobileTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  MobileTabsListProps
>(({ className, tabs, value, onValueChange, ...props }, ref) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="w-full mb-4">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-full bg-muted border-border">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border z-50">
            {tabs.map((tab) => (
              <SelectItem key={tab.value} value={tab.value} className="cursor-pointer">
                <span className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-hide w-full max-w-full",
        className
      )}
      {...props}
    >
      {tabs.map((tab) => (
        <TabsPrimitive.Trigger
          key={tab.value}
          value={tab.value}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "gap-2 flex-shrink-0"
          )}
        >
          {tab.icon}
          {tab.label}
        </TabsPrimitive.Trigger>
      ))}
    </TabsPrimitive.List>
  );
});
MobileTabsList.displayName = "MobileTabsList";

const MobileTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
MobileTabsContent.displayName = "MobileTabsContent";

export { MobileTabs, MobileTabsList, MobileTabsContent };
