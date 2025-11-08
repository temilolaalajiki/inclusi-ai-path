import { Loader2, GraduationCap } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
      <div className="text-center space-y-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <GraduationCap className="h-16 w-16 text-primary/20 mx-auto" />
          </div>
          <GraduationCap className="h-16 w-16 text-primary mx-auto relative" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Loading Your Dashboard
          </h2>
          <p className="text-muted-foreground">Please wait while we prepare your experience...</p>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Authenticating and loading data</span>
        </div>
      </div>
    </div>
  );
};
