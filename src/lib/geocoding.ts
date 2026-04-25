import { iraqCities } from "@/data/iraqCities";
import { publicProperties } from "@/data/sampleProperties";

export interface GeocodeResult {
  label: string;
  type: "property" | "city" | "area";
  lat: number;
  lng: number;
  cityId?: string;
  propertyId?: string;
}

const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  baghdad: { lat: 33.3152, lng: 44.3661 },
  erbil: { lat: 36.1911, lng: 44.0092 },
  mosul: { lat: 36.3456, lng: 43.1575 },
  basra: { lat: 30.5085, lng: 47.7804 },
  najaf: { lat: 31.9956, lng: 44.3147 },
  karbala: { lat: 32.6072, lng: 44.0249 },
  sulaymaniyah: { lat: 35.5613, lng: 45.4302 },
  duhok: { lat: 36.8625, lng: 42.9964 },
  kirkuk: { lat: 35.4681, lng: 44.3922 },
  nasiriyah: { lat: 31.0409, lng: 46.2573 },
};

export function geocodeIraqQuery(query: string): GeocodeResult[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const cityMatches = iraqCities
    .filter(
      (city) =>
        city.nameEn.toLowerCase().includes(trimmed) || city.nameAr.toLowerCase().includes(trimmed)
    )
    .map((city) => ({
      label: `${city.nameEn} • ${city.nameAr}`,
      type: "city" as const,
      lat: cityCoordinates[city.id]?.lat ?? 33.3152,
      lng: cityCoordinates[city.id]?.lng ?? 44.3661,
      cityId: city.id,
    }));

  const propertyMatches = publicProperties
    .filter((property) =>
      [property.title, property.titleAr, property.area, property.address]
        .join(" ")
        .toLowerCase()
        .includes(trimmed)
    )
    .map((property) => ({
      label: property.title,
      type: "property" as const,
      lat: property.lat,
      lng: property.lng,
      cityId: property.cityId,
      propertyId: property.id,
    }));

  const areaMatches = publicProperties
    .filter((property) => property.area.toLowerCase().includes(trimmed))
    .map((property) => ({
      label: `${property.area} • ${property.address}`,
      type: "area" as const,
      lat: property.lat,
      lng: property.lng,
      cityId: property.cityId,
      propertyId: property.id,
    }));

  return [...cityMatches, ...propertyMatches, ...areaMatches].slice(0, 8);
}

export function projectIraqCoordinates(lat: number, lng: number) {
  const north = 37.4;
  const south = 29.9;
  const west = 38.8;
  const east = 48.8;

  const x = ((lng - west) / (east - west)) * 100;
  const y = (1 - (lat - south) / (north - south)) * 100;

  return {
    x: Math.min(Math.max(x, 4), 96),
    y: Math.min(Math.max(y, 6), 94),
  };
}
