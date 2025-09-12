import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap, Shield, Globe, TrendingUp } from "lucide-react";

const CallToAction = () => {
  const handleGetStarted = () => {
    console.log("Get Started clicked");
    // Here you would implement navigation to signup/onboarding
  };

  const handleScheduleDemo = () => {
    console.log("Schedule Demo clicked");
    // Here you would implement demo scheduling
  };

  const features = [
    { icon: Zap, text: "AI-Powered Analytics" },
    { icon: Shield, text: "Secure Transactions" },
    { icon: Globe, text: "Multi-Language Support" },
    { icon: TrendingUp, text: "Market Intelligence" },
  ];

  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto bg-card/95 backdrop-blur-sm border-border shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-card-foreground">
                  Ready to Transform Your Real Estate Journey?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of professionals and investors who trust AI Real Estate Scout 
                  for their property needs across Arab countries, Turkey, and Iraq.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground text-center">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-primary hover:bg-primary-glow text-primary-foreground font-semibold px-8 py-4 text-lg shadow-glow"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleScheduleDemo}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 text-lg"
                >
                  Schedule Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4 text-success" />
                  <span className="text-sm">Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="w-4 h-4 text-info" />
                  <span className="text-sm">Global Compliance</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-sm">95% Accuracy</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CallToAction;