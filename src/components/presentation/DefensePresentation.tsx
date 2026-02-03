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
  FileText
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

const TOTAL_SLIDES = 12;

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
              <div className="space-y-4 mt-4">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Presented by: [Your Name]
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Supervisor: [Supervisor Name]
                </p>
                <p className="text-muted-foreground text-xs">
                  [Institution Name] • [Date]
                </p>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 max-w-3xl mx-auto">
                {[
                  { num: 1, label: "Introduction & Problem" },
                  { num: 2, label: "Research Questions" },
                  { num: 3, label: "Literature Review" },
                  { num: 4, label: "Methodology" },
                  { num: 5, label: "System Design" },
                  { num: 6, label: "Implementation" },
                  { num: 7, label: "Key Features" },
                  { num: 8, label: "Results & Findings" },
                  { num: 9, label: "Research Contributions" },
                  { num: 10, label: "Conclusion & Future Work" },
                ].map((item) => (
                  <div key={item.num} className="bg-card/50 rounded-lg p-3 text-center border border-border/30">
                    <span className="text-primary font-bold">{item.num}.</span>
                    <span className="text-xs sm:text-sm ml-2">{item.label}</span>
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
                      Over 10 million Nigerian children with disabilities lack access to quality inclusive education due to inadequate identification, limited resources, and absence of data-driven decision support.
                    </HighlightBox>
                    <BulletList>
                      <BulletPoint icon={Target}>Limited accessibility in traditional educational systems</BulletPoint>
                      <BulletPoint icon={Target}>Lack of personalized learning interventions</BulletPoint>
                      <BulletPoint icon={Target}>Insufficient teacher training for diverse needs</BulletPoint>
                      <BulletPoint icon={Target}>Absence of evidence-based decision making</BulletPoint>
                    </BulletList>
                  </div>
                }
                right={
                  <div className="grid grid-cols-2 gap-3">
                    <StatBox value="10M+" label="Children with Disabilities" icon={Users} />
                    <StatBox value="65%" label="Out of School" icon={GraduationCap} />
                    <StatBox value="<5%" label="Teachers Trained" icon={BookOpen} />
                    <StatBox value="Low" label="Data Utilization" icon={BarChart3} />
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
                    <BulletList className="space-y-4">
                      <BulletPoint>How can AI enhance accessibility identification and support in inclusive education?</BulletPoint>
                      <BulletPoint>What decision-making frameworks can improve educational outcomes for learners with diverse needs?</BulletPoint>
                      <BulletPoint>How can technology bridge the gap between policy and practice in Nigerian education?</BulletPoint>
                    </BulletList>
                  </div>
                }
                right={
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-secondary" />
                      Objectives
                    </h4>
                    <BulletList>
                      <BulletPoint icon={CheckCircle}>Develop AI-powered system for learner assessment</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Create personalized intervention recommendations</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Enable data-driven teacher decision support</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Align with Nigerian curriculum standards</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Ensure ethical AI with transparency</BulletPoint>
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
                <HighlightBox title="Inclusive Education" variant="primary">
                  <BulletList className="text-xs space-y-2">
                    <BulletPoint>UNESCO's Salamanca Statement (1994)</BulletPoint>
                    <BulletPoint>Universal Design for Learning (UDL)</BulletPoint>
                    <BulletPoint>Nigerian National Policy on Education</BulletPoint>
                    <BulletPoint>SDG 4: Quality Education for All</BulletPoint>
                  </BulletList>
                </HighlightBox>
                <HighlightBox title="AI in Education" variant="secondary">
                  <BulletList className="text-xs space-y-2">
                    <BulletPoint>Adaptive Learning Systems</BulletPoint>
                    <BulletPoint>Intelligent Tutoring Systems (ITS)</BulletPoint>
                    <BulletPoint>Learning Analytics & EDM</BulletPoint>
                    <BulletPoint>Explainable AI (XAI) in EdTech</BulletPoint>
                  </BulletList>
                </HighlightBox>
                <HighlightBox title="Decision Support" variant="success">
                  <BulletList className="text-xs space-y-2">
                    <BulletPoint>Evidence-Based Practice (EBP)</BulletPoint>
                    <BulletPoint>Multi-Tiered Support Systems (MTSS)</BulletPoint>
                    <BulletPoint>Response to Intervention (RTI)</BulletPoint>
                    <BulletPoint>Data-Driven Decision Making</BulletPoint>
                  </BulletList>
                </HighlightBox>
              </div>
              <QuoteBox 
                quote="AI should augment, not replace, educator expertise in making decisions about learner support."
                author="Holmes et al., 2019"
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
                      Design Science Research (DSR) methodology combining iterative development with evaluation cycles
                    </HighlightBox>
                    <DiagramBox
                      title="Development Phases"
                      type="flow"
                      items={[
                        { label: "Requirements" },
                        { label: "Design" },
                        { label: "Implement" },
                        { label: "Evaluate" },
                        { label: "Iterate" },
                      ]}
                    />
                  </div>
                }
                right={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Technology Stack</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-card/50 rounded-lg p-2 border border-border/30">
                        <div className="font-medium text-primary">Frontend</div>
                        <div className="text-muted-foreground">React, TypeScript, Tailwind CSS</div>
                      </div>
                      <div className="bg-card/50 rounded-lg p-2 border border-border/30">
                        <div className="font-medium text-primary">Backend</div>
                        <div className="text-muted-foreground">Supabase, Edge Functions</div>
                      </div>
                      <div className="bg-card/50 rounded-lg p-2 border border-border/30">
                        <div className="font-medium text-primary">AI/ML</div>
                        <div className="text-muted-foreground">Gemini Pro, Custom Models</div>
                      </div>
                      <div className="bg-card/50 rounded-lg p-2 border border-border/30">
                        <div className="font-medium text-primary">Database</div>
                        <div className="text-muted-foreground">PostgreSQL with RLS</div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm mt-3">Data Collection</h4>
                    <BulletList className="text-xs">
                      <BulletPoint>Learner profiles & accessibility needs</BulletPoint>
                      <BulletPoint>Performance records & assessments</BulletPoint>
                      <BulletPoint>Attendance tracking & analytics</BulletPoint>
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
            >
              <div className="space-y-4">
                <DiagramBox
                  title="Three-Tier Architecture"
                  type="flow"
                  items={[
                    { label: "Presentation Layer", description: "React UI" },
                    { label: "Application Layer", description: "Business Logic" },
                    { label: "Data Layer", description: "PostgreSQL" },
                  ]}
                  className="max-w-2xl mx-auto"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <HighlightBox title="Role-Based Access" variant="primary">
                    <div className="text-xs space-y-1">
                      <div>• Learners: Self-tracking, materials</div>
                      <div>• Teachers: Full management</div>
                      <div>• Admins: System oversight</div>
                    </div>
                  </HighlightBox>
                  <HighlightBox title="AI Integration" variant="secondary">
                    <div className="text-xs space-y-1">
                      <div>• Hybrid AI approach</div>
                      <div>• Rule-based fallbacks</div>
                      <div>• Explainable reasoning</div>
                    </div>
                  </HighlightBox>
                  <HighlightBox title="Security & Privacy" variant="success">
                    <div className="text-xs space-y-1">
                      <div>• Row-Level Security (RLS)</div>
                      <div>• GDPR compliance</div>
                      <div>• Data consent management</div>
                    </div>
                  </HighlightBox>
                </div>
              </div>
            </PresentationSlide>
          </div>
        );

      case 8:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={8}
              totalSlides={TOTAL_SLIDES}
              title="Key Features & Implementation"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Brain, title: "AI Analytics", desc: "Learner performance insights & predictions" },
                  { icon: Users, title: "Accessibility Profiles", desc: "Comprehensive needs assessment" },
                  { icon: FileText, title: "Curriculum Alignment", desc: "Nigerian NERDC standards" },
                  { icon: TrendingUp, title: "Progress Tracking", desc: "Visual learning timelines" },
                  { icon: Settings, title: "Interventions", desc: "AI-suggested recommendations" },
                  { icon: Shield, title: "Bias Monitoring", desc: "Equity metrics dashboard" },
                  { icon: BookOpen, title: "Content Hub", desc: "Accessible learning materials" },
                  { icon: GraduationCap, title: "Teacher Training", desc: "Professional development" },
                ].map((feature, index) => (
                  <div key={index} className="bg-card/50 rounded-xl p-3 border border-border/30 text-center">
                    <feature.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold text-xs sm:text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                  </div>
                ))}
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
              title="Results & Findings"
            >
              <TwoColumn
                left={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">System Achievements</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <StatBox value="3" label="User Roles" />
                      <StatBox value="15+" label="AI Functions" />
                      <StatBox value="20+" label="Data Models" />
                      <StatBox value="100%" label="RLS Coverage" />
                    </div>
                    <HighlightBox title="Usability Findings" variant="primary">
                      <div className="text-xs">
                        Mobile-responsive design enables field use by teachers. Accessibility toolbar supports diverse user needs.
                      </div>
                    </HighlightBox>
                  </div>
                }
                right={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Key Outcomes</h4>
                    <BulletList className="text-sm">
                      <BulletPoint icon={CheckCircle}>Successful AI recommendation generation</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Real-time attendance tracking & alerts</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Transparent AI reasoning display</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Curriculum standards integration</BulletPoint>
                      <BulletPoint icon={CheckCircle}>Teacher training recommendations</BulletPoint>
                    </BulletList>
                  </div>
                }
              />
            </PresentationSlide>
          </div>
        );

      case 10:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={10}
              totalSlides={TOTAL_SLIDES}
              title="Research Contributions & Impact"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <HighlightBox title="Theoretical Contributions" variant="primary">
                  <BulletList className="text-sm">
                    <BulletPoint>Framework for AI-enhanced inclusive education</BulletPoint>
                    <BulletPoint>Model for explainable AI in educational contexts</BulletPoint>
                    <BulletPoint>Integration pattern for Nigerian curriculum standards</BulletPoint>
                  </BulletList>
                </HighlightBox>
                <HighlightBox title="Practical Contributions" variant="secondary">
                  <BulletList className="text-sm">
                    <BulletPoint>Functional web application prototype</BulletPoint>
                    <BulletPoint>Teacher decision-support tools</BulletPoint>
                    <BulletPoint>Accessible content management system</BulletPoint>
                  </BulletList>
                </HighlightBox>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <StatBox value="Policy" label="Informs Education Policy" icon={FileText} />
                <StatBox value="Practice" label="Supports Teachers" icon={Users} />
                <StatBox value="Research" label="Advances EdTech" icon={Brain} />
              </div>
            </PresentationSlide>
          </div>
        );

      case 11:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={11}
              totalSlides={TOTAL_SLIDES}
              title="Limitations & Future Work"
            >
              <TwoColumn
                left={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-destructive">Limitations</h4>
                    <BulletList className="text-sm">
                      <BulletPoint>Limited real-world testing with actual users</BulletPoint>
                      <BulletPoint>Requires internet connectivity</BulletPoint>
                      <BulletPoint>AI models need continued training</BulletPoint>
                      <BulletPoint>Scalability testing needed</BulletPoint>
                    </BulletList>
                  </div>
                }
                right={
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-success">Future Directions</h4>
                    <BulletList className="text-sm">
                      <BulletPoint icon={Lightbulb}>Offline PWA support for rural areas</BulletPoint>
                      <BulletPoint icon={Lightbulb}>Multi-language support (Hausa, Yoruba, Igbo)</BulletPoint>
                      <BulletPoint icon={Lightbulb}>Parent/Guardian portal integration</BulletPoint>
                      <BulletPoint icon={Lightbulb}>Mobile app development</BulletPoint>
                      <BulletPoint icon={Lightbulb}>Extended pilot testing in Nigerian schools</BulletPoint>
                    </BulletList>
                  </div>
                }
              />
            </PresentationSlide>
          </div>
        );

      case 12:
        return (
          <div id={slideId} key={slideNum}>
            <PresentationSlide
              slideNumber={12}
              totalSlides={TOTAL_SLIDES}
              title="Conclusion"
              variant="conclusion"
            >
              <div className="max-w-3xl mx-auto space-y-6">
                <QuoteBox
                  quote="This research demonstrates that AI can effectively support inclusive education decision-making while maintaining transparency, ethical standards, and alignment with local educational contexts."
                  className="text-center"
                />
                <div className="grid grid-cols-3 gap-4">
                  <StatBox value="✓" label="AI-Enhanced Accessibility" icon={Brain} />
                  <StatBox value="✓" label="Evidence-Based Decisions" icon={Target} />
                  <StatBox value="✓" label="Nigerian Context Aligned" icon={GraduationCap} />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-primary">Thank You</h3>
                  <p className="text-muted-foreground">Questions & Discussion</p>
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
