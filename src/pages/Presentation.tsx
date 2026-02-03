import { DefensePresentation } from "@/components/presentation/DefensePresentation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Presentation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Defense Presentation</h1>
            <p className="text-sm text-muted-foreground">
              AI-Powered Decision-Making System for Enhancing Accessibility in Inclusive Education
            </p>
          </div>
        </div>
        
        <DefensePresentation />
      </main>
    </div>
  );
};

export default Presentation;
