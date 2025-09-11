import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AIShowcase from "@/components/AIShowcase";
import UserTypes from "@/components/UserTypes";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <AIShowcase />
      <UserTypes />
      <Footer />
    </div>
  );
};

export default Index;
