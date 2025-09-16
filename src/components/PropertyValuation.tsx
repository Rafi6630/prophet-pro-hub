import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Shield, BarChart3, Brain } from "lucide-react";

interface ValuationData {
  currentValue: number;
  confidenceScore: number;
  priceRange: { min: number; max: number };
  marketTrend: 'up' | 'down' | 'stable';
  growthScore: number;
  comparables: Array<{
    address: string;
    price: number;
    sqm: number;
    similarity: number;
  }>;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

const PropertyValuation = ({ propertyId }: { propertyId?: string }) => {
  const [loading, setLoading] = useState(false);
  const [valuation, setValuation] = useState<ValuationData>({
    currentValue: 1250000,
    confidenceScore: 94,
    priceRange: { min: 1180000, max: 1320000 },
    marketTrend: 'up',
    growthScore: 85,
    comparables: [
      { address: "Dubai Marina, Tower A", price: 1200000, sqm: 120, similarity: 92 },
      { address: "Dubai Marina, Tower B", price: 1280000, sqm: 125, similarity: 89 },
      { address: "Dubai Marina, Tower C", price: 1300000, sqm: 130, similarity: 87 }
    ],
    swotAnalysis: {
      strengths: [
        "Prime waterfront location",
        "High-quality finishes",
        "Excellent building amenities",
        "Strong rental demand"
      ],
      weaknesses: [
        "High service charges",
        "Limited parking spaces",
        "Older building infrastructure"
      ],
      opportunities: [
        "Upcoming metro extension",
        "New commercial developments nearby",
        "Growing tourism sector"
      ],
      threats: [
        "Market oversupply risk",
        "Economic uncertainty",
        "Regulatory changes"
      ]
    }
  });

  const generateValuation = async () => {
    setLoading(true);
    // Simulate AI valuation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Target className="w-4 h-4 text-warning" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 80) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">AI Property Valuation</h2>
        </div>
        <Button onClick={generateValuation} disabled={loading}>
          {loading ? "Analyzing..." : "Get AI Valuation"}
        </Button>
      </div>

      {/* Main Valuation Card */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Market Value</span>
            <Badge variant={valuation.confidenceScore >= 90 ? "default" : "secondary"}>
              <Shield className="w-3 h-3 mr-1" />
              {valuation.confidenceScore}% Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                ${valuation.currentValue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Range: ${valuation.priceRange.min.toLocaleString()} - ${valuation.priceRange.max.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getTrendIcon(valuation.marketTrend)}
                <span className="text-lg font-semibold text-foreground">
                  Market Trend
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {valuation.marketTrend === 'up' ? 'Increasing' : 
                 valuation.marketTrend === 'down' ? 'Decreasing' : 'Stable'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-2">
                {valuation.growthScore}/100
              </div>
              <div className="text-sm text-muted-foreground">Growth Score</div>
              <Progress value={valuation.growthScore} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparable Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Comparable Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {valuation.comparables.map((comp, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium text-foreground">{comp.address}</div>
                    <div className="text-sm text-muted-foreground">{comp.sqm} sqm</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">${comp.price.toLocaleString()}</div>
                    <Badge variant="outline" className="text-xs">
                      {comp.similarity}% match
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SWOT Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>SWOT Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-success mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {valuation.swotAnalysis.strengths.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-success rounded-full mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-destructive mb-2">Weaknesses</h4>
                <ul className="space-y-1">
                  {valuation.swotAnalysis.weaknesses.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-info mb-2">Opportunities</h4>
                <ul className="space-y-1">
                  {valuation.swotAnalysis.opportunities.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-info rounded-full mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-warning mb-2">Threats</h4>
                <ul className="space-y-1">
                  {valuation.swotAnalysis.threats.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Brain className="w-8 h-8 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">AI Market Insights</h3>
              <p className="text-sm opacity-90">
                Based on current market conditions, comparable sales, and predictive modeling, 
                this property shows strong investment potential. The waterfront location and 
                upcoming infrastructure developments are key value drivers. Consider the timing 
                of market entry and potential for capital appreciation over the next 3-5 years.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyValuation;