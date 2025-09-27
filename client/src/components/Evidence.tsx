interface Reference {
  source: string;
  page?: string;
}

interface EvidenceProps {
  references: Reference[];
}

export default function Evidence({ references }: EvidenceProps) {
  if (!references || references.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No references provided
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Evidence</h4>
      <div className="space-y-2">
        {references.map((ref, index) => (
          <div 
            key={index} 
            className="text-sm border-l-2 border-border pl-3"
            data-testid={`reference-${index}`}
          >
            <div className="font-medium">{ref.source}</div>
            {ref.page && (
              <div className="text-muted-foreground">Page: {ref.page}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
