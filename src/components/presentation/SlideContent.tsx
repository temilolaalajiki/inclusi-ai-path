import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface BulletPointProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export const BulletPoint: React.FC<BulletPointProps> = ({ children, icon: Icon, className }) => (
  <li className={cn("flex items-start gap-3 text-sm sm:text-base text-foreground/90", className)}>
    {Icon ? (
      <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
    ) : (
      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
    )}
    <span>{children}</span>
  </li>
);

interface BulletListProps {
  children: React.ReactNode;
  className?: string;
}

export const BulletList: React.FC<BulletListProps> = ({ children, className }) => (
  <ul className={cn("space-y-3", className)}>
    {children}
  </ul>
);

interface TwoColumnProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

export const TwoColumn: React.FC<TwoColumnProps> = ({ left, right, className }) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 h-full", className)}>
    <div className="flex flex-col">{left}</div>
    <div className="flex flex-col">{right}</div>
  </div>
);

interface StatBoxProps {
  value: string;
  label: string;
  icon?: LucideIcon;
  className?: string;
}

export const StatBox: React.FC<StatBoxProps> = ({ value, label, icon: Icon, className }) => (
  <div className={cn(
    "bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/30 text-center",
    className
  )}>
    {Icon && <Icon className="w-6 h-6 text-primary mx-auto mb-2" />}
    <div className="text-2xl sm:text-3xl font-bold text-primary">{value}</div>
    <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
  </div>
);

interface HighlightBoxProps {
  title: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success";
  className?: string;
}

export const HighlightBox: React.FC<HighlightBoxProps> = ({ title, children, variant = "primary", className }) => {
  const variantStyles = {
    primary: "from-primary/20 to-primary/5 border-primary/30",
    secondary: "from-secondary/20 to-secondary/5 border-secondary/30",
    success: "from-success/20 to-success/5 border-success/30",
  };

  return (
    <div className={cn(
      "bg-gradient-to-br rounded-xl p-4 border",
      variantStyles[variant],
      className
    )}>
      <h4 className="font-semibold text-sm sm:text-base mb-2">{title}</h4>
      <div className="text-xs sm:text-sm text-muted-foreground">{children}</div>
    </div>
  );
};

interface QuoteBoxProps {
  quote: string;
  author?: string;
  className?: string;
}

export const QuoteBox: React.FC<QuoteBoxProps> = ({ quote, author, className }) => (
  <blockquote className={cn(
    "border-l-4 border-primary pl-4 py-2 italic text-muted-foreground",
    className
  )}>
    <p className="text-sm sm:text-base">"{quote}"</p>
    {author && <cite className="text-xs mt-2 block not-italic">— {author}</cite>}
  </blockquote>
);

interface DiagramBoxProps {
  title: string;
  items: { label: string; description?: string }[];
  type?: "flow" | "list";
  className?: string;
}

export const DiagramBox: React.FC<DiagramBoxProps> = ({ title, items, type = "list", className }) => (
  <div className={cn("bg-card/30 rounded-xl p-4 border border-border/20", className)}>
    <h4 className="font-semibold text-sm mb-3 text-center">{title}</h4>
    <div className={cn(
      type === "flow" ? "flex flex-wrap items-center justify-center gap-2" : "space-y-2"
    )}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {type === "flow" ? (
            <>
              <div className="bg-primary/10 rounded-lg px-3 py-2 text-xs text-center">
                <div className="font-medium">{item.label}</div>
                {item.description && <div className="text-muted-foreground mt-0.5">{item.description}</div>}
              </div>
              {index < items.length - 1 && <span className="text-primary">→</span>}
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                {index + 1}
              </span>
              <span>{item.label}</span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);
