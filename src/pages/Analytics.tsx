import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Calculator, FileText, Brain, Target } from "lucide-react";

const Analytics = () => {
  const features = [
    {
      icon: Calculator,
      title: "Property Valuation",
      description: "AI-driven property value estimation with confidence intervals",
      badge: "AVM"
    },
    {
      icon: TrendingUp,
      title: "Market Forecasting",
      description: "Predictive analytics for market trends and price movements",
      badge: "Predictive"
    },
    {
      icon: BarChart3,
      title: "Investment Analysis",
      description: "ROI, IRR, and cash flow analysis for investment properties",
      badge: "ROI"
    },
    {
      icon: Target,
      title: "Portfolio Tracking",
      description: "Comprehensive analysis of your real estate investment portfolio",
      badge: "Portfolio"
    },
    {
      icon: Brain,
      title: "Development Advisory",
      description: "Optimal use recommendations and feasibility studies",
      badge: "Advisory"
    },
    {
      icon: FileText,
      title: "Report Generation",
      description: "Automated reports in PDF and Excel formats",
      badge: "Reports"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">AI-Powered Analytics</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced intelligence system providing comprehensive property valuation, market insights, and investment analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <feature.icon className="w-8 h-8 text-accent" />
                    <Badge variant="secondary" className="bg-accent/10 text-accent">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-primary rounded-xl p-8 text-center text-primary-foreground">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-6 opacity-90">
              Unlock the power of AI analytics for your real estate decisions
            </p>
            <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              Start Free Trial
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Analytics;