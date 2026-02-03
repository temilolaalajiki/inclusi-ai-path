import React from "react";
import { cn } from "@/lib/utils";
import { 
  Database, 
  Globe, 
  Shield, 
  Brain, 
  Users, 
  Settings, 
  Server,
  Layers,
  Lock,
  Eye,
  FileText,
  BarChart3,
  BookOpen,
  GraduationCap,
  UserCheck,
  Bell
} from "lucide-react";

interface ArchitectureBoxProps {
  title: string;
  items: { label: string; icon?: React.ReactNode }[];
  variant?: "primary" | "secondary" | "accent" | "muted";
  className?: string;
}

export const ArchitectureBox: React.FC<ArchitectureBoxProps> = ({ 
  title, 
  items, 
  variant = "primary",
  className 
}) => {
  const variantStyles = {
    primary: "border-primary/50 bg-primary/10",
    secondary: "border-secondary/50 bg-secondary/10",
    accent: "border-chart-3/50 bg-chart-3/10",
    muted: "border-border bg-muted/30",
  };

  return (
    <div className={cn(
      "rounded-lg border-2 p-3 text-center",
      variantStyles[variant],
      className
    )}>
      <h4 className="font-bold text-xs sm:text-sm mb-2">{title}</h4>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SystemArchitectureDiagram: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center">
      {/* Three-Tier Architecture */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Presentation Layer */}
        <div className="space-y-2">
          <div className="text-center mb-2">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
              PRESENTATION LAYER
            </span>
          </div>
          <ArchitectureBox
            title="User Interfaces"
            variant="primary"
            items={[
              { label: "Admin Dashboard", icon: <Settings className="w-3 h-3" /> },
              { label: "Teacher Portal", icon: <Users className="w-3 h-3" /> },
              { label: "Learner App", icon: <GraduationCap className="w-3 h-3" /> },
            ]}
          />
          <ArchitectureBox
            title="Accessibility Layer"
            variant="primary"
            items={[
              { label: "Text-to-Speech", icon: <Eye className="w-3 h-3" /> },
              { label: "High Contrast Mode" },
              { label: "Font Scaling" },
            ]}
          />
        </div>

        {/* Application Layer */}
        <div className="space-y-2">
          <div className="text-center mb-2">
            <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold">
              APPLICATION LAYER
            </span>
          </div>
          <ArchitectureBox
            title="AI Decision Engine"
            variant="secondary"
            items={[
              { label: "Gemini Pro LLM", icon: <Brain className="w-3 h-3" /> },
              { label: "Hybrid Reasoning" },
              { label: "Rule-Based Fallback" },
            ]}
          />
          <ArchitectureBox
            title="Edge Functions"
            variant="secondary"
            items={[
              { label: "analyze-learner", icon: <Server className="w-3 h-3" /> },
              { label: "suggest-interventions" },
              { label: "generate-insights" },
            ]}
          />
        </div>

        {/* Data Layer */}
        <div className="space-y-2">
          <div className="text-center mb-2">
            <span className="bg-chart-3 text-chart-3-foreground px-3 py-1 rounded-full text-xs font-bold">
              DATA LAYER
            </span>
          </div>
          <ArchitectureBox
            title="PostgreSQL Database"
            variant="accent"
            items={[
              { label: "25+ Data Tables", icon: <Database className="w-3 h-3" /> },
              { label: "Row-Level Security" },
              { label: "Real-time Sync" },
            ]}
          />
          <ArchitectureBox
            title="Security Layer"
            variant="accent"
            items={[
              { label: "Authentication", icon: <Lock className="w-3 h-3" /> },
              { label: "Role-Based Access" },
              { label: "Data Encryption" },
            ]}
          />
        </div>
      </div>

      {/* Data Flow Arrows */}
      <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Globe className="w-4 h-4 text-primary" />
          <span>React + TypeScript</span>
        </div>
        <span className="text-primary">↔</span>
        <div className="flex items-center gap-1">
          <Server className="w-4 h-4 text-secondary" />
          <span>Supabase Edge Functions</span>
        </div>
        <span className="text-primary">↔</span>
        <div className="flex items-center gap-1">
          <Database className="w-4 h-4 text-chart-3" />
          <span>PostgreSQL + RLS</span>
        </div>
      </div>
    </div>
  );
};

export const DataFlowDiagram: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      {/* AI Decision Flow */}
      <div className="bg-card/30 rounded-xl p-4 border border-border/30">
        <h4 className="font-semibold text-sm text-center mb-4">AI Decision-Making Flow</h4>
        <div className="flex items-center justify-between gap-2">
          {[
            { label: "Data Collection", sublabel: "Performance, Attendance, Demographics", icon: <FileText className="w-5 h-5" /> },
            { label: "AI Analysis", sublabel: "Gemini Pro + Custom Logic", icon: <Brain className="w-5 h-5" /> },
            { label: "Reasoning Chain", sublabel: "Explainable Steps", icon: <Layers className="w-5 h-5" /> },
            { label: "Recommendation", sublabel: "Prioritized Actions", icon: <BarChart3 className="w-5 h-5" /> },
            { label: "Teacher Review", sublabel: "Human-in-Loop", icon: <UserCheck className="w-5 h-5" /> },
          ].map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex-1 bg-primary/10 rounded-lg p-2 text-center border border-primary/20">
                <div className="flex justify-center mb-1 text-primary">{step.icon}</div>
                <div className="text-xs font-medium">{step.label}</div>
                <div className="text-[10px] text-muted-foreground">{step.sublabel}</div>
              </div>
              {index < 4 && <span className="text-primary text-lg">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* User Role Flow */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20 text-center">
          <h5 className="font-semibold text-xs text-destructive mb-2">Admin</h5>
          <div className="text-[10px] space-y-1 text-muted-foreground">
            <div>• System Configuration</div>
            <div>• Teacher Assignment</div>
            <div>• Equity Monitoring</div>
            <div>• Analytics & Reports</div>
          </div>
        </div>
        <div className="bg-secondary/10 rounded-lg p-3 border border-secondary/20 text-center">
          <h5 className="font-semibold text-xs text-secondary mb-2">Teacher</h5>
          <div className="text-[10px] space-y-1 text-muted-foreground">
            <div>• Learner Management</div>
            <div>• Content Creation</div>
            <div>• AI Insights Review</div>
            <div>• Attendance Tracking</div>
          </div>
        </div>
        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20 text-center">
          <h5 className="font-semibold text-xs text-primary mb-2">Learner</h5>
          <div className="text-[10px] space-y-1 text-muted-foreground">
            <div>• Learning Materials</div>
            <div>• Quiz Taking</div>
            <div>• Progress Tracking</div>
            <div>• Accessibility Tools</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DatabaseSchemaDiagram: React.FC = () => {
  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-4 gap-3">
        {/* Core Tables */}
        <div className="bg-card/50 rounded-lg p-2 border border-border/30">
          <h5 className="font-bold text-xs text-primary mb-1 text-center">User Management</h5>
          <div className="text-[10px] space-y-0.5 text-muted-foreground">
            <div className="bg-primary/5 rounded px-1">profiles</div>
            <div className="bg-primary/5 rounded px-1">user_roles</div>
            <div className="bg-primary/5 rounded px-1">user_data_consent</div>
          </div>
        </div>

        <div className="bg-card/50 rounded-lg p-2 border border-border/30">
          <h5 className="font-bold text-xs text-secondary mb-1 text-center">Learner Data</h5>
          <div className="text-[10px] space-y-0.5 text-muted-foreground">
            <div className="bg-secondary/5 rounded px-1">learners</div>
            <div className="bg-secondary/5 rounded px-1">learner_demographics</div>
            <div className="bg-secondary/5 rounded px-1">accessibility_profiles</div>
            <div className="bg-secondary/5 rounded px-1">performance_records</div>
          </div>
        </div>

        <div className="bg-card/50 rounded-lg p-2 border border-border/30">
          <h5 className="font-bold text-xs text-chart-3 mb-1 text-center">AI & Analytics</h5>
          <div className="text-[10px] space-y-0.5 text-muted-foreground">
            <div className="bg-chart-3/5 rounded px-1">recommendations</div>
            <div className="bg-chart-3/5 rounded px-1">ai_reasoning_logs</div>
            <div className="bg-chart-3/5 rounded px-1">equity_metrics</div>
            <div className="bg-chart-3/5 rounded px-1">ethical_compliance</div>
          </div>
        </div>

        <div className="bg-card/50 rounded-lg p-2 border border-border/30">
          <h5 className="font-bold text-xs text-chart-4 mb-1 text-center">Content & Learning</h5>
          <div className="text-[10px] space-y-0.5 text-muted-foreground">
            <div className="bg-chart-4/5 rounded px-1">learning_materials</div>
            <div className="bg-chart-4/5 rounded px-1">quizzes</div>
            <div className="bg-chart-4/5 rounded px-1">quiz_attempts</div>
            <div className="bg-chart-4/5 rounded px-1">material_progress</div>
          </div>
        </div>
      </div>

      {/* Nigerian Context Tables */}
      <div className="bg-gradient-to-r from-green-500/10 via-white/5 to-green-500/10 rounded-lg p-3 border border-green-500/20">
        <h5 className="font-bold text-xs text-center mb-2">Nigerian Educational Context Integration</h5>
        <div className="grid grid-cols-4 gap-2 text-[10px] text-center">
          <div className="bg-white/10 rounded p-1">
            <div className="font-medium">curriculum_standards</div>
            <div className="text-muted-foreground">NERDC Alignment</div>
          </div>
          <div className="bg-white/10 rounded p-1">
            <div className="font-medium">assessment_frameworks</div>
            <div className="text-muted-foreground">WAEC/NECO</div>
          </div>
          <div className="bg-white/10 rounded p-1">
            <div className="font-medium">state_education_policies</div>
            <div className="text-muted-foreground">36 States + FCT</div>
          </div>
          <div className="bg-white/10 rounded p-1">
            <div className="font-medium">nigerian_learning_contexts</div>
            <div className="text-muted-foreground">Cultural Factors</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeatureShowcaseDiagram: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Left Column */}
      <div className="space-y-3">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-3 border border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-sm">AI-Powered Analytics</h4>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>✓ Learner performance prediction</div>
            <div>✓ Personalized intervention suggestions</div>
            <div>✓ Explainable AI reasoning chains</div>
            <div>✓ Bias detection & monitoring</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-xl p-3 border border-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-secondary" />
            <h4 className="font-bold text-sm">Accessibility Features</h4>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>✓ Text-to-Speech integration</div>
            <div>✓ High contrast themes</div>
            <div>✓ Adjustable font sizes</div>
            <div>✓ Screen reader support</div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-3">
        <div className="bg-gradient-to-br from-chart-3/20 to-chart-3/5 rounded-xl p-3 border border-chart-3/30">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-chart-3" />
            <h4 className="font-bold text-sm">Nigerian Curriculum</h4>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>✓ NERDC standards integration</div>
            <div>✓ WAEC/NECO alignment</div>
            <div>✓ State policy compliance</div>
            <div>✓ Multi-language support</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-chart-4/20 to-chart-4/5 rounded-xl p-3 border border-chart-4/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-chart-4" />
            <h4 className="font-bold text-sm">Ethical AI Framework</h4>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>✓ Transparent decision logging</div>
            <div>✓ Consent management</div>
            <div>✓ Equity metrics tracking</div>
            <div>✓ Human-in-the-loop design</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ScreenshotPlaceholder: React.FC<{ 
  title: string; 
  description: string;
  features?: string[];
}> = ({ title, description, features }) => {
  return (
    <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl border-2 border-dashed border-border p-4 text-center h-full flex flex-col justify-center">
      <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-3 flex items-center justify-center">
        <Globe className="w-6 h-6 text-primary" />
      </div>
      <h4 className="font-bold text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      {features && (
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          {features.map((f, i) => (
            <div key={i}>• {f}</div>
          ))}
        </div>
      )}
    </div>
  );
};
