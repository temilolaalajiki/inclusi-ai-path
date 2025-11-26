import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, LogOut, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export const Navbar = () => {
  const { user, userRole, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users away from auth page
  useEffect(() => {
    if (!loading && user && window.location.pathname === '/auth') {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl" aria-label="Go to home page">
            <div className="bg-primary rounded-lg p-2">
              <GraduationCap className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="hidden sm:inline">Inclusive Education AI</span>
            <span className="sm:hidden">IEAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!loading && (
              <>
                {user ? (
                  <>
                    {userRole && (
                      <Badge variant="secondary" className="capitalize">
                        {userRole}
                      </Badge>
                    )}
                    <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                      Home
                    </Link>
                    {userRole === 'learner' && (
                      <Link to="/learner" className="text-sm font-medium hover:text-primary transition-colors">
                        Dashboard
                      </Link>
                    )}
                    {userRole === 'teacher' && (
                      <Link to="/teacher" className="text-sm font-medium hover:text-primary transition-colors">
                        Dashboard
                      </Link>
                    )}
                    {userRole === 'admin' && (
                      <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                        Dashboard
                      </Link>
                    )}
                    <Button size="sm" variant="outline" onClick={handleSignOut} aria-label="Sign out of your account">
                      <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link to="/auth">
                    <Button size="sm">Sign In</Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-6 w-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                {!loading && (
                  <>
                    {user ? (
                      <>
                        {userRole && (
                          <Badge variant="secondary" className="capitalize w-fit">
                            {userRole}
                          </Badge>
                        )}
                        <Link to="/" className="text-lg font-medium hover:text-primary transition-colors">
                          Home
                        </Link>
                        {userRole === 'learner' && (
                          <Link to="/learner" className="text-lg font-medium hover:text-primary transition-colors">
                            Dashboard
                          </Link>
                        )}
                        {userRole === 'teacher' && (
                          <Link to="/teacher" className="text-lg font-medium hover:text-primary transition-colors">
                            Dashboard
                          </Link>
                        )}
                        {userRole === 'admin' && (
                          <Link to="/admin" className="text-lg font-medium hover:text-primary transition-colors">
                            Dashboard
                          </Link>
                        )}
                        <Button className="w-full mt-4" variant="outline" onClick={handleSignOut} aria-label="Sign out of your account">
                          <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Link to="/auth">
                        <Button className="w-full mt-4">Sign In</Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
