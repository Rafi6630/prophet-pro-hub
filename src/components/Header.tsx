import { Button } from "@/components/ui/button";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  BarChart3, 
  Users, 
  Building, 
  TrendingUp, 
  Calculator,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const marketplaceItems = [
    { title: "Browse Properties", href: "/properties", icon: Home },
    { title: "List Property", href: "/list", icon: Building },
    { title: "Market Search", href: "/search", icon: TrendingUp },
  ];

  const analyticsItems = [
    { title: "Property Valuation", href: "/valuation", icon: Calculator },
    { title: "Market Analytics", href: "/analytics", icon: BarChart3 },
    { title: "Investment Tools", href: "/investment", icon: TrendingUp },
  ];

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-lg text-foreground">AI Real Estate</div>
              <div className="text-xs text-accent font-semibold">Scout</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-foreground hover:text-primary">
                    Marketplace
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <div className="row-span-3">
                        <div className="mb-2 text-lg font-medium">Real Estate Marketplace</div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Browse, list, and transact properties with intelligent tools.
                        </p>
                      </div>
                      {marketplaceItems.map((item) => (
                        <NavigationMenuLink key={item.href} asChild>
                          <Link
                            to={item.href}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                          >
                            <item.icon className="w-5 h-5 text-primary" />
                            <div>
                              <div className="font-medium">{item.title}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-foreground hover:text-primary">
                    AI Analytics
                    <Badge variant="secondary" className="ml-2 bg-accent text-accent-foreground">
                      AI
                    </Badge>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <div className="row-span-3">
                        <div className="mb-2 text-lg font-medium">AI-Powered Analytics</div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Advanced intelligence for property valuation and market insights.
                        </p>
                      </div>
                      {analyticsItems.map((item) => (
                        <NavigationMenuLink key={item.href} asChild>
                          <Link
                            to={item.href}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                          >
                            <item.icon className="w-5 h-5 text-accent" />
                            <div>
                              <div className="font-medium">{item.title}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink className="font-medium text-foreground hover:text-primary cursor-pointer">
                    About
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink className="font-medium text-foreground hover:text-primary cursor-pointer">
                    Contact
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <LanguageSwitcher />
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Sign In
            </Button>
            <Button className="bg-primary hover:bg-primary-glow text-primary-foreground">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground hover:text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="space-y-4">
              <div>
                <div className="font-semibold text-foreground mb-2">Marketplace</div>
                <div className="space-y-2 pl-4">
                  {marketplaceItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center space-x-3 p-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold text-foreground mb-2 flex items-center">
                  AI Analytics
                  <Badge variant="secondary" className="ml-2 bg-accent text-accent-foreground text-xs">
                    AI
                  </Badge>
                </div>
                <div className="space-y-2 pl-4">
                  {analyticsItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center space-x-3 p-2 text-muted-foreground hover:text-accent transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Link to="/about" className="block p-2 text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <Link to="/contact" className="block p-2 text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </div>

              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
                  Sign In
                </Button>
                <Button className="w-full bg-primary hover:bg-primary-glow text-primary-foreground">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;