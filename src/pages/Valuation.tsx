import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calculator, MapPin, Home, TrendingUp } from "lucide-react";

const Valuation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Property Valuation</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get instant AI-powered property valuations with confidence intervals and market insights
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Property Valuation Tool
                  <Badge className="bg-accent text-accent-foreground">AI-Powered</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Property Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input placeholder="Enter property address..." className="pl-10" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Property Type</label>
                    <select className="w-full px-3 py-2 border border-input bg-background rounded-md">
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Industrial</option>
                      <option>Land</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Area (sq ft)</label>
                    <Input placeholder="e.g., 2500" type="number" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bedrooms</label>
                    <Input placeholder="e.g., 3" type="number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bathrooms</label>
                    <Input placeholder="e.g., 2" type="number" />
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary-glow text-primary-foreground" size="lg">
                  Get AI Valuation
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Home className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">Instant Results</h3>
                  <p className="text-sm text-muted-foreground">Get valuations in seconds</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <TrendingUp className="w-8 h-8 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">Market Analysis</h3>
                  <p className="text-sm text-muted-foreground">Compare with similar properties</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Calculator className="w-8 h-8 text-success mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">Confidence Score</h3>
                  <p className="text-sm text-muted-foreground">Reliability indicators included</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Valuation;