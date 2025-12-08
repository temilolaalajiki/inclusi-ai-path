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
      "shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5",
      className
    )}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn("text-2xl md:text-3xl font-bold", variantStyles[variant])}>
              {value}
            </p>
            {trend && (
              <p className={cn(
                "text-xs",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}% from last week
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-full bg-muted",
            variantStyles[variant]
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
