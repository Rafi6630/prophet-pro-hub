import PageMeta from "@/components/common/PageMeta";
import { Card, CardContent } from "@/components/ui/card";

interface StaticContentPageProps {
  title: string;
  description: string;
  body: string[];
}

export function StaticContentPage({ title, description, body }: StaticContentPageProps) {
  return (
    <div className="container mx-auto px-4 pb-24 pt-28">
      <PageMeta title={`${title} | IraqProperty`} description={description} />
      <section className="section-shell px-6 py-10 md:px-8">
        <Card className="premium-card border-0 shadow-none">
          <CardContent className="max-w-4xl p-0">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">IraqProperty</p>
            <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">{title}</h1>
            <p className="mt-4 text-base leading-8 text-foreground/70">{description}</p>
            <div className="mt-8 space-y-4">
              {body.map((paragraph) => (
                <p key={paragraph} className="text-base leading-8 text-foreground/74">{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
