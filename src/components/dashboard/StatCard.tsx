import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "destructive";
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  variant = "default",
  className 
}: StatCardProps) {
  const variantStyles = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <Card className={cn(
      "shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 touch-manipulation",
      className
    )}>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
            <p className={cn("text-lg sm:text-2xl md:text-3xl font-bold", variantStyles[variant])}>
              {value}
            </p>
            {trend && (
              <p className={cn(
                "text-[10px] sm:text-xs",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                <span className="hidden sm:inline"> from last week</span>
              </p>
            )}
          </div>
          <div className={cn(
            "p-2 sm:p-3 rounded-full bg-muted shrink-0",
            variantStyles[variant]
          )}>
            <span className="[&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">
              {icon}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
