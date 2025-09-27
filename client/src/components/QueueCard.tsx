import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Item } from "@/lib/types";

interface QueueCardProps {
  item: Item;
}

export default function QueueCard({ item }: QueueCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEEDS_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'CHANGES_REQUESTED': return 'bg-red-100 text-red-800';
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCoverageColor = (coverage?: string) => {
    switch (coverage) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasQualityIssues = item.autoChecks?.possibleDuplicates?.length || 
                          item.autoChecks?.referenceCoverage === 'low';

  return (
    <Link href={`/item/${item.id}`}>
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer" 
        data-testid={`card-item-${item.id}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <i className={`fas ${item.type === 'FLASHCARD' ? 'fa-sticky-note' : 'fa-question-circle'} text-primary`}></i>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {item.type}
              </Badge>
            </div>
            <div className="flex space-x-1">
              {item.autoChecks?.possibleDuplicates?.length && (
                <Badge variant="destructive" className="text-xs">
                  <i className="fas fa-exclamation-triangle mr-1"></i>DUP
                </Badge>
              )}
              {item.autoChecks?.referenceCoverage === 'low' && (
                <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                  <i className="fas fa-exclamation-triangle mr-1"></i>LOW_COV
                </Badge>
              )}
              {!hasQualityIssues && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  <i className="fas fa-check mr-1"></i>CLEAN
                </Badge>
              )}
            </div>
          </div>
          
          <h3 className="font-semibold text-foreground mb-2" data-testid={`text-title-${item.id}`}>
            {item.subject} - {item.topic}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {item.subject} • {item.topic}
          </p>
          
          <div className="space-y-2">
            {item.autoChecks?.groundednessScore && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Groundedness:</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(item.autoChecks.groundednessScore / 5) * 100} 
                    className="w-16 h-1.5"
                  />
                  <span className="text-muted-foreground">
                    {item.autoChecks.groundednessScore}/5
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Reference Coverage:</span>
              <Badge 
                variant="secondary" 
                className={getCoverageColor(item.autoChecks?.referenceCoverage)}
              >
                {(item.autoChecks?.referenceCoverage || 'unknown').toUpperCase()}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {item.bloom && (
              <Badge variant="outline" className="text-xs">
                {item.bloom}
              </Badge>
            )}
            {item.difficulty && (
              <Badge variant="outline" className="text-xs">
                {item.difficulty}
              </Badge>
            )}
            <Badge className={getStatusColor(item.status)}>
              {item.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
