import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FilterBar from "@/components/layout/FilterBar";
import QueueCard from "@/components/QueueCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Item } from "@/lib/types";

export default function Dashboard() {
  const [filters, setFilters] = useState({});
  
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['/api/items', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value as string);
          }
        }
      });
      
      const response = await fetch(`/api/items?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch items');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-muted h-32 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-muted h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FilterBar onFiltersChange={setFilters} />
      
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <i className="fas fa-inbox text-4xl mb-4"></i>
              <p>No items match your filters.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((item: Item) => (
              <QueueCard key={item.id} item={item} />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <span>{Math.min(items.length, 50)}</span> items
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled data-testid="button-prev">
                <i className="fas fa-chevron-left mr-1"></i>Previous
              </Button>
              <Button variant="outline" size="sm" data-testid="button-next">
                Next<i className="fas fa-chevron-right ml-1"></i>
              </Button>
            </div>
          </div>
        </>
      )}
      
      {/* Queue Statistics */}
      <div className="border-t border-border bg-muted/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="stat-needs-review">
                {items.filter((i: Item) => i.status === 'NEEDS_REVIEW').length}
              </div>
              <div className="text-sm text-muted-foreground">Needs Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600" data-testid="stat-changes-requested">
                {items.filter((i: Item) => i.status === 'CHANGES_REQUESTED').length}
              </div>
              <div className="text-sm text-muted-foreground">Changes Requested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600" data-testid="stat-published">
                {items.filter((i: Item) => i.status === 'PUBLISHED').length}
              </div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600" data-testid="stat-quality-issues">
                {items.filter((i: Item) => 
                  i.autoChecks?.possibleDuplicates?.length || 
                  i.autoChecks?.referenceCoverage === 'low'
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">Quality Issues</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
