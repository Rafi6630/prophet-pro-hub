import { TrendingUp, Building, Users, DollarSign } from "lucide-react";

const MarketStats = () => {
  const stats = [
    {
      icon: <Building className="h-8 w-8 text-primary" />,
      value: "500K+",
      label: "Properties Listed",
      trend: "+12% this month"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      value: "100K+",
      label: "Active Users",
      trend: "+25% this quarter"
    },
    {
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      value: "$2.5B+",
      label: "Properties Valued",
      trend: "99.2% accuracy"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      value: "15%",
      label: "Avg. ROI Increase",
      trend: "AI-powered insights"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            TerraVista Market Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering real estate decisions with AI-driven insights and global connectivity
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {stat.label}
                </div>
                <div className="text-xs text-primary font-medium">
                  {stat.trend}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketStats;