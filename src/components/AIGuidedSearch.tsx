import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Home, MapPin, DollarSign, Calculator, TrendingUp } from "lucide-react";

interface SearchFilters {
  propertyType: string;
  priceRange: number[];
  location: string;
  bedrooms: string;
  bathrooms: string;
  size: number[];
  transactionType: string;
  features: string[];
  proximity: string[];
}

const AIGuidedSearch = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({
    propertyType: "",
    priceRange: [100000, 1000000],
    location: "",
    bedrooms: "",
    bathrooms: "",
    size: [50, 500],
    transactionType: "",
    features: [],
    proximity: []
  });

  const [aiSuggestions, setAiSuggestions] = useState([
    "Based on your budget, consider areas like Dubai Marina",
    "Properties with pools increase value by 15% in this area",
    "School proximity is high priority in family searches"
  ]);

  const steps = [
    {
      title: "What are you looking for?",
      icon: <Home className="w-6 h-6" />,
      content: "propertyType"
    },
    {
      title: "What's your budget?",
      icon: <DollarSign className="w-6 h-6" />,
      content: "budget"
    },
    {
      title: "Where do you want to live?",
      icon: <MapPin className="w-6 h-6" />,
      content: "location"
    },
    {
      title: "Property specifications",
      icon: <Calculator className="w-6 h-6" />,
      content: "specifications"
    },
    {
      title: "Features & Amenities",
      icon: <TrendingUp className="w-6 h-6" />,
      content: "features"
    }
  ];

  const propertyTypes = [
    { value: "apartment", label: "Apartment", description: "Perfect for city living" },
    { value: "villa", label: "Villa", description: "Spacious family homes" },
    { value: "office", label: "Office", description: "Commercial spaces" },
    { value: "land", label: "Land", description: "Investment opportunities" },
    { value: "warehouse", label: "Warehouse", description: "Industrial properties" },
    { value: "shop", label: "Shop", description: "Retail spaces" }
  ];

  const features = [
    "Parking", "Garden", "Balcony", "Pool", "Furnished", 
    "Elevator", "Central AC", "Heating", "Security", "Gym"
  ];

  const proximityOptions = [
    "Schools", "Hospitals", "Metro", "Mall", "Beach", "Airport"
  ];

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.content) {
      case "propertyType":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {propertyTypes.map((type) => (
                <Card 
                  key={type.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    filters.propertyType === type.value ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setFilters(prev => ({ ...prev, propertyType: type.value }))}
                >
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold text-foreground">{type.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "budget":
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Price Range: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
              </label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                max={5000000}
                min={50000}
                step={50000}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Transaction Type</label>
                <Select value={filters.transactionType} onValueChange={(value) => setFilters(prev => ({ ...prev, transactionType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                    <SelectItem value="short-term">Short-term Rent</SelectItem>
                    <SelectItem value="off-plan">Off-plan Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-4">
            <Input
              placeholder="Enter city, district, or neighborhood"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            />
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Popular Areas</h4>
              <div className="flex flex-wrap gap-2">
                {["Dubai Marina", "Downtown Dubai", "Business Bay", "JBR", "DIFC"].map((area) => (
                  <Badge 
                    key={area}
                    variant="secondary" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setFilters(prev => ({ ...prev, location: area }))}
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case "specifications":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Bedrooms</label>
                <Select value={filters.bedrooms} onValueChange={(value) => setFilters(prev => ({ ...prev, bedrooms: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5+">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Bathrooms</label>
                <Select value={filters.bathrooms} onValueChange={(value) => setFilters(prev => ({ ...prev, bathrooms: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5+">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Size: {filters.size[0]} - {filters.size[1]} sqm
              </label>
              <Slider
                value={filters.size}
                onValueChange={(value) => setFilters(prev => ({ ...prev, size: value }))}
                max={1000}
                min={20}
                step={10}
                className="w-full"
              />
            </div>
          </div>
        );

      case "features":
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Property Features</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.features.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <label className="text-sm text-foreground cursor-pointer">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Proximity Preferences</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {proximityOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.proximity.includes(option)}
                      onCheckedChange={() => {
                        setFilters(prev => ({
                          ...prev,
                          proximity: prev.proximity.includes(option)
                            ? prev.proximity.filter(p => p !== option)
                            : [...prev.proximity, option]
                        }));
                      }}
                    />
                    <label className="text-sm text-foreground cursor-pointer">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">AI-Guided Property Search</h2>
        </div>
        <p className="text-muted-foreground">
          Let our AI assistant help you find the perfect property step by step
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStep
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            {steps[currentStep].title}
          </h3>
        </div>
      </div>

      {/* AI Suggestions */}
      <Card className="mb-6 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                <p className="text-sm text-muted-foreground">{suggestion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            >
              Next Step
            </Button>
          ) : (
            <Button className="bg-gradient-primary">
              Search Properties
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGuidedSearch;