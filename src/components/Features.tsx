import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  TrendingUp, 
  BarChart3, 
  Calculator, 
  MapPin, 
  Shield, 
  Globe, 
  FileText,
  Brain,
  Target,
  PieChart,
  Zap
} from "lucide-react";

const Features = () => {
  const marketplaceFeatures = [
    {
      icon: Home,
      title: "Smart Property Listings",
      description: "AI-powered listing creation with automatic pricing suggestions and market positioning."
    },
    {
      icon: MapPin,
      title: "Advanced Search & Discovery",
      description: "Multi-criteria filtering with interactive maps, heatmaps, and saved search alerts."
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "End-to-end encrypted communications, document management, and transaction facilitation."
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Full support for Arabic RTL, English LTR, Kurdish Sorani, and Turkish languages."
    }
  ];

  const analyticsFeatures = [
    {
      icon: Brain,
      title: "AI Property Valuation",
      description: "Automated valuation models with confidence scoring and comparative market analysis."
    },
    {
      icon: TrendingUp,
      title: "Predictive Market Forecasting",
      description: "1-5 year market trend predictions with economic indicator integration and risk scoring."
    },
    {
      icon: Calculator,
      title: "Investment Analysis Tools",
      description: "ROI/IRR calculations, cash flow projections, and comprehensive risk assessments."
    },
    {
      icon: Target,
      title: "Development Advisory",
      description: "Optimal use recommendations, feasibility studies, and financial analysis for developers."
    },
    {
      icon: PieChart,
      title: "Portfolio Analysis",
      description: "Track your real estate investments with performance metrics and growth insights."
    },
    {
      icon: FileText,
      title: "Automated Reports",
      description: "AI-generated reports in PDF/Excel formats with natural language summaries."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Marketplace Features */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real Estate Marketplace
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive platform for listing, browsing, and transacting properties with intelligent tools and seamless user experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {marketplaceFeatures.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Features */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-accent mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              AI-Powered Analytics Hub
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced intelligence system providing AI-driven insights, predictive analytics, and comprehensive market intelligence for informed decision-making.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyticsFeatures.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
              <CardHeader>
                <div className="w-12 h-12 mb-3 bg-accent rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-lg text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;