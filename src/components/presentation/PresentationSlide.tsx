import React from "react";
import { cn } from "@/lib/utils";

interface PresentationSlideProps {
  slideNumber: number;
  totalSlides: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: "title" | "content" | "section" | "conclusion";
  className?: string;
}

export const PresentationSlide: React.FC<PresentationSlideProps> = ({
  slideNumber,
  totalSlides,
  title,
  subtitle,
  children,
  variant = "content",
  className,
}) => {
  const isTitle = variant === "title";
  const isSection = variant === "section";
  const isConclusion = variant === "conclusion";

  return (
    <div
      className={cn(
        "relative w-full aspect-[16/9] bg-gradient-to-br from-background via-card to-muted/30 rounded-xl shadow-2xl border border-border/50 overflow-hidden print:break-after-page print:shadow-none print:rounded-none print:border-0",
        className
      )}
      id={`slide-${slideNumber}`}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-secondary/10 to-transparent rounded-tr-full" />
      
      {/* Logo/Branding */}
      <div className="absolute top-4 left-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">IE</span>
        </div>
        <span className="text-xs text-muted-foreground font-medium hidden sm:block">Inclusive Education AI</span>
      </div>

      {/* Content Container */}
      <div className={cn(
        "relative h-full flex flex-col p-6 sm:p-8 pt-16",
        isTitle && "justify-center items-center text-center pt-8",
        isSection && "justify-center items-center text-center",
        isConclusion && "justify-center"
      )}>
        {/* Title */}
        <h2 className={cn(
          "font-bold text-foreground leading-tight",
          isTitle ? "text-2xl sm:text-4xl md:text-5xl mb-4" : "text-xl sm:text-2xl md:text-3xl mb-4",
          isSection && "text-2xl sm:text-3xl md:text-4xl"
        )}>
          {title}
        </h2>
        
        {subtitle && (
          <p className={cn(
            "text-muted-foreground",
            isTitle ? "text-base sm:text-xl md:text-2xl mb-8" : "text-sm sm:text-base mb-4"
          )}>
            {subtitle}
          </p>
        )}

        {/* Slide Content */}
        <div className={cn(
          "flex-1 overflow-hidden",
          isTitle && "flex flex-col items-center justify-center",
          !isTitle && !isSection && "mt-2"
        )}>
          {children}
        </div>
      </div>

      {/* Slide Number */}
      <div className="absolute bottom-4 right-6 text-xs text-muted-foreground font-medium">
        {slideNumber} / {totalSlides}
      </div>
    </div>
  );
};
