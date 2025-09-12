import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Home, BarChart3 } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 animate-float">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Home className="w-8 h-8 text-primary-foreground" />
        </div>
      </div>
      <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: "1s" }}>
        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <TrendingUp className="w-10 h-10 text-accent-foreground" />
        </div>
      </div>
      <div className="absolute bottom-40 left-40 animate-float" style={{ animationDelay: "2s" }}>
        <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <BarChart3 className="w-6 h-6 text-success-foreground" />
        </div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-primary-foreground animate-fade-in">
            The Region's Most
            <span className="block bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
              Comprehensive Real Estate Platform
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Seamlessly integrating traditional property transactions with cutting-edge AI analytics, serving individual consumers and enterprise clients throughout Arab countries, Turkey, and Iraq.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button size="lg" className="bg-accent hover:bg-accent-glow text-accent-foreground font-semibold px-8 py-4 text-lg shadow-glow">
              Explore Properties
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold px-8 py-4 text-lg">
              AI Analytics Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">50K+</div>
              <div className="text-primary-foreground/80">Properties Listed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">95%</div>
              <div className="text-primary-foreground/80">AI Valuation Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">4</div>
              <div className="text-primary-foreground/80">Languages Supported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">24/7</div>
              <div className="text-primary-foreground/80">Market Intelligence</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;