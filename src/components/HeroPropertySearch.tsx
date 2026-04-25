import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { iraqCities } from "@/data/iraqCities";
import { propertyTypes } from "@/data/propertyTypes";

export function HeroPropertySearch() {
  const navigate = useNavigate();
  const [cityId, setCityId] = useState("baghdad");
  const [area, setArea] = useState("");
  const [propertyTypeId, setPropertyTypeId] = useState("house");
  const [budget, setBudget] = useState("250000");
  const [bedrooms, setBedrooms] = useState("3");

  const handleSearch = () => {
    const params = new URLSearchParams({
      city: cityId,
      district: area,
      type: propertyTypeId,
      budget,
      bedrooms,
    });
    navigate(`/buy?${params.toString()}`);
  };

  return (
    <div className="premium-card p-4 md:p-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="h-12 rounded-2xl border border-input bg-white px-4 text-sm">
          {iraqCities.map((city) => (
            <option key={city.id} value={city.id}>{city.nameEn}</option>
          ))}
        </select>
        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area / District" className="h-12 rounded-2xl border border-input bg-white px-4 text-sm" />
        <select value={propertyTypeId} onChange={(e) => setPropertyTypeId(e.target.value)} className="h-12 rounded-2xl border border-input bg-white px-4 text-sm">
          {propertyTypes.map((type) => (
            <option key={type.id} value={type.id}>{type.labelEn}</option>
          ))}
        </select>
        <select value={budget} onChange={(e) => setBudget(e.target.value)} className="h-12 rounded-2xl border border-input bg-white px-4 text-sm">
          <option value="100000">$100k+</option>
          <option value="250000">$250k+</option>
          <option value="500000">$500k+</option>
          <option value="750000">$750k+</option>
        </select>
        <div className="flex gap-3">
          <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="h-12 flex-1 rounded-2xl border border-input bg-white px-4 text-sm">
            <option value="1">1+ Beds</option>
            <option value="2">2+ Beds</option>
            <option value="3">3+ Beds</option>
            <option value="4">4+ Beds</option>
            <option value="5">5+ Beds</option>
          </select>
          <Button className="h-12 rounded-2xl px-6" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
