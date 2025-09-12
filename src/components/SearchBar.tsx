import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Filter } from "lucide-react";
import { useState } from "react";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", searchQuery, "in", location);
    // Here you would implement actual search functionality
  };

  return (
    <section id="search-section" className="relative -mt-16 pb-20">
      <div className="container mx-auto px-4">
        <div className="bg-card border border-border rounded-xl shadow-lg p-6 max-w-4xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search properties, neighborhoods, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-background border-input"
                />
              </div>
            </div>
            
            <div className="md:col-span-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Location (City, District, Area)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12 bg-background border-input"
                />
              </div>
            </div>
            
            <div className="md:col-span-3 flex gap-2">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-12 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <Button
                onClick={handleSearch}
                size="lg"
                className="flex-1 h-12 bg-primary hover:bg-primary-glow text-primary-foreground"
              >
                Search
              </Button>
            </div>
          </div>
          
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Quick Filters:</span>
            {["Residential", "Commercial", "Industrial", "Land", "For Sale", "For Rent"].map((filter) => (
              <Button
                key={filter}
                variant="outline"
                size="sm"
                className="text-xs hover:bg-accent hover:text-accent-foreground"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;