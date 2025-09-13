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
      title: "Advanced Property Search",
      description: "AI-powered search algorithms with map-based discovery, smart filters, personalized recommendations, and price history analysis. Find your perfect property with intelligent search technology!"
    },
    {
      icon: MapPin,
      title: "Multi-Market Coverage",
      description: "Comprehensive coverage across Saudi Arabia, UAE, Qatar, Bahrain, Kuwait with regional economic indicators and cross-border investment tools. Complete Gulf region coverage!"
    },
    {
      icon: Shield,
      title: "Direct Communication",
      description: "Secure in-app messaging, appointment scheduling, document sharing platform, video call integration with multi-language support. Connect directly with verified professionals!"
    },
    {
      icon: Globe,
      title: "Automated Report Generation",
      description: "PDF, Excel, PowerPoint formats with natural language summaries, custom branding, interactive visualizations, and multi-language support. Professional reports ready in seconds!"
    }
  ];

  const analyticsFeatures = [
    {
      icon: Brain,
      title: "AI Property Valuation",
      description: "Instant valuations with 99.2% accuracy, confidence interval scoring, comparative market analysis, value drivers identification, and historical trend analysis. Get precise property valuations using advanced ML algorithms!"
    },
    {
      icon: Calculator,
      title: "Investment Analysis",
      description: "ROI forecasting & NPV calculations, cash flow projections, risk assessment matrices, portfolio optimization, tax implications analysis, and market sensitivity testing. Make data-driven investment decisions with comprehensive financial modeling!"
    },
    {
      icon: Target,
      title: "Development Advisory",
      description: "Optimal use recommendations, design optimization suggestions, financial feasibility studies, unit mix optimization, construction cost analysis, and regulatory compliance checks. Transform your development projects with AI-powered advisory services!"
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
            A comprehensive platform for listing, browsing, and transacting residential, commercial, industrial, and land properties with support for individual users, agents, and developers.
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