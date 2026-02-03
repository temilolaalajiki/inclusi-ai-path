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
  DataFlowDiagram,
  DatabaseSchemaDiagram,
  FeatureShowcaseDiagram,
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
  Clock
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
      
      // Wait for the export container to render
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
      case 1:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={1}
              totalSlides={TOTAL_SLIDES}
              title="AI-Powered Decision-Making System for Enhancing Accessibility in Inclusive Education"
              subtitle="A Research-Based Web Application for Nigerian Educational Context"
              variant="title"
            >
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="text-center">
                    <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">AI-Powered</p>
                  </div>
                  <div className="text-center">
                    <Eye className="w-8 h-8 text-secondary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Accessible</p>
                  </div>
                  <div className="text-center">
                    <GraduationCap className="w-8 h-8 text-chart-3 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Inclusive</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Presented by: <span className="text-foreground font-medium">[Your Name]</span>
                  </p>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Supervisor: <span className="text-foreground">[Supervisor Name]</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    [Institution Name] • [Date]
                  </p>
                </div>
              </div>
            </PresentationSlide>
          </div>
        );

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
                  { num: 2, label: "Research Questions", icon: <Lightbulb className="w-4 h-4" /> },
                  { num: 3, label: "Literature Review", icon: <BookOpen className="w-4 h-4" /> },
                  { num: 4, label: "Methodology", icon: <Settings className="w-4 h-4" /> },
                  { num: 5, label: "System Architecture", icon: <Layers className="w-4 h-4" /> },
                  { num: 6, label: "Database Design", icon: <Database className="w-4 h-4" /> },
                  { num: 7, label: "AI Decision Engine", icon: <Brain className="w-4 h-4" /> },
                  { num: 8, label: "Key Features", icon: <CheckCircle className="w-4 h-4" /> },
                  { num: 9, label: "Application Demos", icon: <Globe className="w-4 h-4" /> },
                  { num: 10, label: "Results & Findings", icon: <BarChart3 className="w-4 h-4" /> },
                  { num: 11, label: "Research Impact", icon: <Award className="w-4 h-4" /> },
                  { num: 12, label: "Conclusion", icon: <Target className="w-4 h-4" /> },
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
                  <div className="space-y-4">
                    <HighlightBox title="The Challenge" variant="primary">
                      Over 10 million Nigerian children with disabilities lack access to quality inclusive education due to inadequate identification, limited resources, and absence of data-driven decision support systems.
                    </HighlightBox>
                    <BulletList>
                      <BulletPoint icon={AlertTriangle}>Limited accessibility tools in traditional educational systems</BulletPoint>
                      <BulletPoint icon={AlertTriangle}>Lack of personalized learning interventions</BulletPoint>
                      <BulletPoint icon={AlertTriangle}>Insufficient teacher training for diverse needs</BulletPoint>
                      <BulletPoint icon={AlertTriangle}>Absence of evidence-based decision making</BulletPoint>
                      <BulletPoint icon={AlertTriangle}>No alignment with Nigerian curriculum standards</BulletPoint>
                    </BulletList>
                  </div>
                }
                right={
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <StatBox value="10M+" label="Children with Disabilities" icon={Users} />
                      <StatBox value="65%" label="Out of School" icon={GraduationCap} />
                      <StatBox value="<5%" label="Teachers Trained" icon={BookOpen} />
                      <StatBox value="Low" label="Tech Integration" icon={Settings} />
                    </div>
                    <QuoteBox 
                      quote="Education is a fundamental human right and essential for the exercise of all other human rights."
                      author="UNESCO"
                    />
                  </div>
                }
              />
            </PresentationSlide>
          </div>
        );

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
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      Research Questions
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-primary/10 rounded-lg p-3 border-l-4 border-primary">
                        <p className="text-sm font-medium">RQ1:</p>
                        <p className="text-xs text-muted-foreground">How can AI enhance accessibility identification and support in inclusive education within the Nigerian context?</p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-3 border-l-4 border-secondary">
                        <p className="text-sm font-medium">RQ2:</p>
                        <p className="text-xs text-muted-foreground">What decision-making frameworks can improve educational outcomes for learners with diverse needs?</p>
                      </div>
                      <div className="bg-chart-3/10 rounded-lg p-3 border-l-4 border-chart-3">
                        <p className="text-sm font-medium">RQ3:</p>
                        <p className="text-xs text-muted-foreground">How can technology bridge the gap between policy and practice in Nigerian inclusive education?</p>
                      </div>
                    </div>
                  </div>
                }
                right={
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-secondary" />
                      Research Objectives
                    </h4>
                    <BulletList>
                      <BulletPoint icon={CheckCircle}>Develop AI-powered system for comprehensive learner assessment</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Create personalized intervention recommendation engine</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Enable data-driven teacher decision support</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Integrate Nigerian NERDC curriculum standards</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Implement WAEC/NECO assessment alignment</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Ensure ethical AI with full transparency</BulletPoint>
                    </BulletList>
                  </div>
                }
              />
            </PresentationSlide>
          </div>
        );

      case 5:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={5}
              totalSlides={TOTAL_SLIDES}
              title="Literature Review"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                <HighlightBox title="Inclusive Education Theory" variant="primary">
                  <BulletList className="text-xs space-y-2">
                    <BulletPoint>UNESCO Salamanca Statement (1994) - Education for All</BulletPoint>
                    <BulletPoint>Universal Design for Learning (UDL) - CAST Framework</BulletPoint>
                    <BulletPoint>Nigerian National Policy on Education - Special Needs</BulletPoint>
                    <BulletPoint>SDG 4: Quality Education - Leave No One Behind</BulletPoint>
                    <BulletPoint>NERDC Curriculum Framework Integration</BulletPoint>
                  </BulletList>
                </HighlightBox>
                <HighlightBox title="AI in Education (AIEd)" variant="secondary">
                  <BulletList className="text-xs space-y-2">
                    <BulletPoint>Adaptive Learning Systems - Personalization at Scale</BulletPoint>
                    <BulletPoint>Intelligent Tutoring Systems (ITS) - Carnegie Learning</BulletPoint>
                    <BulletPoint>Learning Analytics & Educational Data Mining</BulletPoint>
                    <BulletPoint>Explainable AI (XAI) - Trust & Transparency</BulletPoint>
                    <BulletPoint>LLMs in Education - GPT, Gemini Applications</BulletPoint>
                  </BulletList>
                </HighlightBox>
                <HighlightBox title="Decision Support Systems" variant="success">
                  <BulletList className="text-xs space-y-2">
                    <BulletPoint>Evidence-Based Practice (EBP) in Education</BulletPoint>
                    <BulletPoint>Multi-Tiered Support Systems (MTSS)</BulletPoint>
                    <BulletPoint>Response to Intervention (RTI) Models</BulletPoint>
                    <BulletPoint>Data-Driven Decision Making (DDDM)</BulletPoint>
                    <BulletPoint>Human-in-the-Loop AI Design</BulletPoint>
                  </BulletList>
                </HighlightBox>
              </div>
              <QuoteBox 
                quote="AI should augment, not replace, educator expertise in making decisions about learner support."
                author="Holmes, Bialik & Fadel, 2019"
                className="mt-4"
              />
            </PresentationSlide>
          </div>
        );

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
                  <div className="space-y-4">
                    <HighlightBox title="Research Approach" variant="primary">
                      <p className="text-xs">Design Science Research (DSR) methodology combining iterative artifact development with rigorous evaluation cycles. The approach follows Hevner's framework for IS research.</p>
                    </HighlightBox>
                    <DiagramBox
                      title="Development Phases"
                      type="flow"
                      items={[
                        { label: "Problem ID", description: "Requirements" },
                        { label: "Design", description: "Architecture" },
                        { label: "Develop", description: "Implementation" },
                        { label: "Evaluate", description: "Testing" },
                        { label: "Iterate", description: "Refinement" },
                      ]}
                    />
                    <div className="bg-card/50 rounded-lg p-3 border border-border/30">
                      <h4 className="font-semibold text-xs mb-2">Evaluation Methods</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>• Functional testing of all system components</div>
                        <div>• Usability evaluation with accessibility focus</div>
                        <div>• AI decision accuracy assessment</div>
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
                          React 18, TypeScript, Tailwind CSS, Shadcn/UI
                        </div>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-2 border border-secondary/30">
                        <div className="font-medium text-secondary flex items-center gap-1">
                          <Server className="w-3 h-3" /> Backend
                        </div>
                        <div className="text-muted-foreground text-[10px] mt-1">
                          Supabase, Edge Functions, PostgreSQL
                        </div>
                      </div>
                      <div className="bg-chart-3/10 rounded-lg p-2 border border-chart-3/30">
                        <div className="font-medium text-chart-3 flex items-center gap-1">
                          <Brain className="w-3 h-3" /> AI/ML
                        </div>
                        <div className="text-muted-foreground text-[10px] mt-1">
                          Gemini Pro, Custom Rule Engine, XAI
                        </div>
                      </div>
                      <div className="bg-chart-4/10 rounded-lg p-2 border border-chart-4/30">
                        <div className="font-medium text-chart-4 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Security
                        </div>
                        <div className="text-muted-foreground text-[10px] mt-1">
                          RLS, JWT Auth, RBAC, Encryption
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm mt-3">Data Collection Points</h4>
                    <BulletList className="text-xs">
                      <BulletPoint>Learner profiles & accessibility needs assessment</BulletPoint>
                      <BulletPoint>Performance records & curriculum alignment</BulletPoint>
                      <BulletPoint>Attendance tracking & pattern analytics</BulletPoint>
                      <BulletPoint>Teacher training & engagement metrics</BulletPoint>
                    </BulletList>
                  </div>
                }
              />
            </PresentationSlide>
          </div>
        );

      case 7:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={7}
              totalSlides={TOTAL_SLIDES}
              title="System Architecture"
              subtitle="Three-Tier Architecture with AI Decision Engine"
            >
              <SystemArchitectureDiagram />
            </PresentationSlide>
          </div>
        );

      case 8:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={8}
              totalSlides={TOTAL_SLIDES}
              title="Database Design & Data Flow"
              subtitle="25+ Tables with Row-Level Security"
            >
              <DatabaseSchemaDiagram />
              <div className="mt-4">
                <DataFlowDiagram />
              </div>
            </PresentationSlide>
          </div>
        );

      case 9:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={9}
              totalSlides={TOTAL_SLIDES}
              title="AI Decision Engine"
              subtitle="Hybrid AI with Explainable Reasoning"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <HighlightBox title="Input Layer" variant="primary">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1"><Database className="w-3 h-3" /> Performance Data</div>
                      <div className="flex items-center gap-1"><Users className="w-3 h-3" /> Learner Demographics</div>
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Attendance Patterns</div>
                      <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> Accessibility Profiles</div>
                    </div>
                  </HighlightBox>
                  <HighlightBox title="Processing Layer" variant="secondary">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1"><Brain className="w-3 h-3" /> Gemini Pro Analysis</div>
                      <div className="flex items-center gap-1"><Settings className="w-3 h-3" /> Rule-Based Fallbacks</div>
                      <div className="flex items-center gap-1"><Layers className="w-3 h-3" /> Reasoning Chains</div>
                      <div className="flex items-center gap-1"><Shield className="w-3 h-3" /> Bias Detection</div>
                    </div>
                  </HighlightBox>
                  <HighlightBox title="Output Layer" variant="success">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1"><Target className="w-3 h-3" /> Recommendations</div>
                      <div className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Intervention Alerts</div>
                      <div className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Progress Reports</div>
                      <div className="flex items-center gap-1"><FileText className="w-3 h-3" /> Reasoning Logs</div>
                    </div>
                  </HighlightBox>
                </div>

                <div className="bg-card/30 rounded-xl p-4 border border-border/30">
                  <h4 className="font-semibold text-sm text-center mb-3">15+ Edge Functions</h4>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {[
                      "analyze-learner",
                      "suggest-interventions",
                      "analyze-performance",
                      "check-attendance-alerts",
                      "generate-insights",
                      "recommend-training",
                      "calculate-equity-metrics",
                      "check-class-capacity",
                      "recommend-visual-materials",
                      "generate-weekly-report"
                    ].map((fn, i) => (
                      <div key={i} className="bg-primary/10 rounded-lg px-2 py-1 text-center text-[10px] border border-primary/20">
                        {fn}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PresentationSlide>
          </div>
        );

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

      case 11:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={11}
              totalSlides={TOTAL_SLIDES}
              title="Application Screenshots"
              subtitle="Live Demonstration of System Capabilities"
            >
              <div className="grid grid-cols-3 gap-4 h-full">
                <ScreenshotPlaceholder 
                  title="Admin Dashboard" 
                  description="System-wide analytics and monitoring"
                  features={["Learner/Teacher Management", "AI Performance Insights", "Equity Metrics", "Nigerian Standards"]}
                />
                <ScreenshotPlaceholder 
                  title="Teacher Portal" 
                  description="Student management and AI insights"
                  features={["Student Profiles", "Attendance Tracking", "Content Creation", "Recommendations"]}
                />
                <ScreenshotPlaceholder 
                  title="Learner Dashboard" 
                  description="Personalized learning experience"
                  features={["Progress Timeline", "Learning Materials", "Quiz Taking", "Accessibility Tools"]}
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground italic">
                  Replace these placeholders with actual screenshots from the live application for your defense presentation
                </p>
              </div>
            </PresentationSlide>
          </div>
        );

      case 12:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={12}
              totalSlides={TOTAL_SLIDES}
              title="Results & Findings"
            >
              <TwoColumn
                left={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">System Achievements</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <StatBox value="3" label="User Roles (Admin, Teacher, Learner)" />
                      <StatBox value="15+" label="AI Edge Functions" />
                      <StatBox value="25+" label="Database Tables" />
                      <StatBox value="100%" label="RLS Security Coverage" />
                    </div>
                    <HighlightBox title="Technical Accomplishments" variant="primary">
                      <div className="text-xs space-y-1">
                        <div>✓ Full-stack responsive web application</div>
                        <div>✓ Hybrid AI with explainable reasoning</div>
                        <div>✓ Real-time data synchronization</div>
                        <div>✓ Nigerian curriculum integration</div>
                      </div>
                    </HighlightBox>
                  </div>
                }
                right={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Key Outcomes</h4>
                    <BulletList className="text-sm">
                      <BulletPoint icon={CheckCircle}>AI-generated personalized recommendations</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Real-time attendance tracking with automated alerts</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Transparent AI reasoning chain display</BulletPoint>
                      <BulletPoint icon={CheckCircle}>NERDC curriculum standards alignment</BulletPoint>
                      <BulletPoint icon={CheckCircle}>WAEC/NECO assessment framework support</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Teacher professional development recommendations</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Comprehensive accessibility toolkit</BulletPoint>
                    </BulletList>
                  </div>
                }
              />
            </PresentationSlide>
          </div>
        );

      case 13:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={13}
              totalSlides={TOTAL_SLIDES}
              title="Research Contributions & Impact"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <HighlightBox title="Theoretical Contributions" variant="primary">
                  <BulletList className="text-sm">
                    <BulletPoint icon={Award}>Novel framework for AI-enhanced inclusive education in developing countries</BulletPoint>
                    <BulletPoint icon={Award}>Model for explainable AI in educational decision-making contexts</BulletPoint>
                    <BulletPoint icon={Award}>Integration pattern for aligning AI systems with local curriculum standards</BulletPoint>
                    <BulletPoint icon={Award}>Ethical AI framework with bias monitoring for educational equity</BulletPoint>
                  </BulletList>
                </HighlightBox>
                <HighlightBox title="Practical Contributions" variant="secondary">
                  <BulletList className="text-sm">
                    <BulletPoint icon={CheckCircle}>Fully functional production-ready web application</BulletPoint>
                    <BulletPoint icon={CheckCircle}>Teacher decision-support tools with AI reasoning transparency</BulletPoint>
                    <BulletPoint icon={CheckCircle}>Accessible content management system with multiple formats</BulletPoint>
                    <BulletPoint icon={CheckCircle}>Scalable architecture for national-level deployment</BulletPoint>
                  </BulletList>
                </HighlightBox>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-4">
                <StatBox value="Policy" label="Informs Educational Policy" icon={FileText} />
                <StatBox value="Practice" label="Supports Teacher Decision-Making" icon={Users} />
                <StatBox value="Research" label="Advances AI in Education" icon={Brain} />
                <StatBox value="Equity" label="Promotes Inclusive Access" icon={Shield} />
              </div>
            </PresentationSlide>
          </div>
        );

      case 14:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={14}
              totalSlides={TOTAL_SLIDES}
              title="Limitations & Future Work"
            >
              <TwoColumn
                left={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Current Limitations
                    </h4>
                    <BulletList className="text-sm">
                      <BulletPoint>Limited real-world user testing in Nigerian schools</BulletPoint>
                      <BulletPoint>Requires stable internet connectivity for full functionality</BulletPoint>
                      <BulletPoint>AI models benefit from continuous training and refinement</BulletPoint>
                      <BulletPoint>Scalability testing with large user bases pending</BulletPoint>
                      <BulletPoint>Integration with existing school management systems needed</BulletPoint>
                    </BulletList>
                  </div>
                }
                right={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-green-500 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Future Research Directions
                    </h4>
                    <BulletList className="text-sm">
                      <BulletPoint icon={Lightbulb}>Offline PWA support for rural Nigerian areas</BulletPoint>
                      <BulletPoint icon={Lightbulb}>Multi-language support (Hausa, Yoruba, Igbo, Pidgin)</BulletPoint>
                      <BulletPoint icon={Lightbulb}>Parent/Guardian portal for home-school collaboration</BulletPoint>
                      <BulletPoint icon={Lightbulb}>Native mobile applications (iOS/Android)</BulletPoint>
                      <BulletPoint icon={Lightbulb}>Extended pilot testing across Nigerian states</BulletPoint>
                      <BulletPoint icon={Lightbulb}>Integration with UBEC and state education databases</BulletPoint>
                    </BulletList>
                  </div>
                }
              />
            </PresentationSlide>
          </div>
        );

      case 15:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={15}
              totalSlides={TOTAL_SLIDES}
              title="Conclusion"
              variant="conclusion"
            >
              <div className="max-w-4xl mx-auto space-y-6">
                <QuoteBox
                  quote="This research demonstrates that AI can effectively support inclusive education decision-making while maintaining transparency, ethical standards, and alignment with local educational contexts. The developed system provides a scalable, accessible platform for improving educational outcomes for all learners."
                  className="text-center bg-card/30 border-primary"
                />
                <div className="grid grid-cols-4 gap-3">
                  <StatBox value="✓" label="AI-Powered Accessibility" icon={Brain} />
                  <StatBox value="✓" label="Evidence-Based Decisions" icon={Target} />
                  <StatBox value="✓" label="Nigerian Context Aligned" icon={GraduationCap} />
                  <StatBox value="✓" label="Ethical & Transparent" icon={Shield} />
                </div>
                <div className="text-center space-y-3 mt-6">
                  <h3 className="text-2xl font-bold text-primary">Thank You</h3>
                  <p className="text-muted-foreground">Questions & Discussion Welcome</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <div className="bg-primary/10 rounded-lg px-4 py-2 border border-primary/30">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">[your.email@university.edu]</p>
                    </div>
                    <div className="bg-secondary/10 rounded-lg px-4 py-2 border border-secondary/30">
                      <p className="text-xs text-muted-foreground">Live Demo</p>
                      <p className="text-sm font-medium">Available for demonstration</p>
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
