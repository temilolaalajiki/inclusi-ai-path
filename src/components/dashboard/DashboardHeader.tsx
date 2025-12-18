import { StatCard } from "./StatCard";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {welcomeMessage}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
        {thirdLine && (
          <p className="text-muted-foreground mt-1 font-medium">{thirdLine}</p>
        )}
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
