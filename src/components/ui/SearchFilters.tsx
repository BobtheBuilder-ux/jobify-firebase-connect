
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Slider
} from '@/components/ui/slider';

interface SearchFiltersProps {
  onSearch: (filters: {
    query: string;
    location: string;
    jobType: string;
    salaryRange: [number, number];
  }) => void;
}

const SearchFilters = ({ onSearch }: SearchFiltersProps) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [salaryRange, setSalaryRange] = useState<[number, number]>([30000, 150000]);

  const handleSearch = () => {
    onSearch({
      query,
      location,
      jobType,
      salaryRange
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search query */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Job title or keyword"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Location */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Job Type */}
        <Select value={jobType} onValueChange={setJobType}>
          <SelectTrigger>
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
          </SelectContent>
        </Select>

        {/* Salary Range */}
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>More Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Salary Range</h4>
                <div className="px-1">
                  <Slider
                    defaultValue={[30000, 150000]}
                    min={0}
                    max={300000}
                    step={5000}
                    onValueChange={(value) => setSalaryRange(value as [number, number])}
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <div>${salaryRange[0].toLocaleString()}</div>
                    <div>${salaryRange[1].toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={handleSearch} className="flex-1">
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
