import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { 
  Calculator, 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  BarChart3, 
  Target,
  FileText,
  Shield,
  Globe,
  MapPin,
  Star,
  Zap,
  Download,
  RefreshCw,
  Brain,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  ArrowUpRight,
  Building2,
  Landmark,
  Home,
  Store
} from "lucide-react";

const Investment = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState("discovery");

  // Mock data for Growth Score opportunities
  const opportunities = [
    {
      id: 1,
      title: "Downtown Dubai Marina",
      location: "Dubai, UAE",
      growthScore: 94,
      roi: 18.5,
      type: "Apartment",
      price: 2850000,
      currency: "AED",
      riskLevel: "Medium",
      insights: ["High rental demand", "Tourism growth", "Infrastructure development"]
    },
    {
      id: 2,
      title: "Istanbul Beyoğlu District",
      location: "Istanbul, Turkey",
      growthScore: 89,
      roi: 22.3,
      type: "Commercial",
      price: 850000,
      currency: "TRY",
      riskLevel: "Low",
      insights: ["Economic recovery", "Foreign investment", "Urban renewal"]
    },
    {
      id: 3,
      title: "Baghdad New Capital",
      location: "Baghdad, Iraq",
      growthScore: 87,
      roi: 31.2,
      type: "Mixed-Use",
      price: 425000,
      currency: "IQD",
      riskLevel: "High",
      insights: ["Reconstruction boom", "Oil revenue growth", "Government incentives"]
    }
  ];

  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar", rate: 1.0 },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 3.67 },
    { code: "TRY", symbol: "₺", name: "Turkish Lira", rate: 29.15 },
    { code: "IQD", symbol: "ع.د", name: "Iraqi Dinar", rate: 1310 },
    { code: "SAR", symbol: "ر.س", name: "Saudi Riyal", rate: 3.75 },
    { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
    { code: "GBP", symbol: "£", name: "British Pound", rate: 0.81 }
  ];

  const portfolioMetrics = {
    totalValue: 2450000,
    totalROI: 24.7,
    diversificationScore: 8.3,
    riskScore: 6.2,
    properties: 12,
    growth12m: 18.5
  };

  const generateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      // Simulate report generation
    }, 3000);
  };

  const getPropertyIcon = (type: string) => {
    switch(type) {
      case "Apartment": return Home;
      case "Commercial": return Building2;
      case "Mixed-Use": return Store;
      default: return Landmark;
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case "Low": return "text-green-600";
      case "Medium": return "text-yellow-600";
      case "High": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyData = currencies.find(c => c.code === currency);
    if (!currencyData) return `${amount.toLocaleString()}`;
    
    const convertedAmount = selectedCurrency === currency ? amount : amount / currencyData.rate;
    const targetCurrency = currencies.find(c => c.code === selectedCurrency);
    
    return `${targetCurrency?.symbol}${convertedAmount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">TerraVista Investment Intelligence</h1>
              <p className="text-xl text-muted-foreground">
                AI-powered investment discovery & portfolio optimization for MENA markets
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-40">
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={generateReport} disabled={isGeneratingReport}>
                {isGeneratingReport ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export Report
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="discovery">AI Discovery</TabsTrigger>
              <TabsTrigger value="analysis">Investment Analysis</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="risk">Risk Tools</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* AI Discovery Tab */}
            <TabsContent value="discovery" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        AI-Curated Growth Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {opportunities.map((opp) => {
                        const PropertyIcon = getPropertyIcon(opp.type);
                        return (
                          <div key={opp.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <PropertyIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{opp.title}</h3>
                                  <p className="text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {opp.location}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                  <Zap className="w-4 h-4 text-yellow-500" />
                                  <span className="font-bold text-lg">{opp.growthScore}/100</span>
                                </div>
                                <Badge variant="secondary">Growth Score</Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <p className="text-sm text-muted-foreground">Price</p>
                                <p className="font-semibold">{formatCurrency(opp.price, opp.currency)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">ROI</p>
                                <p className="font-semibold text-green-600">{opp.roi}%</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Type</p>
                                <p className="font-semibold">{opp.type}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Risk</p>
                                <p className={`font-semibold ${getRiskColor(opp.riskLevel)}`}>{opp.riskLevel}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {opp.insights.map((insight, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {insight}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                Analyze
                              </Button>
                              <Button size="sm" variant="outline">
                                <Star className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Market Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Investment Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="residential">Residential</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="mixed">Mixed-Use</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Region Focus</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="All Markets" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uae">UAE</SelectItem>
                            <SelectItem value="turkey">Turkey</SelectItem>
                            <SelectItem value="iraq">Iraq</SelectItem>
                            <SelectItem value="saudi">Saudi Arabia</SelectItem>
                            <SelectItem value="qatar">Qatar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Min Growth Score: 80</Label>
                        <Progress value={80} className="mt-2" />
                      </div>
                      <div>
                        <Label>Risk Tolerance</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Medium" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conservative">Conservative</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">AI Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Strong Market Signal</p>
                            <p className="text-xs text-muted-foreground">Dubai real estate showing 15% growth</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Market Watch</p>
                            <p className="text-xs text-muted-foreground">Turkish lira volatility affects pricing</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Emerging Opportunity</p>
                            <p className="text-xs text-muted-foreground">Baghdad reconstruction projects</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Investment Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary" />
                      Multi-Currency Investment Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Purchase Price</Label>
                        <Input placeholder="Enter amount" />
                      </div>
                      <div>
                        <Label>Currency</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="USD" />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Monthly Rental</Label>
                        <Input placeholder="Rental income" />
                      </div>
                      <div>
                        <Label>Annual Expenses</Label>
                        <Input placeholder="Total expenses" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Down Payment %</Label>
                        <Input placeholder="20" />
                      </div>
                      <div>
                        <Label>Interest Rate %</Label>
                        <Input placeholder="4.5" />
                      </div>
                    </div>
                    <Button className="w-full">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Calculate IRR & NPV
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scenario Modeling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 border rounded-lg">
                          <h3 className="font-semibold text-green-600">Optimistic</h3>
                          <p className="text-2xl font-bold">28.5%</p>
                          <p className="text-sm text-muted-foreground">ROI</p>
                        </div>
                        <div className="p-3 border rounded-lg bg-primary/5">
                          <h3 className="font-semibold text-primary">Realistic</h3>
                          <p className="text-2xl font-bold">18.2%</p>
                          <p className="text-sm text-muted-foreground">ROI</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h3 className="font-semibold text-red-600">Pessimistic</h3>
                          <p className="text-2xl font-bold">8.7%</p>
                          <p className="text-sm text-muted-foreground">ROI</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Market Growth</span>
                          <span className="font-medium">+15%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Rental Yield</span>
                          <span className="font-medium">7.2%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Capital Appreciation</span>
                          <span className="font-medium">+12%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total IRR (5Y)</span>
                          <span className="font-medium text-primary">22.1%</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        <Target className="w-4 h-4 mr-2" />
                        Advanced Sensitivity Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-xl font-bold">{formatCurrency(portfolioMetrics.totalValue, "USD")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Portfolio ROI</p>
                        <p className="text-xl font-bold">{portfolioMetrics.totalROI}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Diversification</p>
                        <p className="text-xl font-bold">{portfolioMetrics.diversificationScore}/10</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Risk Score</p>
                        <p className="text-xl font-bold">{portfolioMetrics.riskScore}/10</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Residential - UAE</span>
                          <span>45%</span>
                        </div>
                        <Progress value={45} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Commercial - Turkey</span>
                          <span>30%</span>
                        </div>
                        <Progress value={30} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Mixed-Use - Iraq</span>
                          <span>15%</span>
                        </div>
                        <Progress value={15} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Land - Saudi Arabia</span>
                          <span>10%</span>
                        </div>
                        <Progress value={10} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Optimization Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Diversification Opportunity</p>
                          <p className="text-xs text-muted-foreground">Consider adding commercial properties in Qatar for better risk distribution</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Rebalancing Alert</p>
                          <p className="text-xs text-muted-foreground">Your UAE allocation is performing well - consider taking profits</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Currency Hedge</p>
                          <p className="text-xs text-muted-foreground">High TRY exposure - consider currency hedging strategies</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Risk Tools Tab */}
            <TabsContent value="risk" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Risk Heatmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-3 bg-green-100 dark:bg-green-950/30 rounded">
                        <p className="font-semibold text-green-700 dark:text-green-400">Low Risk</p>
                        <p className="text-sm">Turkey, UAE</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-100 dark:bg-yellow-950/30 rounded">
                        <p className="font-semibold text-yellow-700 dark:text-yellow-400">Medium Risk</p>
                        <p className="text-sm">Saudi, Qatar</p>
                      </div>
                      <div className="text-center p-3 bg-red-100 dark:bg-red-950/30 rounded">
                        <p className="font-semibold text-red-700 dark:text-red-400">High Risk</p>
                        <p className="text-sm">Iraq, Lebanon</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Political Stability</span>
                        <div className="flex gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Economic Growth</span>
                        <div className="flex gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Currency Risk</span>
                        <div className="flex gap-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cross-Border Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Tax Implications</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">UAE Property Tax</span>
                            <span className="text-sm font-medium">0%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Turkey Capital Gains</span>
                            <span className="text-sm font-medium">15%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Iraq Transfer Tax</span>
                            <span className="text-sm font-medium">3%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">Legal Considerations</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Foreign ownership allowed in UAE</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span>Turkey reciprocity requirements</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span>Iraq investment minimum thresholds</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <FileText className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Investment Summary</h3>
                    <p className="text-sm text-muted-foreground mb-4">Comprehensive portfolio overview with key metrics</p>
                    <Button variant="outline" size="sm" className="w-full">Generate PDF</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <BarChart3 className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Market Analysis</h3>
                    <p className="text-sm text-muted-foreground mb-4">Regional market trends and forecasts</p>
                    <Button variant="outline" size="sm" className="w-full">Generate Report</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <Target className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">SWOT Analysis</h3>
                    <p className="text-sm text-muted-foreground mb-4">Strengths, weaknesses, opportunities, threats</p>
                    <Button variant="outline" size="sm" className="w-full">Generate SWOT</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <Shield className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Risk Assessment</h3>
                    <p className="text-sm text-muted-foreground mb-4">Detailed risk analysis and mitigation strategies</p>
                    <Button variant="outline" size="sm" className="w-full">Risk Report</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <TrendingUp className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Growth Forecast</h3>
                    <p className="text-sm text-muted-foreground mb-4">5-year growth projections and scenarios</p>
                    <Button variant="outline" size="sm" className="w-full">Forecast Report</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <Globe className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Cross-Border Guide</h3>
                    <p className="text-sm text-muted-foreground mb-4">Multi-jurisdiction investment guide</p>
                    <Button variant="outline" size="sm" className="w-full">Export Guide</Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Report Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Report Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="executive">Executive Summary</SelectItem>
                            <SelectItem value="detailed">Detailed Analysis</SelectItem>
                            <SelectItem value="comparative">Comparative Study</SelectItem>
                            <SelectItem value="forecast">Market Forecast</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Time Period</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1y">Last 12 months</SelectItem>
                            <SelectItem value="2y">Last 24 months</SelectItem>
                            <SelectItem value="5y">5-year analysis</SelectItem>
                            <SelectItem value="10y">10-year projection</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Markets</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select markets" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Markets</SelectItem>
                            <SelectItem value="mena">MENA Region</SelectItem>
                            <SelectItem value="gcc">GCC Countries</SelectItem>
                            <SelectItem value="custom">Custom Selection</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Output Format</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <Button variant="outline" size="sm">PDF</Button>
                          <Button variant="outline" size="sm">Excel</Button>
                          <Button variant="outline" size="sm">PPT</Button>
                        </div>
                      </div>
                      <div>
                        <Label>Language</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="English" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ar">العربية</SelectItem>
                            <SelectItem value="tr">Türkçe</SelectItem>
                            <SelectItem value="ku">کوردی</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full" onClick={generateReport} disabled={isGeneratingReport}>
                        {isGeneratingReport ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Generate Custom Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Investment;