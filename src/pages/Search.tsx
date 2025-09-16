import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import AIGuidedSearch from "@/components/AIGuidedSearch";
import PropertyValuation from "@/components/PropertyValuation";
import InvestmentAnalysis from "@/components/InvestmentAnalysis";
import AIAssistant from "@/components/AIAssistant";
import PropertyMessaging from "@/components/PropertyMessaging";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Search = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">TerraVista AI Platform</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of real estate with our comprehensive AI-powered platform featuring guided search, 
              property valuation, investment analysis, and intelligent assistance
            </p>
          </div>

          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="search">AI Search</TabsTrigger>
              <TabsTrigger value="valuation">Valuation</TabsTrigger>
              <TabsTrigger value="investment">Investment</TabsTrigger>
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
              <TabsTrigger value="messaging">Messaging</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">AI-Guided Property Search</h2>
                <p className="text-muted-foreground">
                  Let our AI assistant guide you through an intelligent search process
                </p>
              </div>
              <AIGuidedSearch />
            </TabsContent>

            <TabsContent value="valuation" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">AI Property Valuation</h2>
                <p className="text-muted-foreground">
                  Get instant, accurate property valuations with confidence scores and market analysis
                </p>
              </div>
              <PropertyValuation />
            </TabsContent>

            <TabsContent value="investment" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">Investment Analysis Tools</h2>
                <p className="text-muted-foreground">
                  Comprehensive ROI, IRR analysis with scenario modeling and market forecasting
                </p>
              </div>
              <InvestmentAnalysis />
            </TabsContent>

            <TabsContent value="assistant" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">AI Real Estate Assistant</h2>
                <p className="text-muted-foreground">
                  Chat with our multilingual AI assistant for personalized real estate advice
                </p>
              </div>
              <AIAssistant />
            </TabsContent>

            <TabsContent value="messaging" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">Property Messaging</h2>
                <p className="text-muted-foreground">
                  Secure messaging with buyers, sellers, and agents with AI-powered assistance
                </p>
              </div>
              <PropertyMessaging />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;