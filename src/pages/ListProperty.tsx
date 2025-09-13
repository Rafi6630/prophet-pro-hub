import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Home, 
  MapPin, 
  Camera, 
  DollarSign, 
  FileText, 
  Upload,
  Building,
  Bed,
  Bath,
  Square
} from "lucide-react";

const ListProperty = () => {
  const features = [
    {
      icon: Camera,
      title: "Professional Photography",
      description: "High-quality photos to showcase your property"
    },
    {
      icon: MapPin,
      title: "Location Intelligence",
      description: "AI-powered location insights and neighborhood data"
    },
    {
      icon: DollarSign,
      title: "Smart Pricing",
      description: "AI-recommended pricing based on market analysis"
    },
    {
      icon: FileText,
      title: "Marketing Materials",
      description: "Automated generation of property descriptions and brochures"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">List Your Property</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get your property in front of thousands of qualified buyers and investors across the Gulf region
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-6 h-6 text-primary" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="property-title">Property Title</Label>
                        <Input id="property-title" placeholder="Modern Villa in Dubai Marina" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="property-type">Property Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Describe your property's unique features, amenities, and location benefits..."
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uae">United Arab Emirates</SelectItem>
                            <SelectItem value="saudi">Saudi Arabia</SelectItem>
                            <SelectItem value="qatar">Qatar</SelectItem>
                            <SelectItem value="bahrain">Bahrain</SelectItem>
                            <SelectItem value="kuwait">Kuwait</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="Dubai" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Full Address</Label>
                      <Input id="address" placeholder="Street address, area, neighborhood" />
                    </div>
                  </div>

                  {/* Property Features */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Property Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <div className="relative">
                          <Bed className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input id="bedrooms" type="number" placeholder="3" className="pl-10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <div className="relative">
                          <Bath className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input id="bathrooms" type="number" placeholder="2" className="pl-10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="area">Area (sq ft)</Label>
                        <div className="relative">
                          <Square className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input id="area" type="number" placeholder="2500" className="pl-10" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input id="price" placeholder="1,500,000" className="pl-10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="listing-type">Listing Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sale">For Sale</SelectItem>
                            <SelectItem value="rent">For Rent</SelectItem>
                            <SelectItem value="lease">For Lease</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        "Swimming Pool", "Gym", "Parking", "Garden", "Balcony", "Security",
                        "Elevator", "AC", "Furnished", "Pet Friendly", "Storage", "Laundry"
                      ].map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox id={amenity.toLowerCase().replace(' ', '-')} />
                          <Label htmlFor={amenity.toLowerCase().replace(' ', '-')} className="text-sm">
                            {amenity}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Photos</h3>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">Drag and drop photos or click to browse</p>
                      <Button variant="outline">Upload Photos</Button>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    <Home className="w-4 h-4 mr-2" />
                    List Property
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <Card className="bg-gradient-card">
                <CardHeader>
                  <CardTitle>Listing Package</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">Free</div>
                  <p className="text-muted-foreground mb-4">Basic listing with premium features</p>
                  <ul className="space-y-2 text-sm">
                    <li>✓ 30 days active listing</li>
                    <li>✓ Professional photo optimization</li>
                    <li>✓ AI-powered description enhancement</li>
                    <li>✓ Cross-platform syndication</li>
                    <li>✓ Lead management dashboard</li>
                    <li>✓ Market insights report</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Features */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListProperty;