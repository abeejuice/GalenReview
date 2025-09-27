interface BarData {
  label: string;
  value: number;
}

interface BarsProps {
  data: BarData[];
}

export default function Bars({ data }: BarsProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3" data-testid={`bar-${index}`}>
          <div className="w-20 text-sm text-right">{item.label}:</div>
          <div className="flex-1 bg-muted rounded-full h-2 relative">
            <div 
              className="bg-primary h-2 rounded-full"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-12 text-sm text-muted-foreground">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
