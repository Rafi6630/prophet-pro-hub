import { Button } from "@/components/ui/button";
import { 
  Home, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  ArrowRight
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter Section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">
              Stay Updated with Market Insights
            </h3>
            <p className="text-muted-foreground mb-6">
              Get the latest real estate trends, AI-powered market analysis, and investment opportunities delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-6">
                Subscribe
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-lg text-card-foreground">AI Real Estate</div>
                <div className="text-xs text-accent font-semibold">Scout</div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              The region's most comprehensive real estate platform serving Arab countries, Turkey, and Iraq with AI-powered analytics, marketplace functionality, and enterprise-grade compliance.
            </p>
            <div className="flex space-x-3">
              <Button size="sm" variant="outline" className="w-10 h-10 p-0">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="w-10 h-10 p-0">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="w-10 h-10 p-0">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="w-10 h-10 p-0">
                <Instagram className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Marketplace Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-card-foreground">Marketplace</h4>
            <div className="space-y-2">
              <a href="/properties" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Browse Properties
              </a>
              <a href="/list" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                List Your Property
              </a>
              <a href="/agents" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Find Agents
              </a>
              <a href="/developers" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Developer Portal
              </a>
              <a href="/mortgage" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Mortgage Services
              </a>
            </div>
          </div>

          {/* AI Analytics Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-card-foreground">AI Analytics</h4>
            <div className="space-y-2">
              <a href="/valuation" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                Property Valuation
              </a>
              <a href="/market-forecast" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                Market Forecasting
              </a>
              <a href="/investment-analysis" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                Investment Analysis
              </a>
              <a href="/portfolio" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                Portfolio Tracking
              </a>
              <a href="/reports" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                AI Reports
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-card-foreground">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span>123 Innovation Street, Tech District, Smart City</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>info@airealestateaiscout.com</span>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <a href="/support" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Support Center
              </a>
              <a href="/privacy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} AI Real Estate Scout. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center space-x-6 text-sm text-muted-foreground">
              <span>Regional Coverage & Languages:</span>
              <button className="hover:text-primary transition-colors">العربية (RTL)</button>
              <button className="hover:text-primary transition-colors">English (LTR)</button>
              <button className="hover:text-primary transition-colors">کوردی (RTL)</button>
              <button className="hover:text-primary transition-colors">Türkçe (LTR)</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;