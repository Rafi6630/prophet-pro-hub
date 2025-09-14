import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import Features from "@/components/Features";
import UserTypes from "@/components/UserTypes";
import AIShowcase from "@/components/AIShowcase";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import MarketStats from "@/components/MarketStats";
import PropertyShowcase from "@/components/PropertyShowcase";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <SearchBar />
      <MarketStats />
      <PropertyShowcase />
      <Features />
      <UserTypes />
      <AIShowcase />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
