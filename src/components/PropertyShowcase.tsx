import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, Star, TrendingUp } from "lucide-react";

const PropertyShowcase = () => {
  const featuredProperties = [
    {
      id: 1,
      title: "Modern Villa in Dubai Marina",
      price: "$1,250,000",
      location: "Dubai Marina, UAE",
      bedrooms: 4,
      bathrooms: 3,
      area: "2,500 sqft",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
      aiScore: 9.2,
      roiPotential: "12.5%",
      type: "sale",
      isAiRecommended: true
    },
    {
      id: 2,
      title: "Luxury Apartment in Riyadh",
      price: "SAR 850,000",
      location: "King Abdullah Financial District",
      bedrooms: 3,
      bathrooms: 2,
      area: "1,800 sqft",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
      aiScore: 8.8,
      roiPotential: "10.2%",
      type: "sale",
      isAiRecommended: false
    },
    {
      id: 3,
      title: "Commercial Space in Doha",
      price: "QAR 2,500/month",
      location: "West Bay, Qatar",
      bedrooms: 0,
      bathrooms: 2,
      area: "1,200 sqft",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
      aiScore: 9.0,
      roiPotential: "15.8%",
      type: "rent",
      isAiRecommended: true
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            AI-Curated Properties
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover premium properties with AI-powered valuations and investment insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <Card key={property.id} className="group hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {property.isAiRecommended && (
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    AI Recommended
                  </Badge>
                )}
                <Badge 
                  variant="secondary" 
                  className="absolute top-3 right-3 bg-background/90 text-foreground"
                >
                  {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-muted-foreground text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {property.price}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.bathrooms}
                  </div>
                  <div className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    {property.area}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {property.aiScore}/10
                    </div>
                    <div className="text-xs text-muted-foreground">
                      AI Score
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-green-600 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {property.roiPotential}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ROI Potential
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="px-8">
            Explore All Properties
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PropertyShowcase;