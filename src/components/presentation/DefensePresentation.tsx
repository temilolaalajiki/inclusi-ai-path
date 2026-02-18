import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PresentationSlide } from "./PresentationSlide";
import { 
  BulletList, 
  BulletPoint, 
  TwoColumn, 
  StatBox, 
  HighlightBox,
  DiagramBox,
  QuoteBox 
} from "./SlideContent";
import {
  SystemArchitectureDiagram,
  AIDecisionPipelineDiagram,
  DataFlowDiagram,
  DatabaseSchemaDiagram,
  FeatureShowcaseDiagram,
  DashboardWireframe,
  ScreenshotPlaceholder
} from "./ArchitectureDiagram";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Maximize2,
  Brain,
  Users,
  Target,
  CheckCircle,
  BookOpen,
  Shield,
  TrendingUp,
  Lightbulb,
  GraduationCap,
  BarChart3,
  Settings,
  FileText,
  Database,
  Server,
  Globe,
  Lock,
  Eye,
  Award,
  Layers,
  AlertTriangle,
  Clock,
  Zap,
  ArrowRight,
  Activity,
  Monitor
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

const TOTAL_SLIDES = 15;

export const DefensePresentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, TOTAL_SLIDES));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 1));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    toast.info("Generating PDF... This may take a moment.");
    
    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1920, 1080] });
      
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      for (let i = 1; i <= TOTAL_SLIDES; i++) {
        const slideElement = document.getElementById(`export-slide-${i}`);
        if (slideElement) {
          const canvas = await html2canvas(slideElement, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#0f0f23',
            logging: false,
          });
          const imgData = canvas.toDataURL("image/png");
          
          if (i > 1) pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, 0, 1920, 1080);
        }
      }
      
      pdf.save("AI-Inclusive-Education-Defense-Presentation.pdf");
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === " ") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "Escape") {
      if (document.fullscreenElement) document.exitFullscreen();
    }
  };

  const getSlideContent = (slideNum: number, isExport = false) => {
    const slideId = isExport ? `export-slide-${slideNum}` : `slide-${slideNum}`;
    
    switch (slideNum) {
      // ========== SLIDE 1: TITLE ==========
      case 1:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={1}
              totalSlides={TOTAL_SLIDES}
              title="AI-Powered Decision-Making System for Enhancing Accessibility in Inclusive Education"
              subtitle="A Research-Based Intelligent System for Nigerian Educational Context"
              variant="title"
            >
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-xs font-medium">AI-Powered</p>
                    <p className="text-[10px] text-muted-foreground">Hybrid Intelligence</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-2">
                      <Eye className="w-6 h-6 text-secondary" />
                    </div>
                    <p className="text-xs font-medium">Accessible</p>
                    <p className="text-[10px] text-muted-foreground">Universal Design</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-chart-3/20 flex items-center justify-center mx-auto mb-2">
                      <GraduationCap className="w-6 h-6 text-chart-3" />
                    </div>
                    <p className="text-xs font-medium">Inclusive</p>
                    <p className="text-[10px] text-muted-foreground">Every Learner Matters</p>
                  </div>
                </div>
                <div className="space-y-1.5 mt-4">
                  <p className="text-muted-foreground text-sm">
                    Presented by: <span className="text-foreground font-semibold">[Your Name]</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Supervisor: <span className="text-foreground font-medium">[Supervisor Name]</span>
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    M.Sc Information Technology • [Institution Name] • December 2025
                  </p>
                </div>
              </div>
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 2: OUTLINE ==========
      case 2:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={2}
              totalSlides={TOTAL_SLIDES}
              title="Presentation Outline"
              variant="section"
            >
              <div className="grid grid-cols-3 gap-3 mt-4 max-w-4xl mx-auto">
                {[
                  { num: 1, label: "Introduction & Problem", icon: <AlertTriangle className="w-4 h-4" /> },
                  { num: 2, label: "Research Questions & Objectives", icon: <Lightbulb className="w-4 h-4" /> },
                  { num: 3, label: "Literature Review", icon: <BookOpen className="w-4 h-4" /> },
                  { num: 4, label: "Methodology", icon: <Settings className="w-4 h-4" /> },
                  { num: 5, label: "System Architecture", icon: <Layers className="w-4 h-4" /> },
                  { num: 6, label: "AI Decision Engine", icon: <Brain className="w-4 h-4" /> },
                  { num: 7, label: "Database & Data Flow", icon: <Database className="w-4 h-4" /> },
                  { num: 8, label: "Key Features Demo", icon: <CheckCircle className="w-4 h-4" /> },
                  { num: 9, label: "Application Walkthrough", icon: <Globe className="w-4 h-4" /> },
                  { num: 10, label: "Ethical AI & Bias Monitoring", icon: <Shield className="w-4 h-4" /> },
                  { num: 11, label: "Results & Evaluation", icon: <BarChart3 className="w-4 h-4" /> },
                  { num: 12, label: "Conclusion & Future Work", icon: <Target className="w-4 h-4" /> },
                ].map((item) => (
                  <div key={item.num} className="bg-card/50 rounded-lg p-2 text-center border border-border/30 flex items-center gap-2">
                    <span className="text-primary">{item.icon}</span>
                    <span className="text-primary font-bold text-sm">{item.num}.</span>
                    <span className="text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 3: PROBLEM STATEMENT ==========
      case 3:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={3}
              totalSlides={TOTAL_SLIDES}
              title="Introduction & Problem Statement"
            >
              <TwoColumn
                left={
                  <div className="space-y-3">
                    <HighlightBox title="The Crisis in Nigerian Inclusive Education" variant="primary">
                      Over 10.5 million Nigerian children with disabilities lack access to quality inclusive education. Teachers lack data-driven tools, and no existing system combines AI decision-making with accessibility support in the Nigerian context.
                    </HighlightBox>
                    <div className="bg-destructive/10 rounded-xl p-3 border border-destructive/30">
                      <h4 className="font-bold text-xs text-destructive mb-2">Research Gap Identified</h4>
                      <div className="text-[11px] text-muted-foreground space-y-1">
                        <div>• Existing systems treat accessibility as an afterthought</div>
                        <div>• No AI system explains WHY it makes recommendations</div>
                        <div>• Zero integration with Nigerian curriculum (NERDC/WAEC/NECO)</div>
                        <div>• No bias monitoring in educational AI for developing nations</div>
                      </div>
                    </div>
                    <QuoteBox 
                      quote="Education is a fundamental human right and essential for the exercise of all other human rights."
                      author="UNESCO, 2020"
                    />
                  </div>
                }
                right={
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <StatBox value="10.5M" label="Children with Disabilities (Nigeria)" icon={Users} />
                      <StatBox value="65%" label="Out of School Rate" icon={AlertTriangle} />
                      <StatBox value="<5%" label="Teachers with SEN Training" icon={BookOpen} />
                      <StatBox value="0" label="AI Systems for Nigerian Inclusive Ed." icon={Brain} />
                    </div>
                    <HighlightBox title="This System Addresses" variant="secondary">
                      <div className="text-xs space-y-0.5">
                        <div>✓ Autonomous AI-powered decision-making</div>
                        <div>✓ Explainable reasoning for every recommendation</div>
                        <div>✓ Nigerian curriculum contextualization</div>
                        <div>✓ Built-in bias monitoring & ethical governance</div>
                      </div>
                    </HighlightBox>
                  </div>
                }
              />
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 4: RESEARCH QUESTIONS ==========
      case 4:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={4}
              totalSlides={TOTAL_SLIDES}
              title="Research Questions & Objectives"
            >
              <TwoColumn
                left={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      Research Questions
                    </h4>
                    <div className="space-y-2">
                      <div className="bg-primary/10 rounded-lg p-3 border-l-4 border-primary">
                        <p className="text-xs font-bold text-primary">RQ1:</p>
                        <p className="text-xs text-muted-foreground">How can AI autonomously identify accessibility needs and generate evidence-based interventions in inclusive education?</p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-3 border-l-4 border-secondary">
                        <p className="text-xs font-bold text-secondary">RQ2:</p>
                        <p className="text-xs text-muted-foreground">What decision-making framework ensures AI recommendations are explainable, transparent, and free from demographic bias?</p>
                      </div>
                      <div className="bg-chart-3/10 rounded-lg p-3 border-l-4 border-chart-3">
                        <p className="text-xs font-bold text-chart-3">RQ3:</p>
                        <p className="text-xs text-muted-foreground">How can technology bridge the gap between Nigerian education policy (NERDC, WAEC, NECO) and classroom practice?</p>
                      </div>
                    </div>
                  </div>
                }
                right={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-secondary" />
                      Research Objectives
                    </h4>
                    <BulletList className="text-xs">
                      <BulletPoint icon={CheckCircle}>Develop a hybrid AI engine (Gemini + rule-based) for learner assessment with explainable reasoning chains</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Create automated intervention recommendation pipeline with confidence scoring</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Implement proactive performance monitoring with automatic teacher alerts</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Integrate NERDC curriculum standards and WAEC/NECO assessment frameworks</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Build bias monitoring system ensuring equitable AI across demographics</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Ensure full data transparency with consent management and usage disclosure</BulletPoint>
                    </BulletList>
                  </div>
                }
              />
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 5: LITERATURE REVIEW ==========
      case 5:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={5}
              totalSlides={TOTAL_SLIDES}
              title="Literature Review"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-full">
                <HighlightBox title="Inclusive Education Theory" variant="primary">
                  <BulletList className="text-xs space-y-1.5">
                    <BulletPoint>UNESCO Salamanca Statement (1994) — Education for All</BulletPoint>
                    <BulletPoint>Universal Design for Learning (UDL) — CAST Framework</BulletPoint>
                    <BulletPoint>Nigerian National Policy on Education — Special Needs</BulletPoint>
                    <BulletPoint>SDG 4: Quality Education — Leave No One Behind</BulletPoint>
                    <BulletPoint>Multi-Tiered Support Systems (MTSS)</BulletPoint>
                  </BulletList>
                </HighlightBox>
                <HighlightBox title="AI in Education (AIEd)" variant="secondary">
                  <BulletList className="text-xs space-y-1.5">
                    <BulletPoint>Adaptive Learning Systems — Personalization at Scale</BulletPoint>
                    <BulletPoint>Explainable AI (XAI) — Trust & Accountability (Arrieta et al., 2020)</BulletPoint>
                    <BulletPoint>LLMs in Education — GPT, Gemini for personalized support</BulletPoint>
                    <BulletPoint>Human-in-the-Loop AI — Augment, not replace, educators</BulletPoint>
                    <BulletPoint>AI Ethics in Education — Fairness, transparency, consent</BulletPoint>
                  </BulletList>
                </HighlightBox>
                <HighlightBox title="Decision Support Systems" variant="success">
                  <BulletList className="text-xs space-y-1.5">
                    <BulletPoint>Evidence-Based Practice (EBP) in Education</BulletPoint>
                    <BulletPoint>Data-Driven Decision Making (DDDM) — Mandinach, 2012</BulletPoint>
                    <BulletPoint>Response to Intervention (RTI) Models</BulletPoint>
                    <BulletPoint>Hybrid AI Architectures — Combining ML with rules</BulletPoint>
                    <BulletPoint>Algorithmic Accountability — Bias detection frameworks</BulletPoint>
                  </BulletList>
                </HighlightBox>
              </div>
              <QuoteBox 
                quote="AI should augment, not replace, educator expertise in making decisions about learner support."
                author="Holmes, Bialik & Fadel, 2019"
                className="mt-3"
              />
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 6: METHODOLOGY ==========
      case 6:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={6}
              totalSlides={TOTAL_SLIDES}
              title="Methodology"
            >
              <TwoColumn
                left={
                  <div className="space-y-3">
                    <HighlightBox title="Design Science Research (DSR)" variant="primary">
                      <p className="text-xs">Iterative artifact development with rigorous evaluation following Hevner's IS Research Framework. Each cycle refines the AI decision engine based on accessibility requirements.</p>
                    </HighlightBox>
                    <DiagramBox
                      title="Development Lifecycle"
                      type="flow"
                      items={[
                        { label: "Problem ID", description: "Gap Analysis" },
                        { label: "Design", description: "Architecture" },
                        { label: "Develop", description: "Implementation" },
                        { label: "Evaluate", description: "Testing" },
                        { label: "Iterate", description: "Refinement" },
                      ]}
                    />
                    <div className="bg-card/50 rounded-lg p-2 border border-border/30">
                      <h4 className="font-semibold text-xs mb-1">Evaluation Criteria</h4>
                      <div className="text-[10px] text-muted-foreground space-y-0.5">
                        <div>• AI decision accuracy & relevance</div>
                        <div>• Explainability of reasoning chains</div>
                        <div>• Accessibility compliance (WCAG 2.1)</div>
                        <div>• System performance under load</div>
                      </div>
                    </div>
                  </div>
                }
                right={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Technology Stack</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-primary/10 rounded-lg p-2 border border-primary/30">
                        <div className="font-medium text-primary flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Frontend
                        </div>
                        <div className="text-muted-foreground text-[10px] mt-1">
                          React 18, TypeScript, Tailwind CSS, Shadcn/UI, Recharts
                        </div>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-2 border border-secondary/30">
                        <div className="font-medium text-secondary flex items-center gap-1">
                          <Server className="w-3 h-3" /> Backend
                        </div>
                        <div className="text-muted-foreground text-[10px] mt-1">
                          Supabase, 15+ Edge Functions, PostgreSQL, Real-time
                        </div>
                      </div>
                      <div className="bg-chart-3/10 rounded-lg p-2 border border-chart-3/30">
                        <div className="font-medium text-chart-3 flex items-center gap-1">
                          <Brain className="w-3 h-3" /> AI/ML
                        </div>
                        <div className="text-muted-foreground text-[10px] mt-1">
                          Google Gemini Pro, Custom Rule Engine, XAI Logging
                        </div>
                      </div>
                      <div className="bg-chart-4/10 rounded-lg p-2 border border-chart-4/30">
                        <div className="font-medium text-chart-4 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Security
                        </div>
                        <div className="text-muted-foreground text-[10px] mt-1">
                          Row-Level Security, JWT Auth, RBAC (3 roles)
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm mt-2">Data Points Collected</h4>
                    <BulletList className="text-xs">
                      <BulletPoint>Learner profiles, demographics & accessibility needs</BulletPoint>
                      <BulletPoint>Performance records with curriculum alignment</BulletPoint>
                      <BulletPoint>Attendance patterns & anomaly detection</BulletPoint>
                      <BulletPoint>AI reasoning logs & recommendation outcomes</BulletPoint>
                    </BulletList>
                  </div>
                }
              />
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 7: SYSTEM ARCHITECTURE ==========
      case 7:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={7}
              totalSlides={TOTAL_SLIDES}
              title="System Architecture"
              subtitle="Three-Tier Architecture with Hybrid AI Decision Engine"
            >
              <SystemArchitectureDiagram />
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 8: AI DECISION ENGINE (KEY SLIDE) ==========
      case 8:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={8}
              totalSlides={TOTAL_SLIDES}
              title="AI Decision Engine — The Core Innovation"
              subtitle="Hybrid AI with Explainable Reasoning & Rule-Based Fallbacks"
            >
              <AIDecisionPipelineDiagram />
              <div className="mt-3 bg-primary/5 rounded-xl p-3 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-bold text-xs text-primary">Key Innovation: The system doesn't just store data — it makes decisions autonomously and explains why</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Every AI recommendation includes a reasoning chain (step-by-step logic), confidence score, data sources used, and whether it was AI-generated or rule-based. Teachers can trace exactly how the system arrived at each decision.
                </div>
              </div>
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 9: DATABASE & DATA FLOW ==========
      case 9:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={9}
              totalSlides={TOTAL_SLIDES}
              title="Database Design & Role-Based Access"
              subtitle="25+ Tables with Row-Level Security • Three Role-Based Views"
            >
              <DatabaseSchemaDiagram />
              <div className="mt-3">
                <DataFlowDiagram />
              </div>
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 10: KEY FEATURES ==========
      case 10:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={10}
              totalSlides={TOTAL_SLIDES}
              title="Key Features & Implementation"
            >
              <FeatureShowcaseDiagram />
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 11: APPLICATION WALKTHROUGH ==========
      case 11:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={11}
              totalSlides={TOTAL_SLIDES}
              title="Application Walkthrough"
              subtitle="Three Role-Based Dashboards — Live System at inclusi-ai-path.lovable.app"
            >
              <div className="grid grid-cols-3 gap-3">
                <DashboardWireframe
                  title="Admin Dashboard"
                  role="admin"
                  features={[
                    { label: "System-wide analytics & charts", icon: <BarChart3 className="w-3 h-3" /> },
                    { label: "AI bias monitoring dashboard", icon: <Shield className="w-3 h-3" /> },
                    { label: "Teacher/learner management", icon: <Users className="w-3 h-3" /> },
                    { label: "Nigerian education overview", icon: <Globe className="w-3 h-3" /> },
                    { label: "Ethical compliance checks", icon: <CheckCircle className="w-3 h-3" /> },
                  ]}
                />
                <DashboardWireframe
                  title="Teacher Portal"
                  role="teacher"
                  features={[
                    { label: "AI recommendations per student", icon: <Brain className="w-3 h-3" /> },
                    { label: "Explainable reasoning view", icon: <Eye className="w-3 h-3" /> },
                    { label: "Content & quiz creation", icon: <BookOpen className="w-3 h-3" /> },
                    { label: "Attendance tracking", icon: <Clock className="w-3 h-3" /> },
                    { label: "Training recommendations", icon: <Award className="w-3 h-3" /> },
                  ]}
                />
                <DashboardWireframe
                  title="Learner Dashboard"
                  role="learner"
                  features={[
                    { label: "Personalized progress timeline", icon: <TrendingUp className="w-3 h-3" /> },
                    { label: "Learning materials hub", icon: <BookOpen className="w-3 h-3" /> },
                    { label: "Interactive quiz taking", icon: <Target className="w-3 h-3" /> },
                    { label: "Accessibility toolbar", icon: <Eye className="w-3 h-3" /> },
                    { label: "Profile completion tracker", icon: <Activity className="w-3 h-3" /> },
                  ]}
                />
              </div>
              <div className="mt-3 text-center bg-card/30 rounded-lg p-2 border border-border/20">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Live Demo Available:</span> The fully functional system is deployed and accessible for demonstration during this defense
                </p>
              </div>
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 12: ETHICAL AI & BIAS MONITORING ==========
      case 12:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={12}
              totalSlides={TOTAL_SLIDES}
              title="Ethical AI & Bias Monitoring"
              subtitle="Ensuring Fairness, Transparency, and Accountability"
            >
              <TwoColumn
                left={
                  <div className="space-y-3">
                    <HighlightBox title="Explainable AI (XAI)" variant="primary">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> Every recommendation shows its reasoning chain</div>
                        <div className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Confidence scores indicate AI certainty</div>
                        <div className="flex items-center gap-1"><Database className="w-3 h-3" /> Data sources disclosed for each decision</div>
                        <div className="flex items-center gap-1"><Settings className="w-3 h-3" /> AI vs rule-based origin clearly labeled</div>
                      </div>
                    </HighlightBox>
                    <HighlightBox title="Data Transparency" variant="secondary">
                      <div className="text-xs space-y-1">
                        <div>• User consent management system</div>
                        <div>• Data usage logs showing what data was processed</div>
                        <div>• Purpose disclosure for every AI analysis</div>
                        <div>• Right to know what data influences decisions</div>
                      </div>
                    </HighlightBox>
                  </div>
                }
                right={
                  <div className="space-y-3">
                    <HighlightBox title="Bias Monitoring Dashboard" variant="success">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1"><Shield className="w-3 h-3" /> Equity metrics calculated across demographics</div>
                        <div className="flex items-center gap-1"><Users className="w-3 h-3" /> Resource allocation tracked by location & language</div>
                        <div className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Automatic bias alerts when deviation detected</div>
                        <div className="flex items-center gap-1"><FileText className="w-3 h-3" /> Ethical compliance checks logged</div>
                      </div>
                    </HighlightBox>
                    <div className="bg-card/50 rounded-xl p-3 border border-border/30">
                      <h4 className="font-bold text-xs mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-primary" />
                        How Bias is Detected
                      </h4>
                      <div className="text-[10px] text-muted-foreground space-y-1">
                        <div>1. System aggregates recommendations by demographic</div>
                        <div>2. Calculates standard deviation of resource allocation</div>
                        <div>3. Flags when deviation exceeds threshold</div>
                        <div>4. Generates compliance check with severity level</div>
                        <div>5. Alerts admin with specific findings</div>
                      </div>
                    </div>
                  </div>
                }
              />
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 13: RESULTS ==========
      case 13:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={13}
              totalSlides={TOTAL_SLIDES}
              title="Results & Evaluation"
            >
              <TwoColumn
                left={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">System Metrics</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <StatBox value="3" label="Role-Based Dashboards" icon={Monitor} />
                      <StatBox value="15+" label="AI Edge Functions" icon={Brain} />
                      <StatBox value="25+" label="Database Tables" icon={Database} />
                      <StatBox value="100%" label="RLS Security Coverage" icon={Shield} />
                    </div>
                    <HighlightBox title="AI Decision Capabilities" variant="primary">
                      <div className="text-xs space-y-0.5">
                        <div>✓ Autonomous learner analysis with Gemini Pro</div>
                        <div>✓ Rule-based fallback ensuring 100% availability</div>
                        <div>✓ Explainable reasoning for every recommendation</div>
                        <div>✓ Proactive low-performance intervention triggers</div>
                      </div>
                    </HighlightBox>
                  </div>
                }
                right={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Research Questions Addressed</h4>
                    <div className="space-y-2">
                      <div className="bg-primary/10 rounded-lg p-2 border border-primary/20">
                        <span className="text-[10px] font-bold text-primary">RQ1 ✓</span>
                        <p className="text-[10px] text-muted-foreground">AI autonomously identifies accessibility needs via 15+ edge functions processing learner data through Gemini Pro</p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-2 border border-secondary/20">
                        <span className="text-[10px] font-bold text-secondary">RQ2 ✓</span>
                        <p className="text-[10px] text-muted-foreground">Hybrid AI framework with explainable reasoning chains, confidence scores, and automated bias detection ensures transparency</p>
                      </div>
                      <div className="bg-chart-3/10 rounded-lg p-2 border border-chart-3/20">
                        <span className="text-[10px] font-bold text-chart-3">RQ3 ✓</span>
                        <p className="text-[10px] text-muted-foreground">NERDC standards, WAEC/NECO frameworks, and state education policies are integrated into AI recommendations</p>
                      </div>
                    </div>
                  </div>
                }
              />
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 14: CONTRIBUTIONS & IMPACT ==========
      case 14:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={14}
              totalSlides={TOTAL_SLIDES}
              title="Research Contributions & Limitations"
            >
              <TwoColumn
                left={
                  <div className="space-y-3">
                    <HighlightBox title="Novel Contributions" variant="primary">
                      <BulletList className="text-xs">
                        <BulletPoint icon={Award}>First AI system combining explainable decision-making with Nigerian curriculum alignment for inclusive education</BulletPoint>
                        <BulletPoint icon={Award}>Hybrid AI architecture with rule-based fallbacks ensuring 100% system availability</BulletPoint>
                        <BulletPoint icon={Award}>Integrated bias monitoring framework for educational AI in developing nations</BulletPoint>
                        <BulletPoint icon={Award}>Full data transparency model with consent management and usage disclosure</BulletPoint>
                      </BulletList>
                    </HighlightBox>
                    <div className="grid grid-cols-2 gap-2">
                      <StatBox value="Policy" label="Informs Education Policy" icon={FileText} />
                      <StatBox value="Practice" label="Supports Teachers" icon={Users} />
                    </div>
                  </div>
                }
                right={
                  <div className="space-y-3">
                    <div className="border border-destructive/30 rounded-xl p-3 bg-destructive/5">
                      <h4 className="font-semibold text-xs text-destructive flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        Limitations
                      </h4>
                      <BulletList className="text-xs">
                        <BulletPoint>Limited real-world pilot testing in Nigerian schools</BulletPoint>
                        <BulletPoint>Requires stable internet for full AI functionality</BulletPoint>
                        <BulletPoint>AI model accuracy improves with more training data</BulletPoint>
                      </BulletList>
                    </div>
                    <HighlightBox title="Future Research Directions" variant="secondary">
                      <BulletList className="text-xs">
                        <BulletPoint icon={Lightbulb}>Offline PWA support for rural Nigerian areas</BulletPoint>
                        <BulletPoint icon={Lightbulb}>Multi-language support (Hausa, Yoruba, Igbo)</BulletPoint>
                        <BulletPoint icon={Lightbulb}>Parent/guardian collaboration portal</BulletPoint>
                        <BulletPoint icon={Lightbulb}>Integration with UBEC databases</BulletPoint>
                        <BulletPoint icon={Lightbulb}>Extended pilot across Nigerian states</BulletPoint>
                      </BulletList>
                    </HighlightBox>
                  </div>
                }
              />
            </PresentationSlide>
          </div>
        );

      // ========== SLIDE 15: CONCLUSION ==========
      case 15:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={15}
              totalSlides={TOTAL_SLIDES}
              title="Conclusion"
              variant="conclusion"
            >
              <div className="max-w-4xl mx-auto space-y-4">
                <QuoteBox
                  quote="This system doesn't wait for teachers to notice struggling students — it proactively identifies them, generates evidence-based interventions, explains its reasoning, and monitors itself for fairness."
                  className="text-center bg-primary/5 border-primary"
                />
                <div className="grid grid-cols-4 gap-3">
                  <StatBox value="✓" label="AI-Powered Autonomous Decisions" icon={Brain} />
                  <StatBox value="✓" label="Explainable & Transparent" icon={Eye} />
                  <StatBox value="✓" label="Nigerian Context Aligned" icon={GraduationCap} />
                  <StatBox value="✓" label="Ethical & Bias-Monitored" icon={Shield} />
                </div>
                <div className="bg-card/30 rounded-xl p-4 border border-border/20 text-center">
                  <h3 className="text-xl font-bold text-primary mb-1">Thank You</h3>
                  <p className="text-sm text-muted-foreground mb-3">Questions & Discussion Welcome</p>
                  <div className="flex justify-center gap-4">
                    <div className="bg-primary/10 rounded-lg px-4 py-2 border border-primary/30">
                      <p className="text-[10px] text-muted-foreground">Live Demo</p>
                      <p className="text-xs font-medium">inclusi-ai-path.lovable.app</p>
                    </div>
                    <div className="bg-secondary/10 rounded-lg px-4 py-2 border border-secondary/30">
                      <p className="text-[10px] text-muted-foreground">Program</p>
                      <p className="text-xs font-medium">M.Sc Information Technology</p>
                    </div>
                    <div className="bg-chart-3/10 rounded-lg px-4 py-2 border border-chart-3/30">
                      <p className="text-[10px] text-muted-foreground">Defense</p>
                      <p className="text-xs font-medium">December 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </PresentationSlide>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-6xl mx-auto p-4 focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevSlide} disabled={currentSlide === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Slide {currentSlide} of {TOTAL_SLIDES}
          </span>
          <Button variant="outline" size="sm" onClick={nextSlide} disabled={currentSlide === TOTAL_SLIDES}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Maximize2 className="w-4 h-4 mr-2" />
            {isFullscreen ? "Exit" : "Present"}
          </Button>
          <Button size="sm" onClick={exportToPDF} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* Current Slide Display */}
      {getSlideContent(currentSlide)}

      {/* Slide Thumbnails */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
        {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentSlide(i + 1)}
            className={`flex-shrink-0 w-16 h-9 rounded border-2 text-xs flex items-center justify-center transition-all ${
              currentSlide === i + 1
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/50 hover:border-primary/50"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Keyboard Hints */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        Use ← → arrow keys or spacebar to navigate • Press F11 or click Present for fullscreen
      </p>

      {/* Hidden Export Container - renders all slides for PDF export */}
      {isExporting && (
        <div
          ref={exportContainerRef}
          className="fixed left-[-9999px] top-0"
          style={{ width: '1920px', height: '1080px' }}
        >
          {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
            <div 
              key={i + 1}
              style={{ width: '1920px', height: '1080px', backgroundColor: '#0f0f23' }}
            >
              {getSlideContent(i + 1, true)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DefensePresentation;
