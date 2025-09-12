import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  TrendingUp, 
  Calculator, 
  FileText, 
  BarChart3, 
  Target,
  ArrowRight,
  Zap,
  CheckCircle
} from "lucide-react";

const AIShowcase = () => {
  const aiCapabilities = [
    {
      icon: Brain,
      title: "Automated Valuation Models (AVM)",
      confidence: "95%",
      description: "AI-driven price estimation using multiple data points, government land registry data, and regional market indicators with confidence scoring.",
      benefits: [
        "Instant property valuations",
        "Confidence interval analysis",
        "Comparative market analysis",
        "Value drivers explanation",
        "Regional compliance checks"
      ]
    },
    {
      icon: TrendingUp,
      title: "Predictive Market Forecasting",
      confidence: "92%",
      description: "Advanced time-series analysis predicting market trends for the next 1-5 years with macroeconomic indicators and regional data integration.",
      benefits: [
        "Price appreciation forecasts",
        "Rental yield predictions",
        "Supply & demand dynamics",
        "Risk scoring & volatility analysis",
        "Heatmaps of opportunity"
      ]
    },
    {
      icon: Calculator,
      title: "Investment Analysis Engine",
      confidence: "98%",
      description: "Comprehensive ROI/IRR calculations, cash flow projections, and sophisticated risk assessments with portfolio tracking capabilities.",
      benefits: [
        "ROI & IRR forecasting",
        "Cash flow projections",
        "Risk assessment models",
        "Portfolio optimization",
        "AI investment recommendations"
      ]
    },
    {
      icon: Target,
      title: "Development Advisory AI",
      confidence: "89%",
      description: "Optimal use recommendations for properties with feasibility studies, design optimization, and comprehensive financial analysis for developers.",
      benefits: [
        "Optimal use suggestions",
        "Design optimization",
        "Financial feasibility (NPV)",
        "Unit mix recommendations",
        "Project planning insights"
      ]
    }
  ];

  return (
    <section id="ai-analytics" className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4">
              <Zap className="w-6 h-6 text-accent-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              AI-Powered Intelligence
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our advanced AI systems process millions of data points from regional markets, government registries, and economic indicators to deliver accurate insights, predictions, and recommendations for smarter real estate decisions across Arab countries, Turkey, and Iraq.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {aiCapabilities.map((capability, index) => (
            <Card key={index} className="border-border hover:shadow-xl transition-all duration-300 bg-card group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-primary rounded-lg flex items-center justify-center`}>
                    <capability.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    {capability.confidence} Accuracy
                  </Badge>
                </div>
                <CardTitle className="text-xl text-card-foreground">{capability.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {capability.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {capability.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-success mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Report Preview */}
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-4">
                <FileText className="w-8 h-8 text-accent mr-3" />
                <h3 className="text-2xl font-bold text-card-foreground">
                  Automated Report Generation
                </h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Generate comprehensive reports in PDF and Excel formats with natural language summaries, 
                visual data representations, and multi-language support for professional presentations.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-info mr-3" />
                  <span className="text-muted-foreground">Visual charts and graphs</span>
                </div>
                <div className="flex items-center">
                  <Brain className="w-5 h-5 text-info mr-3" />
                  <span className="text-muted-foreground">AI-generated insights</span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-info mr-3" />
                  <span className="text-muted-foreground">Multiple export formats</span>
                </div>
              </div>

              <Button className="bg-accent hover:bg-accent-glow text-accent-foreground">
                View Sample Report
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            <div className="bg-gradient-card p-6 rounded-xl border border-border">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Sample AI Report Output</div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="font-medium">Property Valuation</span>
                    <span className="text-success font-bold">$425,000</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="font-medium">Confidence Score</span>
                    <span className="text-info font-bold">94.5%</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="font-medium">Market Trend</span>
                    <span className="text-accent font-bold">↗ +12.3%</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="font-medium">Investment Rating</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full mr-1 ${i < 4 ? 'bg-accent' : 'bg-muted'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIShowcase;