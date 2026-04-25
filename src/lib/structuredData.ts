export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IraqProperty",
    slogan: "Know Everything Before You Buy",
    url: "https://iraqproperty.vercel.app",
  };
}

export function createCityCollectionSchema(name: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url,
  };
}
