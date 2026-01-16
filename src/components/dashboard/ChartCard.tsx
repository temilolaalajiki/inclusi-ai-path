import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function ChartCard({ 
  title, 
  description, 
  children, 
  className,
  headerAction 
}: ChartCardProps) {
  return (
    <Card className={cn("shadow-lg overflow-hidden", className)}>
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm sm:text-base md:text-lg truncate">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs sm:text-sm line-clamp-2">{description}</CardDescription>
            )}
          </div>
          {headerAction && (
            <div className="shrink-0">{headerAction}</div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
        <div className="w-full overflow-x-auto">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
