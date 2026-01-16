import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
  disabled?: boolean;
}

interface QuickActionsCardProps {
  title: string;
  description?: string;
  actions: QuickAction[];
  className?: string;
}

export function QuickActionsCard({ 
  title, 
  description, 
  actions, 
  className 
}: QuickActionsCardProps) {
  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader className="pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "outline"}
              onClick={action.onClick}
              disabled={action.disabled}
              className="w-full justify-start gap-2 h-10 sm:h-11 text-xs sm:text-sm touch-manipulation active:scale-[0.98] transition-transform"
            >
              <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{action.icon}</span>
              <span className="truncate">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
