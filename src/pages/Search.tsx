import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";

const Search = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Advanced Property Search</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find your perfect property with our AI-powered search and filtering tools
            </p>
          </div>
          <SearchBar />
          <div className="mt-12 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-6 rounded-lg bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-2">Smart Filters</h3>
                <p className="text-muted-foreground text-sm">Advanced filtering with AI-powered suggestions</p>
              </div>
              <div className="p-6 rounded-lg bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-2">Map Search</h3>
                <p className="text-muted-foreground text-sm">Interactive map with neighborhood insights</p>
              </div>
              <div className="p-6 rounded-lg bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-2">Saved Searches</h3>
                <p className="text-muted-foreground text-sm">Get alerts for new matching properties</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;