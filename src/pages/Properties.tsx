import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square } from "lucide-react";

const Properties = () => {
  const properties = [
    {
      id: 1,
      title: "Modern Villa in Dubai Marina",
      price: "$2,500,000",
      location: "Dubai Marina, UAE",
      bedrooms: 4,
      bathrooms: 3,
      area: "3,200 sq ft",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80",
      type: "Villa"
    },
    {
      id: 2,
      title: "Luxury Apartment in Riyadh",
      price: "$850,000",
      location: "King Fahd District, Riyadh",
      bedrooms: 3,
      bathrooms: 2,
      area: "2,100 sq ft",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80",
      type: "Apartment"
    },
    {
      id: 3,
      title: "Commercial Tower in Istanbul",
      price: "$5,200,000",
      location: "Maslak, Istanbul",
      bedrooms: 0,
      bathrooms: 0,
      area: "15,000 sq ft",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80",
      type: "Commercial"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Properties</h1>
          <p className="text-muted-foreground">Browse our extensive collection of premium properties</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                  {property.type}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{property.title}</CardTitle>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary mb-4">{property.price}</div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      <span>{property.bedrooms} beds</span>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      <span>{property.bathrooms} baths</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Square className="w-4 h-4 mr-1" />
                    <span>{property.area}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Properties;