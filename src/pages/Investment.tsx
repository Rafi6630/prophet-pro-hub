import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calculator, 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  BarChart3, 
  Target,
  FileText,
  Shield
} from "lucide-react";

const Investment = () => {
  const tools = [
    {
      icon: Calculator,
      title: "ROI Calculator",
      description: "Calculate return on investment with comprehensive financial modeling",
      action: "Calculate ROI"
    },
    {
      icon: TrendingUp,
      title: "Cash Flow Analysis",
      description: "Project future cash flows and analyze investment performance",
      action: "Analyze Cash Flow"
    },
    {
      icon: PieChart,
      title: "Portfolio Optimizer",
      description: "Optimize your property portfolio allocation and risk management",
      action: "Optimize Portfolio"
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Comprehensive risk analysis matrices for informed decisions",
      action: "Assess Risk"
    },
    {
      icon: BarChart3,
      title: "Market Sensitivity",
      description: "Test your investments against various market scenarios",
      action: "Run Analysis"
    },
    {
      icon: FileText,
      title: "Tax Implications",
      description: "Analyze tax implications and optimize your investment structure",
      action: "Calculate Tax"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Investment Tools</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Make data-driven investment decisions with comprehensive financial modeling and analysis tools
            </p>
          </div>

          {/* Quick Investment Calculator */}
          <Card className="mb-12 bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-6 h-6 text-primary" />
                Quick Investment Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="purchase-price">Purchase Price</Label>
                  <Input id="purchase-price" placeholder="$500,000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rental-income">Monthly Rental Income</Label>
                  <Input id="rental-income" placeholder="$3,000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expenses">Monthly Expenses</Label>
                  <Input id="expenses" placeholder="$800" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="down-payment">Down Payment (%)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select percentage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="30">30%</SelectItem>
                      <SelectItem value="40">40%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input id="interest-rate" placeholder="4.5" />
                </div>
              </div>
              <Button className="w-full md:w-auto">
                <DollarSign className="w-4 h-4 mr-2" />
                Calculate Investment Returns
              </Button>
            </CardContent>
          </Card>

          {/* Investment Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {tools.map((tool, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-3">
                    <tool.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{tool.description}</p>
                  <Button variant="outline" className="w-full">
                    {tool.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Banner */}
          <div className="bg-gradient-primary rounded-xl p-8 text-center text-primary-foreground">
            <h2 className="text-2xl font-bold mb-4">Advanced Investment Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Target className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold">NPV Calculations</h3>
                <p className="text-sm opacity-90">Net Present Value analysis for long-term investments</p>
              </div>
              <div>
                <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold">Sensitivity Testing</h3>
                <p className="text-sm opacity-90">Test scenarios across different market conditions</p>
              </div>
              <div>
                <PieChart className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold">Portfolio Analysis</h3>
                <p className="text-sm opacity-90">Comprehensive portfolio optimization tools</p>
              </div>
            </div>
            <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              Get Premium Analytics
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Investment;