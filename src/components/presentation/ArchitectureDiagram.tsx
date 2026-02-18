import React from "react";
import { cn } from "@/lib/utils";
import { 
  Brain, Database, Globe, Server, Shield, Users, Eye, Target,
  BarChart3, BookOpen, Settings, FileText, Lock, Layers, Bell,
  GraduationCap, Monitor, Smartphone, CheckCircle, AlertTriangle,
  TrendingUp, Clock, Zap, ArrowRight
} from "lucide-react";

interface ArchitectureBoxProps {
  title: string;
  items: { label: string; icon?: React.ReactNode }[];
  variant?: "primary" | "secondary" | "accent" | "muted";
  className?: string;
}

export const ArchitectureBox: React.FC<ArchitectureBoxProps> = ({
  title, items, variant = "primary", className,
}) => {
  const variantStyles = {
    primary: "border-primary/40 bg-primary/10",
    secondary: "border-secondary/40 bg-secondary/10",
    accent: "border-chart-3/40 bg-chart-3/10",
    muted: "border-border/40 bg-muted/30",
  };
  return (
    <div className={cn("rounded-xl p-3 border-2 text-center", variantStyles[variant], className)}>
      <h4 className="font-bold text-xs sm:text-sm mb-2 uppercase tracking-wider">{title}</h4>
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SystemArchitectureDiagram: React.FC = () => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Presentation Tier</span>
        </div>
        <ArchitectureBox title="React 18 + TypeScript" variant="primary" items={[
          { label: "Role-Based Dashboards (3)", icon: <Monitor className="w-3 h-3" /> },
          { label: "Accessibility Toolbar", icon: <Eye className="w-3 h-3" /> },
          { label: "Responsive Design", icon: <Smartphone className="w-3 h-3" /> },
          { label: "Shadcn/UI Components", icon: <Layers className="w-3 h-3" /> },
        ]} />
      </div>
      <div className="space-y-2">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full">Application Tier</span>
        </div>
        <ArchitectureBox title="Supabase Edge Functions" variant="secondary" items={[
          { label: "15+ AI Edge Functions", icon: <Brain className="w-3 h-3" /> },
          { label: "Gemini Pro Integration", icon: <Zap className="w-3 h-3" /> },
          { label: "Rule-Based Fallbacks", icon: <Settings className="w-3 h-3" /> },
          { label: "JWT Auth + RBAC", icon: <Lock className="w-3 h-3" /> },
        ]} />
      </div>
      <div className="space-y-2">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-chart-3 bg-chart-3/10 px-3 py-1 rounded-full">Data Tier</span>
        </div>
        <ArchitectureBox title="PostgreSQL + RLS" variant="accent" items={[
          { label: "25+ Secured Tables", icon: <Database className="w-3 h-3" /> },
          { label: "Row-Level Security", icon: <Shield className="w-3 h-3" /> },
          { label: "AI Reasoning Logs", icon: <FileText className="w-3 h-3" /> },
          { label: "Real-time Subscriptions", icon: <Bell className="w-3 h-3" /> },
        ]} />
      </div>
    </div>
    <div className="flex items-center justify-center gap-4 py-1">
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="bg-primary/20 px-2 py-0.5 rounded text-primary font-medium">React UI</span>
        <ArrowRight className="w-3 h-3 text-primary" />
        <span className="bg-secondary/20 px-2 py-0.5 rounded text-secondary font-medium">Edge Functions</span>
        <ArrowRight className="w-3 h-3 text-secondary" />
        <span className="bg-chart-3/20 px-2 py-0.5 rounded text-chart-3 font-medium">PostgreSQL</span>
        <ArrowRight className="w-3 h-3 text-chart-3" />
        <span className="bg-primary/20 px-2 py-0.5 rounded text-primary font-medium">Gemini AI</span>
        <ArrowRight className="w-3 h-3 text-primary" />
        <span className="bg-secondary/20 px-2 py-0.5 rounded text-secondary font-medium">Reasoning Logs</span>
      </div>
    </div>
  </div>
);

export const AIDecisionPipelineDiagram: React.FC = () => (
  <div className="space-y-3">
    <div className="grid grid-cols-5 gap-2">
      {[
        { step: "1", title: "Data Collection", desc: "Learner profiles, performance, attendance, demographics", color: "primary" },
        { step: "2", title: "AI Analysis", desc: "Gemini Pro processes multi-dimensional learner data", color: "secondary" },
        { step: "3", title: "Decision Generation", desc: "Personalized recommendations with confidence scores", color: "chart-3" },
        { step: "4", title: "Explainability", desc: "Reasoning chains logged with data sources used", color: "chart-4" },
        { step: "5", title: "Action & Feedback", desc: "Teacher implements, system learns from outcomes", color: "chart-5" },
      ].map((item, i) => (
        <div key={i} className="bg-card/50 rounded-xl p-2 border border-border/30 text-center">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mx-auto mb-1">{item.step}</div>
          <div className="font-semibold text-[10px]">{item.title}</div>
          <div className="text-[8px] text-muted-foreground mt-0.5">{item.desc}</div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-4 gap-2">
      {[
        { title: "Performance Analysis", desc: "Auto-detect low scores → trigger interventions", fn: "analyze-performance" },
        { title: "Learner Profiling", desc: "Comprehensive assessment with AI reasoning", fn: "analyze-learner" },
        { title: "Intervention Planning", desc: "ADHD, autism, visual needs strategies", fn: "suggest-interventions" },
        { title: "Equity Monitoring", desc: "Bias detection across demographics", fn: "calculate-equity-metrics" },
      ].map((item, i) => (
        <div key={i} className="bg-card/50 rounded-lg p-2 border border-border/30">
          <div className="font-semibold text-[10px] text-primary">{item.title}</div>
          <div className="text-[8px] text-muted-foreground mt-0.5">{item.desc}</div>
          <div className="text-[8px] mt-1 font-mono bg-muted/50 px-1 rounded">{item.fn}</div>
        </div>
      ))}
    </div>
  </div>
);

export const DataFlowDiagram: React.FC = () => (
  <div className="grid grid-cols-3 gap-3">
    <div className="bg-primary/10 rounded-xl p-3 border border-primary/30">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-primary" />
        <span className="font-bold text-xs">Admin</span>
      </div>
      <div className="text-[10px] text-muted-foreground space-y-1">
        <div>• System-wide analytics</div>
        <div>• AI bias monitoring</div>
        <div>• Teacher/learner management</div>
        <div>• Ethical compliance checks</div>
        <div>• Nigerian education overview</div>
      </div>
    </div>
    <div className="bg-secondary/10 rounded-xl p-3 border border-secondary/30">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-secondary" />
        <span className="font-bold text-xs">Teacher</span>
      </div>
      <div className="text-[10px] text-muted-foreground space-y-1">
        <div>• AI recommendations per student</div>
        <div>• Intervention implementation</div>
        <div>• Content & quiz creation</div>
        <div>• Attendance tracking</div>
        <div>• Training recommendations</div>
      </div>
    </div>
    <div className="bg-chart-3/10 rounded-xl p-3 border border-chart-3/30">
      <div className="flex items-center gap-2 mb-2">
        <GraduationCap className="w-4 h-4 text-chart-3" />
        <span className="font-bold text-xs">Learner</span>
      </div>
      <div className="text-[10px] text-muted-foreground space-y-1">
        <div>• Personalized dashboard</div>
        <div>• Progress timeline</div>
        <div>• Learning materials hub</div>
        <div>• Quiz taking</div>
        <div>• Accessibility tools</div>
      </div>
    </div>
  </div>
);

export const DatabaseSchemaDiagram: React.FC = () => (
  <div className="grid grid-cols-4 gap-2">
    <div className="bg-primary/10 rounded-xl p-2 border border-primary/30">
      <h5 className="font-bold text-[10px] text-center text-primary mb-1.5">Core Tables</h5>
      <div className="space-y-0.5 text-[9px] text-muted-foreground">
        <div>• profiles</div><div>• user_roles</div><div>• learners</div><div>• notifications</div>
      </div>
    </div>
    <div className="bg-secondary/10 rounded-xl p-2 border border-secondary/30">
      <h5 className="font-bold text-[10px] text-center text-secondary mb-1.5">AI & Analytics</h5>
      <div className="space-y-0.5 text-[9px] text-muted-foreground">
        <div>• ai_reasoning_logs</div><div>• recommendations</div><div>• equity_metrics</div><div>• feedback</div><div>• ethical_compliance</div>
      </div>
    </div>
    <div className="bg-chart-3/10 rounded-xl p-2 border border-chart-3/30">
      <h5 className="font-bold text-[10px] text-center text-chart-3 mb-1.5">Education</h5>
      <div className="space-y-0.5 text-[9px] text-muted-foreground">
        <div>• performance_records</div><div>• attendance_records</div><div>• learning_materials</div><div>• quizzes / quiz_questions</div><div>• curriculum_standards</div>
      </div>
    </div>
    <div className="bg-chart-4/10 rounded-xl p-2 border border-chart-4/30">
      <h5 className="font-bold text-[10px] text-center text-chart-4 mb-1.5">Nigerian Context</h5>
      <div className="space-y-0.5 text-[9px] text-muted-foreground">
        <div>• nigerian_learning_contexts</div><div>• learner_demographics</div><div>• state_education_policies</div><div>• assessment_frameworks</div><div>• accessibility_profiles</div>
      </div>
    </div>
  </div>
);

export const FeatureShowcaseDiagram: React.FC = () => (
  <div className="grid grid-cols-2 gap-3">
    {[
      { title: "AI Decision Engine", icon: <Brain className="w-5 h-5 text-primary" />, color: "primary", items: ["Hybrid AI (Gemini + rule-based fallbacks)", "Explainable reasoning chains with confidence", "Automated intervention triggers", "Proactive low-performance detection"] },
      { title: "Accessibility Suite", icon: <Eye className="w-5 h-5 text-secondary" />, color: "secondary", items: ["Text-to-speech with voice selection", "High contrast & font size controls", "Screen reader optimization", "Preference persistence per user"] },
      { title: "Nigerian Curriculum", icon: <BookOpen className="w-5 h-5 text-chart-3" />, color: "chart-3", items: ["NERDC standards integration", "WAEC/NECO assessment alignment", "State education policy tracking", "Competency-based progression"] },
      { title: "Ethical AI Governance", icon: <Shield className="w-5 h-5 text-chart-4" />, color: "chart-4", items: ["Bias monitoring across demographics", "Data transparency & consent management", "Ethical compliance checks", "User data usage disclosure"] },
    ].map((section, i) => (
      <div key={i} className="bg-card/50 rounded-xl p-3 border border-border/30">
        <div className="flex items-center gap-2 mb-2">{section.icon}<h4 className="font-bold text-sm">{section.title}</h4></div>
        <div className="space-y-1 text-xs text-muted-foreground">
          {section.items.map((item, j) => (
            <div key={j} className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-primary" /> {item}</div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const DashboardWireframe: React.FC<{
  title: string;
  role: "admin" | "teacher" | "learner";
  features: { label: string; icon: React.ReactNode }[];
}> = ({ title, role, features }) => (
  <div className="bg-card/80 rounded-xl border-2 border-border/40 overflow-hidden">
    <div className="bg-muted/50 px-3 py-1.5 border-b border-border/30 flex items-center gap-2">
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-destructive/50" />
        <div className="w-2 h-2 rounded-full bg-chart-3/50" />
        <div className="w-2 h-2 rounded-full bg-primary/50" />
      </div>
      <span className="text-[9px] text-muted-foreground font-mono">inclusi-ai-path.lovable.app/{role}</span>
    </div>
    <div className="flex" style={{ height: '120px' }}>
      <div className="w-16 bg-muted/30 border-r border-border/20 p-1.5">
        <div className="space-y-1.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-2 rounded ${i === 1 ? 'bg-primary/40' : 'bg-muted-foreground/20'}`} />
          ))}
        </div>
      </div>
      <div className="flex-1 p-2">
        <div className="font-bold text-[10px] text-primary mb-1.5">{title}</div>
        <div className="space-y-1">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-1 text-[8px] text-muted-foreground">{f.icon}<span>{f.label}</span></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const ScreenshotPlaceholder: React.FC<{
  title: string;
  description: string;
  features?: string[];
}> = ({ title, description, features }) => (
  <div className="bg-card/30 rounded-xl p-4 border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-center h-full min-h-[150px]">
    <Monitor className="w-8 h-8 text-muted-foreground/50 mb-2" />
    <h4 className="font-semibold text-sm">{title}</h4>
    <p className="text-xs text-muted-foreground mt-1">{description}</p>
    {features && (
      <div className="mt-2 space-y-1">
        {features.map((f, i) => (
          <div key={i} className="text-[10px] text-muted-foreground flex items-center gap-1 justify-center">
            <CheckCircle className="w-3 h-3 text-primary" />{f}
          </div>
        ))}
      </div>
    )}
  </div>
);
