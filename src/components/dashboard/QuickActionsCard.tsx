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
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "outline"}
              onClick={action.onClick}
              disabled={action.disabled}
              className="w-full justify-start gap-2"
            >
              {action.icon}
              <span className="truncate">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
