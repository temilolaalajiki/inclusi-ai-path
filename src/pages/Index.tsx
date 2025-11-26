import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { EnhancedAccessibilityToolbar } from "@/components/EnhancedAccessibilityToolbar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { GraduationCap, Users, Brain, TrendingUp, BookOpen, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-education.jpg";

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  const handleRoleNavigation = (role: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (userRole !== role) {
      return; // User doesn't have permission
    }
    
    navigate(`/${role}`);
  };

  const roles = [
    {
      title: "Learner Dashboard",
      description: "Track your progress, receive AI-powered learning recommendations, and access personalized support tools.",
      icon: GraduationCap,
      role: "learner",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Teacher Dashboard",
      description: "Upload student data, view AI insights, and implement evidence-based interventions for inclusive education.",
      icon: Users,
      role: "teacher",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Administrator Analytics",
      description: "Monitor system-wide metrics, track accessibility improvements, and generate comprehensive reports.",
      icon: TrendingUp,
      role: "admin",
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Advanced machine learning identifies learning barriers and suggests personalized interventions.",
    },
    {
      icon: BookOpen,
      title: "Personalized Learning",
      description: "Tailored recommendations based on individual learning styles and accessibility needs.",
    },
    {
      icon: Shield,
      title: "GDPR & UNESCO Compliant",
      description: "Secure, encrypted data storage following international educational data protection standards.",
    },
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      
      {/* Hero Section */}
      <main id="main-content">
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage}
            alt="Inclusive education environment" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              AI-Powered Inclusive Education
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Enhance accessibility and make evidence-based decisions to create truly inclusive learning environments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!loading && (
                user ? (
                  <Button size="lg" onClick={() => handleRoleNavigation(userRole || 'learner')}>
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button size="lg" asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                )
              )}
              <Button size="lg" variant="outline" onClick={() => handleRoleNavigation('admin')}>
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Role</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access tailored dashboards designed for your specific needs in the inclusive education ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {roles.map((role) => (
              <Card key={role.title} className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className={`${role.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <role.icon className={`h-6 w-6 ${role.color}`} aria-hidden="true" />
                  </div>
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription className="text-base">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleRoleNavigation(role.role)}
                    disabled={loading || (user && userRole !== role.role)}
                  >
                    {!user ? 'Sign In to Access' : userRole === role.role ? 'Access Dashboard' : 'Restricted Access'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by advanced AI to support educators and learners in creating accessible education for all
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="max-w-4xl mx-auto shadow-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl mb-4">
                Ready to Transform Education?
              </CardTitle>
              <CardDescription className="text-lg">
                Join educators worldwide in creating truly inclusive learning environments with AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              {!loading && (
                user ? (
                  <Button size="lg" onClick={() => handleRoleNavigation(userRole || 'learner')}>
                    Go to Your Dashboard
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild>
                      <Link to="/auth">Start as Teacher</Link>
                    </Button>
                    <Button size="lg" variant="secondary" asChild>
                      <Link to="/auth">Start as Learner</Link>
                    </Button>
                  </>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      </main>

      <EnhancedAccessibilityToolbar />
    </div>
  );
};

export default Index;
