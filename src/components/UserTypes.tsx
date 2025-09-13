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
      icon: TrendingUp,
      title: "Individual Investors",
      description: "Property Analysis, Market Trends, Investment Guidance with AI-powered recommendations, portfolio tracking and optimization, and risk assessment tools.",
      features: ["Detailed property assessments", "Real-time market insights", "AI-powered recommendations", "Portfolio tracking", "Risk assessment tools"],
      color: "bg-primary",
      textColor: "text-primary-foreground",
      tagline: "Make confident investment decisions with professional-grade tools!"
    },
    {
      icon: Users,
      title: "Property Owners",
      description: "Property Valuation, SWOT Analysis, Development Advice with optimization recommendations, rental yield analysis, and maintenance tracking.",
      features: ["Accurate market valuations", "Comprehensive property assessment", "Optimization recommendations", "Rental yield analysis", "Maintenance tracking"],
      color: "bg-accent",
      textColor: "text-accent-foreground",
      tagline: "Maximize your property value with expert insights!"
    },
    {
      icon: Building,
      title: "Developers",
      description: "Project Planning for complete development lifecycle, Feasibility Studies with financial modeling, Unit Management for inventory and sales tracking.",
      features: ["Complete development lifecycle", "Financial modeling", "Inventory and sales tracking", "Construction cost analysis", "Regulatory compliance"],
      color: "bg-success",
      textColor: "text-success-foreground",
      tagline: "Streamline your development projects with AI insights!"
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