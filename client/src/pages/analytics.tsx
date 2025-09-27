import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Bars from "@/components/Bars";

interface AnalyticsData {
  throughput: {
    submitted: number;
    published: number;
    changesRequested: number;
  };
  qualityFlags: {
    itemsWithDuplicates: number;
    itemsWithLowCoverage: number;
  };
  coverageBySubject: Array<{
    subject: string;
    count: number;
  }>;
}

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics'],
    queryFn: async () => {
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json() as Promise<AnalyticsData>;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-muted h-64 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  const throughputData = [
    { label: 'Submitted', value: analytics.throughput.submitted },
    { label: 'Published', value: analytics.throughput.published },
    { label: 'Changes', value: analytics.throughput.changesRequested },
  ];

  const flagsData = [
    { label: 'Duplicates', value: analytics.qualityFlags.itemsWithDuplicates },
    { label: 'Low Coverage', value: analytics.qualityFlags.itemsWithLowCoverage },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      {/* Throughput */}
      <Card>
        <CardHeader>
          <CardTitle>Throughput (7d)</CardTitle>
        </CardHeader>
        <CardContent data-testid="chart-throughput">
          <Bars data={throughputData} />
        </CardContent>
      </Card>

      {/* Quality Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Quality flags (total)</CardTitle>
        </CardHeader>
        <CardContent data-testid="chart-quality-flags">
          <Bars data={flagsData} />
        </CardContent>
      </Card>

      {/* Coverage by Subject */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage by subject</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2" data-testid="coverage-by-subject">
            {analytics.coverageBySubject.map((item) => (
              <div
                key={item.subject}
                className="flex justify-between items-center text-sm"
                data-testid={`coverage-${item.subject.toLowerCase()}`}
              >
                <span className="font-medium">{item.subject}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
            ))}
            {analytics.coverageBySubject.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No coverage data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
