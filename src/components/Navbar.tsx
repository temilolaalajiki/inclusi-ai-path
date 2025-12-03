import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, LogOut, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export const Navbar = () => {
  const { user, userRole, userProfile, loading, signOut } = useAuth();

  const getInitials = () => {
    if (userProfile?.firstName || userProfile?.lastName) {
      return `${userProfile.firstName?.[0] ?? ''}${userProfile.lastName?.[0] ?? ''}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() ?? '?';
  };

  const getDisplayName = () => {
    if (userProfile?.firstName || userProfile?.lastName) {
      return `${userProfile.firstName ?? ''} ${userProfile.lastName ?? ''}`.trim();
    }
    return user?.email?.split('@')[0] ?? '';
  };
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
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{getDisplayName()}</span>
                      {userRole && (
                        <Badge variant="secondary" className="capitalize text-xs py-0">
                          {userRole}
                        </Badge>
                      )}
                    </div>
                    <Button size="sm" variant="outline" onClick={handleSignOut} aria-label="Sign out of your account">
                      <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                      Sign Out
                    </Button>
                  </div>
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
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{getDisplayName()}</span>
                            {userRole && (
                              <Badge variant="secondary" className="capitalize w-fit text-xs py-0">
                                {userRole}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button className="w-full" variant="outline" onClick={handleSignOut} aria-label="Sign out of your account">
                          <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                          Sign Out
                        </Button>
                      </div>
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
