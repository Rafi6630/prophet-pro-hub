import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building, 
  TrendingUp, 
  Home, 
  Briefcase, 
  UserCheck,
  CreditCard,
  ArrowRight
} from "lucide-react";

const UserTypes = () => {
  const userTypes = [
    {
      icon: Users,
      title: "Buyers & Renters",
      description: "Find your perfect property with AI-powered search, valuation tools, virtual tours, and personalized recommendations.",
      features: ["Advanced search & filtering", "AI valuation insights", "ROI calculator", "Saved searches & alerts", "Virtual reality tours"],
      color: "bg-primary",
      textColor: "text-primary-foreground"
    },
    {
      icon: Home,
      title: "Individual Listers",
      description: "List your property with AI pricing guidance, auto-generated descriptions, and reach qualified buyers.",
      features: ["Easy listing process", "AI pricing suggestions", "Auto-generated descriptions", "Secure messaging", "Performance analytics"],
      color: "bg-accent",
      textColor: "text-accent-foreground"
    },
    {
      icon: Briefcase,
      title: "Real Estate Agents",
      description: "Grow your business with professional tools, lead generation, client management, and comprehensive market analytics.",
      features: ["Lead generation", "Client management", "Market analytics", "Featured listings", "CRM integration"],
      color: "bg-success",
      textColor: "text-success-foreground"
    },
    {
      icon: TrendingUp,
      title: "Premium Investors",
      description: "Access advanced AI analytics, unlimited reports, sophisticated investment forecasting, and portfolio tracking tools.",
      features: ["Investment forecasting (ROI/IRR)", "Unlimited AI reports", "Portfolio analysis", "Market predictions", "Risk scoring"],
      color: "bg-info",
      textColor: "text-info-foreground"
    },
    {
      icon: Building,
      title: "Developers & Development Firms",
      description: "Plan large-scale projects with AI-powered feasibility studies, optimal use recommendations, and financial analysis.",
      features: ["Project planning tools", "Feasibility studies", "Design optimization", "NPV analysis", "Unit management"],
      color: "bg-warning",
      textColor: "text-warning-foreground"
    },
    {
      icon: CreditCard,
      title: "Mortgage Advisors",
      description: "Integrate with listing data, manage customers, provide rate comparisons, and access AI valuation data for lending decisions.",
      features: ["Listing integration", "Customer management", "Rate comparison", "Pre-approval process", "AI valuation access"],
      color: "bg-secondary",
      textColor: "text-secondary-foreground"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built for Every Real Estate Professional
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Specialized tools and features tailored for every real estate professional, from individual buyers to enterprise developers, with full compliance for Arab countries, Turkey, and Iraq.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {userTypes.map((userType, index) => (
            <Card key={index} className="border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card group">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 ${userType.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <userType.icon className={`w-8 h-8 ${userType.textColor}`} />
                </div>
                <CardTitle className="text-xl text-card-foreground">{userType.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-center text-muted-foreground">
                  {userType.description}
                </CardDescription>
                
                <div className="space-y-2">
                  {userType.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <UserCheck className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-card p-8 rounded-2xl border border-border shadow-lg">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Transform Your Real Estate Business?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of professionals who trust AI Real Estate Scout for their property needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary-glow text-primary-foreground font-semibold">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserTypes;