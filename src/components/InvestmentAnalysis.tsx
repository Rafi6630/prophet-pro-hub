import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, PieChart, BarChart3, Target, DollarSign } from "lucide-react";

interface InvestmentMetrics {
  roi: number;
  irr: number;
  cashFlow: number;
  paybackPeriod: number;
  netPresentValue: number;
  growthScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  rentalYield: number;
}

const InvestmentAnalysis = () => {
  const [inputs, setInputs] = useState({
    purchasePrice: 1000000,
    downPayment: 200000,
    loanAmount: 800000,
    interestRate: 4.5,
    rentalIncome: 8000,
    expenses: 2000,
    appreciationRate: 5,
    holdingPeriod: 10
  });

  const [metrics, setMetrics] = useState<InvestmentMetrics>({
    roi: 15.2,
    irr: 12.8,
    cashFlow: 6000,
    paybackPeriod: 8.5,
    netPresentValue: 185000,
    growthScore: 78,
    riskLevel: 'Medium',
    rentalYield: 9.6
  });

  const [scenarios, setScenarios] = useState([
    { name: "Conservative", roi: 12.1, irr: 9.5, description: "Market growth slows" },
    { name: "Base Case", roi: 15.2, irr: 12.8, description: "Current projections" },
    { name: "Optimistic", roi: 18.7, irr: 16.2, description: "Strong market growth" }
  ]);

  const calculateMetrics = () => {
    // Simplified calculation logic for demo
    const annualRental = inputs.rentalIncome * 12;
    const annualExpenses = inputs.expenses * 12;
    const netAnnualIncome = annualRental - annualExpenses;
    
    const newMetrics: InvestmentMetrics = {
      roi: (netAnnualIncome / inputs.downPayment) * 100,
      irr: ((netAnnualIncome + (inputs.purchasePrice * inputs.appreciationRate / 100)) / inputs.purchasePrice) * 100,
      cashFlow: netAnnualIncome,
      paybackPeriod: inputs.downPayment / netAnnualIncome,
      netPresentValue: netAnnualIncome * inputs.holdingPeriod - inputs.downPayment,
      growthScore: Math.min(100, inputs.appreciationRate * 15),
      riskLevel: inputs.appreciationRate > 6 ? 'High' : inputs.appreciationRate > 3 ? 'Medium' : 'Low',
      rentalYield: (annualRental / inputs.purchasePrice) * 100
    };
    
    setMetrics(newMetrics);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'High': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Investment Analysis</h2>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={inputs.purchasePrice}
                      onChange={(e) => setInputs(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="downPayment">Down Payment ($)</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={inputs.downPayment}
                      onChange={(e) => setInputs(prev => ({ ...prev, downPayment: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={inputs.interestRate}
                      onChange={(e) => setInputs(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rentalIncome">Monthly Rental Income ($)</Label>
                    <Input
                      id="rentalIncome"
                      type="number"
                      value={inputs.rentalIncome}
                      onChange={(e) => setInputs(prev => ({ ...prev, rentalIncome: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="expenses">Monthly Expenses ($)</Label>
                    <Input
                      id="expenses"
                      type="number"
                      value={inputs.expenses}
                      onChange={(e) => setInputs(prev => ({ ...prev, expenses: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="appreciationRate">Annual Appreciation Rate (%)</Label>
                    <Input
                      id="appreciationRate"
                      type="number"
                      step="0.1"
                      value={inputs.appreciationRate}
                      onChange={(e) => setInputs(prev => ({ ...prev, appreciationRate: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="holdingPeriod">Holding Period (years)</Label>
                    <Input
                      id="holdingPeriod"
                      type="number"
                      value={inputs.holdingPeriod}
                      onChange={(e) => setInputs(prev => ({ ...prev, holdingPeriod: Number(e.target.value) }))}
                    />
                  </div>
                  <Button onClick={calculateMetrics} className="w-full">
                    Calculate Returns
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{metrics.roi.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">ROI</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{metrics.irr.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">IRR</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-info mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">${metrics.cashFlow.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Annual Cash Flow</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-warning mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{metrics.paybackPeriod.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Payback (years)</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Growth Score</span>
                    <span className="text-sm text-muted-foreground">{metrics.growthScore}/100</span>
                  </div>
                  <Progress value={metrics.growthScore} className="mb-4" />
                  <div className="text-xs text-muted-foreground">
                    Based on market trends and location factors
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground mb-2">Risk Level</div>
                  <Badge variant="outline" className={getRiskColor(metrics.riskLevel)}>
                    {metrics.riskLevel} Risk
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-2">
                    Assessment based on market volatility
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground mb-2">Key Metrics</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rental Yield:</span>
                      <span className="text-foreground">{metrics.rentalYield.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NPV:</span>
                      <span className="text-foreground">${metrics.netPresentValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scenarios.map((scenario, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{scenario.name}</h3>
                      <div className="flex gap-4">
                        <span className="text-sm text-muted-foreground">
                          ROI: <span className="font-medium text-foreground">{scenario.roi}%</span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          IRR: <span className="font-medium text-foreground">{scenario.irr}%</span>
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                5-Year Market Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-4">Projected Returns</h4>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((year) => (
                      <div key={year} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Year {year}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={60 + year * 5} className="w-20" />
                          <span className="text-sm font-medium text-foreground">
                            {(12 + year * 1.5).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-4">Market Outlook</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-success rounded-full mt-2" />
                      <span className="text-muted-foreground">
                        Strong population growth expected
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-info rounded-full mt-2" />
                      <span className="text-muted-foreground">
                        Infrastructure development plans
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2" />
                      <span className="text-muted-foreground">
                        Interest rate volatility risk
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentAnalysis;