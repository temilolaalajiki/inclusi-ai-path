import { StatCard } from "./StatCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface StatItem {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface DashboardHeaderProps {
  welcomeMessage: string;
  subtitle?: string;
  thirdLine?: string;
  stats: StatItem[];
}

export function DashboardHeader({ welcomeMessage, subtitle, thirdLine, stats }: DashboardHeaderProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="px-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
          {welcomeMessage}
        </h2>
        {subtitle && (
          <p className="text-sm md:text-base text-muted-foreground mt-1">{subtitle}</p>
        )}
        {thirdLine && (
          <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium">{thirdLine}</p>
        )}
      </div>

      {/* Mobile: Horizontal scrollable stats */}
      <div className="block md:hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-2">
            {stats.map((stat, index) => (
              <div key={index} className="w-[160px] flex-shrink-0">
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  variant={stat.variant}
                  trend={stat.trend}
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            variant={stat.variant}
            trend={stat.trend}
          />
        ))}
      </div>
    </div>
  );
}
