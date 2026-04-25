import { useParams } from "react-router-dom";
import PageMeta from "@/components/common/PageMeta";
import { PropertyCard } from "@/components/PropertyCard";
import { Card, CardContent } from "@/components/ui/card";
import { iraqCities } from "@/data/iraqCities";
import { publicProperties } from "@/data/sampleProperties";
import { enrichProperty } from "@/lib/propertyMetrics";
import { createCityCollectionSchema } from "@/lib/structuredData";

export function CityLandingPage() {
  const { citySlug } = useParams();
  const city = iraqCities.find((item) => item.id === citySlug);
  const listings = publicProperties
    .filter((property) => property.cityId === citySlug)
    .map(enrichProperty);

  if (!city) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 pb-24 pt-28">
      <PageMeta
        title={`${city.nameEn} Properties | IraqProperty`}
        description={`Verified ${city.nameEn} properties, fair pricing, and buyer intelligence from IraqProperty.`}
        structuredData={createCityCollectionSchema(`${city.nameEn} Properties`, `https://iraqproperty.vercel.app/${city.id}-properties`)}
      />
      <section className="section-shell px-6 py-10 md:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{city.nameAr}</p>
          <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">{city.nameEn} Properties</h1>
          <p className="mt-4 text-base leading-8 text-foreground/68">
            Buyer-focused property intelligence for {city.nameEn}, including trusted sellers, area growth, and clearer market pricing.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {listings.length ? (
            listings.map((property) => <PropertyCard key={property.id} property={property} />)
          ) : (
            <Card className="premium-card lg:col-span-3">
              <CardContent className="p-8">
                <p className="text-lg font-semibold">Listings for this city are being prepared.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
