import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface FilterBarProps {
  onFiltersChange: (filters: {
    subject?: string;
    topic?: string;
    type?: string;
    status?: string;
    flags?: string[];
  }) => void;
}

export default function FilterBar({ onFiltersChange }: FilterBarProps) {
  const [filters, setFilters] = useState({
    subject: 'all',
    topic: 'all',
    type: 'all',
    status: 'all',
    flags: [] as string[],
  });

  const updateFilters = (key: string, value: string | string[]) => {
    // Convert "all" to empty string for API compatibility
    const apiValue = value === 'all' ? '' : value;
    const newFilters = { ...filters, [key]: apiValue };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleFlagChange = (flag: string, checked: boolean) => {
    const newFlags = checked
      ? [...filters.flags, flag]
      : filters.flags.filter(f => f !== flag);
    updateFilters('flags', newFlags);
  };

  const clearFilters = () => {
    const clearedFilters = {
      subject: 'all',
      topic: 'all',
      type: 'all',
      status: 'all',
      flags: [],
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Subject Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Subject:</label>
            <Select value={filters.subject} onValueChange={(value) => updateFilters('subject', value)}>
              <SelectTrigger className="w-40" data-testid="filter-subject">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
                <SelectItem value="anatomy">Anatomy</SelectItem>
                <SelectItem value="pathology">Pathology</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Topic Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Topic:</label>
            <Select value={filters.topic} onValueChange={(value) => updateFilters('topic', value)}>
              <SelectTrigger className="w-40" data-testid="filter-topic">
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                <SelectItem value="gi-bleeding">GI Bleeding</SelectItem>
                <SelectItem value="trachea">Trachea</SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Type:</label>
            <Select value={filters.type} onValueChange={(value) => updateFilters('type', value)}>
              <SelectTrigger className="w-32" data-testid="filter-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="FLASHCARD">Flashcard</SelectItem>
                <SelectItem value="MCQ">MCQ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Status:</label>
            <Select value={filters.status} onValueChange={(value) => updateFilters('status', value)}>
              <SelectTrigger className="w-40" data-testid="filter-status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="NEEDS_REVIEW">Needs Review</SelectItem>
                <SelectItem value="CHANGES_REQUESTED">Changes Requested</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality Flags */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Flags:</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <Checkbox 
                  checked={filters.flags.includes('duplicates')}
                  onCheckedChange={(checked) => handleFlagChange('duplicates', checked as boolean)}
                  data-testid="flag-duplicates"
                />
                <span className="text-sm">Duplicates</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox 
                  checked={filters.flags.includes('low_coverage')}
                  onCheckedChange={(checked) => handleFlagChange('low_coverage', checked as boolean)}
                  data-testid="flag-low-coverage"
                />
                <span className="text-sm">Low Coverage</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox 
                  checked={filters.flags.includes('conflicts')}
                  onCheckedChange={(checked) => handleFlagChange('conflicts', checked as boolean)}
                  data-testid="flag-conflicts"
                />
                <span className="text-sm">Conflicts</span>
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-clear-filters"
          >
            <i className="fas fa-times mr-1"></i>Clear filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
