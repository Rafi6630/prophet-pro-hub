import { Button } from "@/components/ui/button";
import { Globe, Zap, Shield, Home, TrendingUp, BarChart3 } from "lucide-react";

const Hero = () => {
  const handleExploreProperties = () => {
    const searchSection = document.getElementById('search-section');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAIDemoClick = () => {
    const aiSection = document.getElementById('ai-showcase');
    if (aiSection) {
      aiSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Home className="absolute top-1/4 left-1/4 h-8 w-8 text-primary/30 animate-float" />
        <TrendingUp className="absolute top-1/3 right-1/3 h-6 w-6 text-secondary/30 animate-float-delayed" />
        <BarChart3 className="absolute bottom-1/3 left-1/3 h-7 w-7 text-accent/30 animate-float" />
        <Globe className="absolute top-1/2 left-1/5 h-6 w-6 text-primary/30 animate-float" />
        <Zap className="absolute bottom-1/4 right-1/4 h-5 w-5 text-secondary/30 animate-float-delayed" />
        <Shield className="absolute top-1/5 right-1/5 h-6 w-6 text-accent/30 animate-float" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              TerraVista
            </span>
          </h1>
          <div className="text-xl md:text-2xl font-semibold text-muted-foreground mb-2">
            AI-Powered Real Estate Ecosystem
          </div>
          <div className="text-sm md:text-base text-muted-foreground italic">
            Empowering real estate decisions with AI-driven insights and global connectivity!
          </div>
        </div>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
          A multilingual, multi-currency platform serving buyers, sellers, agents, and investors 
          with advanced AI tools for property discovery, valuation, investment analysis, and automated marketing.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="px-8 py-3 text-lg"
            onClick={handleExploreProperties}
          >
            Start Property Search
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-3 text-lg"
            onClick={handleAIDemoClick}
          >
            Explore AI Tools
          </Button>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card/60 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="font-semibold text-foreground">Global Coverage</div>
            <div className="text-sm text-muted-foreground">Multi-market, multi-currency</div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="font-semibold text-foreground">AI-Powered</div>
            <div className="text-sm text-muted-foreground">99.2% valuation accuracy</div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="font-semibold text-foreground">Secure & Compliant</div>
            <div className="text-sm text-muted-foreground">GDPR, PDPL ready</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500K+</div>
            <div className="text-muted-foreground">Properties Listed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">99.2%</div>
            <div className="text-muted-foreground">AI Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100K+</div>
            <div className="text-muted-foreground">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4</div>
            <div className="text-muted-foreground">Languages</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;