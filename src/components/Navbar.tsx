import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Navbar = () => {
  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-primary rounded-lg p-2">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline">Inclusive Education AI</span>
            <span className="sm:hidden">IEAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/learner" className="text-sm font-medium hover:text-primary transition-colors">
              Learner
            </Link>
            <Link to="/teacher" className="text-sm font-medium hover:text-primary transition-colors">
              Teacher
            </Link>
            <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
              Administrator
            </Link>
            <Button size="sm">Sign In</Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/learner" className="text-lg font-medium hover:text-primary transition-colors">
                  Learner Dashboard
                </Link>
                <Link to="/teacher" className="text-lg font-medium hover:text-primary transition-colors">
                  Teacher Dashboard
                </Link>
                <Link to="/admin" className="text-lg font-medium hover:text-primary transition-colors">
                  Administrator Dashboard
                </Link>
                <Button className="w-full mt-4">Sign In</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
