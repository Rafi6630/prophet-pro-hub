import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Users, Building, TrendingUp, Briefcase } from "lucide-react";

const Pricing = () => {
  const userCategories = [
    {
      category: "Buyers & Renters",
      tagline: "Find your perfect property with confidence!",
      icon: <Users className="h-8 w-8" />,
      plans: [
        {
          name: "Basic",
          price: "Free",
          description: "Perfect for casual property browsing",
          features: [
            "Property search with basic filters",
            "Limited valuations (5/month)",
            "3 property comparisons/month",
            "Basic neighborhood insights",
            "Standard customer support"
          ],
          popular: false
        },
        {
          name: "Pro",
          price: "$19.99",
          period: "/month",
          description: "For serious property seekers",
          features: [
            "Unlimited AI-powered property search",
            "Unlimited property valuations",
            "Unlimited property comparisons",
            "Complete neighborhood insights",
            "Mortgage & affordability calculators",
            "SWOT analysis for properties",
            "Investment potential scoring",
            "Priority customer support"
          ],
          popular: true
        },
        {
          name: "Elite",
          price: "$39.99",
          period: "/month",
          description: "Advanced tools for property investors",
          features: [
            "Everything in Pro",
            "Personalized AI recommendations",
            "Detailed financial reports",
            "Market trend forecasting",
            "Investment portfolio tracking",
            "Direct agent connections",
            "Premium property alerts",
            "Dedicated account manager"
          ],
          popular: false
        }
      ]
    },
    {
      category: "Sellers & Landlords",
      tagline: "Maximize your property exposure and sales!",
      icon: <Building className="h-8 w-8" />,
      plans: [
        {
          name: "Basic",
          price: "$29.99",
          period: "/month",
          description: "Essential tools for property owners",
          features: [
            "Up to 5 property listings",
            "AI-generated descriptions",
            "Smart pricing recommendations",
            "Basic listing analytics",
            "Lead contact management",
            "Standard listing exposure"
          ],
          popular: false
        },
        {
          name: "Pro",
          price: "$69.99",
          period: "/month",
          description: "Professional listing management",
          features: [
            "Unlimited property listings",
            "Advanced performance analytics",
            "Featured listing options",
            "Market positioning advice",
            "Professional photography tips",
            "Enhanced lead management",
            "Social media integration",
            "Priority listing placement"
          ],
          popular: true
        },
        {
          name: "Elite",
          price: "$129.99",
          period: "/month",
          description: "Premium marketing suite",
          features: [
            "Everything in Pro",
            "Premium listing exposure",
            "AI content creation tools",
            "Advanced market analysis",
            "Automated lead nurturing",
            "Custom branding options",
            "API integrations",
            "Dedicated success manager"
          ],
          popular: false
        }
      ]
    },
    {
      category: "Real Estate Agents",
      tagline: "Grow your real estate business efficiently!",
      icon: <Briefcase className="h-8 w-8" />,
      plans: [
        {
          name: "Basic",
          price: "$99.99",
          period: "/month",
          description: "Essential CRM for individual agents",
          features: [
            "CRM for up to 100 clients",
            "Basic lead management",
            "Market reports",
            "Commission tracking",
            "Email marketing tools",
            "Basic analytics dashboard"
          ],
          popular: false
        },
        {
          name: "Pro",
          price: "$199.99",
          period: "/month",
          description: "Advanced tools for growing agencies",
          features: [
            "Unlimited client CRM",
            "Advanced lead generation",
            "Bulk property management",
            "Team collaboration tools",
            "Automated workflows",
            "Performance analytics",
            "Custom reporting",
            "Integration marketplace"
          ],
          popular: true
        },
        {
          name: "Elite",
          price: "$399.99",
          period: "/month",
          description: "Enterprise-grade solutions",
          features: [
            "Everything in Pro",
            "White-label solutions",
            "Advanced API access",
            "Custom integrations",
            "Dedicated infrastructure",
            "24/7 priority support",
            "Custom training sessions",
            "Enterprise security features"
          ],
          popular: false
        }
      ]
    },
    {
      category: "Investors & Developers",
      tagline: "Make data-driven investment decisions!",
      icon: <TrendingUp className="h-8 w-8" />,
      plans: [
        {
          name: "Basic",
          price: "$149.99",
          period: "/month",
          description: "Core investment analysis tools",
          features: [
            "ROI & IRR analysis",
            "Basic portfolio tracking",
            "Market trend reports",
            "Investment opportunity alerts",
            "Risk assessment tools",
            "Standard analytics dashboard"
          ],
          popular: false
        },
        {
          name: "Pro",
          price: "$299.99",
          period: "/month",
          description: "Advanced investment insights",
          features: [
            "Advanced portfolio optimization",
            "5-year market forecasting",
            "What-if scenario modeling",
            "Multi-market analysis",
            "Development advisory tools",
            "Custom investment reports",
            "API data access",
            "Priority deal flow"
          ],
          popular: true
        },
        {
          name: "Elite",
          price: "$599.99",
          period: "/month",
          description: "Enterprise investment platform",
          features: [
            "Everything in Pro",
            "Custom AI model training",
            "Institutional-grade analytics",
            "Private deal room access",
            "Dedicated research team",
            "Custom development tools",
            "Enterprise integrations",
            "White-glove service"
          ],
          popular: false
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Choose Your TerraVista Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Flexible pricing designed for every type of real estate professional. 
              Start free and scale as you grow.
            </p>
          </div>

          {userCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-20">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="text-primary">
                    {category.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {category.category}
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground">
                  {category.tagline}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {category.plans.map((plan, planIndex) => (
                  <Card 
                    key={planIndex} 
                    className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'}`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl font-bold text-foreground">
                        {plan.name}
                      </CardTitle>
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-primary">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-muted-foreground">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {plan.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plan.price === 'Free' ? 'Get Started Free' : 'Start Free Trial'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Additional Revenue Streams */}
          <div className="mt-20 bg-muted/50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-foreground text-center mb-8">
              Additional Services & Revenue Streams
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <h4 className="font-semibold text-foreground mb-2">Featured Listings</h4>
                <p className="text-sm text-muted-foreground">Premium placement for maximum visibility</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground mb-2">Transaction Commissions</h4>
                <p className="text-sm text-muted-foreground">1-2% commission on successful deals</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground mb-2">Data API Access</h4>
                <p className="text-sm text-muted-foreground">Monetized market insights for partners</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground mb-2">Value-Added Services</h4>
                <p className="text-sm text-muted-foreground">3D tours, professional photography, legal services</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Transform Your Real Estate Business?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of professionals already using TerraVista to grow their business with AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;